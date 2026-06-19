import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import Resume from "../models/resume.model.js";
import User from "../models/user.model.js";

// ─── PDF text extractor ────────────────────────────────────────────────────
const extractTextFromPDF = async (filepath) => {
  const fileBuffer = await fs.promises.readFile(filepath);
  const uint8Array = new Uint8Array(fileBuffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }
  return text.replace(/\s+/g, " ").trim();
};

// ─── Strip markdown code fences from AI response ───────────────────────────
const cleanJson = (str) =>
  str.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

// ─── ATS ANALYZER ─────────────────────────────────────────────────────────
export const analyzeAts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Resume required" });

    const user = await User.findById(req.userId);
    if (!user || user.credits < 50) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: "Insufficient credits. Each operation requires 50 credits." });
    }

    const resumeText = await extractTextFromPDF(req.file.path);
    fs.unlinkSync(req.file.path);

    const messages = [
      {
        role: "system",
        content: `You are an expert ATS (Applicant Tracking System) analyzer.
Evaluate the provided resume and return ONLY valid JSON (no markdown, no code fences).
{
  "score": <0-100 number>,
  "keywordCoverage": <0-100 number>,
  "missingKeywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "formattingSuggestions": ["suggestion1", "suggestion2"],
  "contentSuggestions": ["suggestion1", "suggestion2"]
}`,
      },
      { role: "user", content: resumeText },
    ];

    const aiResponse = await askAi(messages);
    const analysis = JSON.parse(cleanJson(aiResponse));

    user.credits -= 50;
    await user.save();

    return res.status(200).json(analysis);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Failed to analyze resume" });
  }
};

// ─── RESUME CUSTOMIZER ─────────────────────────────────────────────────────
export const customizeResume = async (req, res) => {
  try {
    const { jobDescription, latexCode, socialLinks, customInstructions } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Job description required" });

    const user = await User.findById(req.userId);
    if (!user || user.credits < 50) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: "Insufficient credits. Each operation requires 50 credits." });
    }

    let resumeText;

    if (latexCode && latexCode.trim()) {
      resumeText = `[Input is LaTeX source code — parse it as a resume document]\n\n${latexCode}`;
    } else if (req.file) {
      resumeText = await extractTextFromPDF(req.file.path);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ message: "Resume (PDF or LaTeX code) required" });
    }

    const socialNote = socialLinks?.trim()
      ? `\n\n[CONTACT LINKS TO INCLUDE — must appear in the contact section]\n${socialLinks}`
      : "";

    const customNote = customInstructions?.trim()
      ? `\n\n[CUSTOM INSTRUCTIONS FROM CANDIDATE — follow these strictly]\n${customInstructions}`
      : "";

    const systemPrompt = `You are an aggressive, expert resume writer optimizing for ATS and recruiter impact.

YOUR PRIMARY GOAL: Make this resume STRONGLY match the job description by rewriting bullet points to use the EXACT keywords, technologies, and action verbs from the JD. Be bold — rewrite sentences substantially, not just swap a word or two.

MANDATORY OPTIMIZATION RULES:
1. REWRITE 70-80% of each bullet point to incorporate JD-specific keywords, tools, and methodologies. Do not just change a single word.
2. Add JD-relevant quantifiers or impact statements where they fit naturally ("improving X by reducing latency", "enabling real-time Y").
3. Integrate exact terms from the JD (role titles, tools, frameworks, processes) directly into bullet text.
4. Skills section: ADD any skills from the JD that the candidate plausibly has based on their projects (e.g., if they used FastAPI they know REST APIs).
5. Professional Summary: Completely rewrite it to mirror the JD's language and target role.
6. Do NOT invent degrees, companies, or project names that don't exist.
7. PRESERVE every section — Education, Achievements, Leadership, ALL of it — none can be skipped.
8. Include ALL user-provided social links in the contact section.
9. Return ONLY raw valid JSON — no markdown, no code fences, no text outside the JSON.

For the "diff" array: you MUST include an entry for EVERY section you changed, showing clearly what was original vs what you rewrote. This is critical — do not leave diff empty.

Return this exact JSON structure:
{
  "atsScoreBefore": <0-100 integer>,
  "atsScoreAfter": <0-100 integer>,
  "resume": {
    "name": "<FULL NAME UPPERCASE>",
    "contact": {
      "phone": "<phone or empty>",
      "email": "<email or empty>",
      "linkedin": "<url or empty>",
      "github": "<url or empty>",
      "other": "<other urls or empty>"
    },
    "sections": [
      {
        "title": "PROFESSIONAL SUMMARY",
        "type": "text",
        "content": "<COMPLETELY REWRITTEN paragraph using JD language and target role>"
      },
      {
        "title": "EDUCATION",
        "type": "entries",
        "items": [
          { "title": "<Institution>", "subtitle": "<Degree | GPA>", "location": "<City>", "date": "<dates>", "bullets": [] }
        ]
      },
      {
        "title": "TECHNICAL SKILLS",
        "type": "skills",
        "items": [
          { "label": "<Category>", "value": "<values — ADD JD-relevant skills here>" }
        ]
      },
      {
        "title": "PROJECTS",
        "type": "projects",
        "items": [
          { "name": "<Project>", "tech": "<Tech>", "bullets": ["<SUBSTANTIALLY REWRITTEN bullet using JD keywords>"] }
        ]
      },
      {
        "title": "LEADERSHIP AND EXTRACURRICULAR ACTIVITIES",
        "type": "entries",
        "items": [
          { "title": "<Org>", "subtitle": "<Role>", "location": "<Location>", "date": "<dates>", "bullets": ["<bullet>"] }
        ]
      },
      {
        "title": "ACHIEVEMENTS",
        "type": "bullets",
        "items": ["<achievement bullet text — no leading dash>"]
      }
    ]
  },
  "diff": [
    {
      "section": "<Section Name>",
      "original": "<EXACT original text from resume>",
      "optimized": "<Your substantially rewritten version>"
    }
  ]
}

IMPORTANT: Include only sections that exist in the original resume. Use correct "type" for each.`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `TARGET JOB DESCRIPTION:\n${jobDescription}\n\nORIGINAL RESUME:\n${resumeText}${socialNote}${customNote}`,
      },
    ];

    const aiResponse = await askAi(messages);
    const cleaned = cleanJson(aiResponse);
    const result = JSON.parse(cleaned);

    const resumeDoc = await Resume.create({
      userId: req.userId,
      originalText: resumeText,
      jobDescription,
      customizedText: JSON.stringify(result.resume),
      atsScoreBefore: result.atsScoreBefore,
      atsScoreAfter: result.atsScoreAfter,
      diff: result.diff || [],
    });

    user.credits -= 50;
    await user.save();

    return res.status(200).json({
      id: resumeDoc._id,
      atsScoreBefore: result.atsScoreBefore,
      atsScoreAfter: result.atsScoreAfter,
      resume: result.resume,
      diff: result.diff || [],
    });
  } catch (error) {
    console.error("customizeResume error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Failed to customize resume: " + error.message });
  }
};

