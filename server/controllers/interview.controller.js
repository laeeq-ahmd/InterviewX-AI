import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import { chunkResume } from "../utils/resumeChunker.js";
import { upsertResumeChunks, searchResumeContext } from "../services/chroma.service.js";

// ─────────────────────────────────────────────
// ANALYZE RESUME — unchanged from original
// ─────────────────────────────────────────────
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];

    const aiResponse = await askAi(messages)
    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath)

    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// GENERATE QUESTIONS — upgraded: structured flow + conversation init
// ─────────────────────────────────────────────
export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.credits < 50) {
      return res.status(400).json({ message: "Not enough credits. Minimum 50 required." });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";
    const hasResume = safeResume !== "None";

    let retrievedContext = "None";
    let chunks = [];

    if (hasResume) {
      chunks = chunkResume(safeResume);
      // Upsert chunks to ChromaDB
      await upsertResumeChunks(user._id, chunks);

      // Search for relevant context
      const query = `${role} ${mode} ${projectText} ${skillsText}`;
      const searchResult = await searchResumeContext(user._id, query, 3);
      if (searchResult) {
        retrievedContext = searchResult;
      } else {
        retrievedContext = safeResume.slice(0, 2000); // Fallback
      }
    }

    // Build system prompt for structured interview flow
    const systemPrompt = `
You are a senior professional interviewer conducting a real job interview.

Generate exactly 5 interview questions following this strict structure:

${hasResume ? `
Q1 (behavioral): Ask the candidate to introduce themselves and walk through their background. Keep it open and natural.
Q2 (project): Based on the projects listed in the resume, pick the most technically interesting one and ask a SPECIFIC question about it. Ask about a technical decision, challenge, or architecture choice — not a generic "tell me about it" question.
Q3 (project): Either dig deeper into the same project or pivot to another project/skill from the resume. Ask about a specific technical challenge, trade-off, or implementation detail.
Q4 (technical): Ask a technical question relevant to the role and the skills/stack mentioned in the resume.
Q5 (technical): Ask a harder technical or system design question appropriate for their experience level and role.
` : `
Q1 (behavioral): Ask the candidate to introduce themselves and their background.
Q2 (behavioral): Ask about a challenging work or academic situation and how they handled it.
Q3 (technical): Ask a practical technical question based on the role.
Q4 (technical): Ask a more in-depth technical question based on the role and experience level.
Q5 (technical): Ask a hard technical or system design question appropriate for their experience level.
`}

Rules:
- Each question must be between 15 and 30 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add labels like "(behavioral)" or "(project)".
- Do NOT add explanations or extra text.
- One question per line only.
- Sound like a real human interviewer.
- Make the project questions feel researched — reference specific technologies or project names when available.
`;

    const userPrompt = `
Role: ${role}
Experience: ${experience}
Interview Mode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume Context: ${retrievedContext}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "AI failed to generate questions." });
    }

    // Map question types based on position and resume availability
    const questionTypes = hasResume
      ? ["behavioral", "project", "project", "technical", "technical"]
      : ["behavioral", "behavioral", "technical", "technical", "technical"];

    user.credits -= 50;
    await user.save();

    // Build the system context for conversation memory
    const conversationSystemContext = `
You are a senior professional interviewer conducting a real job interview.
Candidate Role: ${role}
Candidate Experience: ${experience}
Interview Mode: ${mode}
${hasResume ? `Candidate Projects: ${projectText}\nCandidate Skills: ${skillsText}\nResume Context: ${retrievedContext.slice(0, 1000)}` : ""}

You are evaluating the candidate across 5 dimensions:
1. Confidence (0-10): Does the answer sound clear, assured, and well-presented?
2. Communication (0-10): Is the language clear, structured, and easy to understand?
3. Correctness (0-10): Is the answer accurate, relevant, and complete?
4. Technical Knowledge (0-10): Does the candidate demonstrate depth of technical understanding?
5. Problem Solving (0-10): Does the candidate show structured thinking and problem-solving ability?

Remember all previous questions and answers in this conversation when evaluating.
`.trim();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      resumeChunks: chunks,
      questions: questionsArray.map((q, index) => ({
        question: q,
        questionType: questionTypes[index],
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
      conversationHistory: [
        { role: "system", content: conversationSystemContext }
      ]
    })

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to create interview ${error}` })
  }
}


