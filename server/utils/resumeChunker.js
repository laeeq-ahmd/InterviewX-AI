/**
 * resumeChunker.js
 *
 * Splits raw resume text into semantically meaningful sections.
 * Returns an array of { section, content } objects for embedding.
 */

const SECTION_HEADERS = [
  "experience", "work experience", "employment history", "professional experience",
  "projects", "personal projects", "academic projects", "key projects",
  "skills", "technical skills", "core competencies", "technologies",
  "education", "academic background", "qualifications",
  "achievements", "awards", "certifications", "licenses",
  "summary", "objective", "professional summary", "profile", "about me",
  "publications", "research", "volunteer", "extracurricular"
];

/**
 * Detects if a line is a section header.
 * Heuristic: short line (< 60 chars), matches a known header keyword.
 */
const isSectionHeader = (line) => {
  if (line.length > 60) return false;
  const normalized = line.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  return SECTION_HEADERS.some(
    header => normalized === header || normalized.startsWith(header + " ")
  );
};

/**
 * @param {string} resumeText - Raw extracted resume text
 * @returns {{ section: string, content: string }[]}
 */
export const chunkResume = (resumeText) => {
  if (!resumeText || !resumeText.trim()) return [];

  const lines = resumeText
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const chunks = [];
  let currentSection = "general";
  let currentContent = [];

  for (const line of lines) {
    if (isSectionHeader(line)) {
      // Save the previous section if it has content
      if (currentContent.length > 0) {
        const content = currentContent.join(" ").trim();
        if (content.length > 30) {
          chunks.push({ section: currentSection, content });
        }
      }
      // Start new section
      currentSection = line.toLowerCase().replace(/[^a-z\s]/g, "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Push the final section
  if (currentContent.length > 0) {
    const content = currentContent.join(" ").trim();
    if (content.length > 30) {
      chunks.push({ section: currentSection, content });
    }
  }

  return chunks;
};