// ─── GET RESUME VERSIONS ───────────────────────────────────────────────────
export const getResumeVersions = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("createdAt atsScoreBefore atsScoreAfter jobDescription");
    return res.status(200).json(resumes);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch resume versions" });
  }
};

// ─── COVER LETTER GENERATOR ────────────────────────────────────────────────
export const generateCoverLetter = async (req, res) => {
  try {
    const { jobDescription, latexCode, socialLinks } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Job description required" });

    const user = await User.findById(req.userId);
    if (!user || user.credits < 50) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: "Insufficient credits. Each operation requires 50 credits." });
    }

    let resumeText;
    if (latexCode && latexCode.trim()) {
      resumeText = `[LaTeX resume source]\n\n${latexCode}`;
    } else if (req.file) {
      resumeText = await extractTextFromPDF(req.file.path);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ message: "Resume (PDF or LaTeX) required" });
    }

    const socialNote =
      socialLinks && socialLinks.trim()
        ? `\n\nUser contact links: ${socialLinks}`
        : "";

    const messages = [
      {
        role: "system",
        content: `You are an expert career coach and professional writer.
Write a compelling, professional cover letter tailored to the job description using the candidate's experience.
Do not invent facts. Highlight the most relevant skills and achievements.
Keep it to 3 or 4 concise paragraphs.
Return ONLY the cover letter text, no markdown, no extra explanations.
Include placeholder brackets like [Company Name] or [Hiring Manager] where context is missing.`,
      },
      {
        role: "user",
        content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}${socialNote}`,
      },
    ];

    const aiResponse = await askAi(messages);

    user.credits -= 50;
    await user.save();

    return res.status(200).json({ coverLetter: aiResponse });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Failed to generate cover letter" });
  }
};