// ─────────────────────────────────────────────
// SUBMIT ANSWER — upgraded: conversation memory + 5 dimensions
// ─────────────────────────────────────────────
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    // Build the full conversation history for this evaluation call
    // We append the current Q&A so the AI sees the full context
    const historyForEval = [
      ...interview.conversationHistory,
      {
        role: "user",
        content: `Question ${questionIndex + 1}: ${question.question}\n\nMy Answer: ${answer}`
      }
    ];

    // Add evaluation instruction as the final user turn
    const evaluationInstruction = {
      role: "user",
      content: `
Evaluate my answer above to Question ${questionIndex + 1}.

Return ONLY valid JSON with no markdown, no explanation:

{
  "confidence": <0-10>,
  "communication": <0-10>,
  "correctness": <0-10>,
  "technicalKnowledge": <0-10>,
  "problemSolving": <0-10>,
  "finalScore": <average of all 5, rounded to nearest whole number>,
  "feedback": "<10 to 20 words of honest, specific, human-sounding feedback>"
}

Rules:
- Be realistic. Weak answers score low. Strong answers score high.
- finalScore = average of all 5 scores.
- Feedback must reference something specific from the answer.
- Do NOT repeat the question in the feedback.
- Do NOT explain the scoring.
`
    };

    const messages = [...historyForEval, evaluationInstruction];

    const aiResponse = await askAi(messages)
    const parsed = JSON.parse(aiResponse);

    // Save scores to question
    question.answer = answer;
    question.confidence = parsed.confidence ?? 0;
    question.communication = parsed.communication ?? 0;
    question.correctness = parsed.correctness ?? 0;
    question.technicalKnowledge = parsed.technicalKnowledge ?? 0;
    question.problemSolving = parsed.problemSolving ?? 0;
    question.score = parsed.finalScore ?? 0;
    question.feedback = parsed.feedback;

    // Append to conversation history for future questions
    interview.conversationHistory.push(
      { role: "user", content: `Question ${questionIndex + 1}: ${question.question}\nAnswer: ${answer}` },
      { role: "assistant", content: `Feedback: ${parsed.feedback}` }
    );

    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback })
  } catch (error) {
    return res.status(500).json({ message: `failed to submit answer ${error}` })
  }
}


// ─────────────────────────────────────────────
// FINISH INTERVIEW — upgraded: 5 dimensions + AI recommendation
// ─────────────────────────────────────────────
export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body
    const interview = await Interview.findById(interviewId)
    if (!interview) {
      return res.status(400).json({ message: "failed to find Interview" })
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    let totalTechnicalKnowledge = 0;
    let totalProblemSolving = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
      totalTechnicalKnowledge += q.technicalKnowledge || 0;
      totalProblemSolving += q.problemSolving || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;
    const avgTechnicalKnowledge = totalQuestions ? totalTechnicalKnowledge / totalQuestions : 0;
    const avgProblemSolving = totalQuestions ? totalProblemSolving / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    // Generate AI recommendation based on scores
    let recommendation = { readinessLevel: "Beginner", studyTopics: [], dsaTopics: [] };
    try {
      const recommendationMessages = [
        {
          role: "system",
          content: `You are a career coach providing post-interview feedback. Return ONLY valid JSON, no markdown.`
        },
        {
          role: "user",
          content: `
A candidate just completed an interview with these average scores (out of 10):
- Confidence: ${avgConfidence.toFixed(1)}
- Communication: ${avgCommunication.toFixed(1)}
- Correctness: ${avgCorrectness.toFixed(1)}
- Technical Knowledge: ${avgTechnicalKnowledge.toFixed(1)}
- Problem Solving: ${avgProblemSolving.toFixed(1)}
- Overall: ${finalScore.toFixed(1)}
Role: ${interview.role}
Mode: ${interview.mode}

Return ONLY this JSON:
{
  "readinessLevel": "Beginner" | "Intermediate" | "Ready",
  "studyTopics": ["topic1", "topic2", "topic3"],
  "dsaTopics": ["topic1", "topic2"]
}

Guidelines:
- "Ready" if overall >= 7.5
- "Intermediate" if overall >= 5
- "Beginner" if overall < 5
- studyTopics: 3 specific subjects they should study based on weak scores
- dsaTopics: 2 specific DSA topics relevant to their role and performance
`
        }
      ];

      const recResponse = await askAi(recommendationMessages);
      recommendation = JSON.parse(recResponse);
    } catch (err) {
      console.error("Recommendation generation failed:", err.message);
      // Non-fatal — interview still finishes, recommendation defaults to empty
    }

    interview.recommendation = recommendation;
    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      technicalKnowledge: Number(avgTechnicalKnowledge.toFixed(1)),
      problemSolving: Number(avgProblemSolving.toFixed(1)),
      recommendation,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        technicalKnowledge: q.technicalKnowledge || 0,
        problemSolving: q.problemSolving || 0,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: `failed to finish Interview ${error}` })
  }
}


// ─────────────────────────────────────────────
// GET MY INTERVIEWS — unchanged
// ─────────────────────────────────────────────
export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews)

  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview ${error}` })
  }
}


// ─────────────────────────────────────────────
// GET INTERVIEW REPORT — upgraded: 5 dimensions + recommendation
// ─────────────────────────────────────────────
export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    let totalTechnicalKnowledge = 0;
    let totalProblemSolving = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
      totalTechnicalKnowledge += q.technicalKnowledge || 0;
      totalProblemSolving += q.problemSolving || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;
    const avgTechnicalKnowledge = totalQuestions ? totalTechnicalKnowledge / totalQuestions : 0;
    const avgProblemSolving = totalQuestions ? totalProblemSolving / totalQuestions : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      technicalKnowledge: Number(avgTechnicalKnowledge.toFixed(1)),
      problemSolving: Number(avgProblemSolving.toFixed(1)),
      recommendation: interview.recommendation || { readinessLevel: "", studyTopics: [], dsaTopics: [] },
      questionWiseScore: interview.questions
    });

  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview report ${error}` })
  }
}
