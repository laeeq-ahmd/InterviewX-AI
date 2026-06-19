import React, { useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import {
  FaCloudUploadAlt, FaFilePdf, FaFileWord, FaEye, FaEyeSlash,
  FaCheckCircle, FaCode, FaLink, FaInfoCircle, FaLightbulb,
  FaCommentAlt
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

// ─────────────────────────────────────────────────────────────────
// PDF GENERATOR — Times Roman, Overleaf-style professional layout
// ─────────────────────────────────────────────────────────────────
function buildProfessionalPDF(resume) {
  const doc = new jsPDF("p", "mm", "a4");
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 20, MR = 20, MT = 18;
  const CW = PW - ML - MR;
  let y = MT;

  const newPage = () => { doc.addPage(); y = MT; };
  const checkY = (needed = 8) => { if (y + needed > PH - 15) newPage(); };

  // ── Name ──────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text((resume.name || "").toUpperCase(), PW / 2, y, { align: "center" });
  y += 8;

  // ── Contact line ──────────────────────────────────────────
  const c = resume.contact || {};
  const contactParts = [c.phone, c.email, c.linkedin, c.github, c.other].filter(Boolean);
  if (contactParts.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    const contactLines = doc.splitTextToSize(contactParts.join("   "), CW);
    contactLines.forEach(ln => { doc.text(ln, PW / 2, y, { align: "center" }); y += 4.5; });
  }
  y += 3;

  // ── Sections ─────────────────────────────────────────────
  for (const section of (resume.sections || [])) {
    checkY(18);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title.toUpperCase(), ML, y);
    y += 1.5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.line(ML, y, PW - MR, y);
    y += 5;

    if (section.type === "text") {
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(section.content || "", CW);
      lines.forEach(ln => { checkY(5); doc.text(ln, ML, y); y += 5; });
      y += 3;
    }

    if (section.type === "skills") {
      doc.setFontSize(10);
      for (const item of (section.items || [])) {
        checkY(7);
        doc.setFont("times", "bold");
        const label = `${item.label}: `;
        const lw = doc.getTextWidth(label);
        doc.text(label, ML, y);
        doc.setFont("times", "normal");
        const valLines = doc.splitTextToSize(item.value || "", CW - lw);
        valLines.forEach((ln, i) => { checkY(5); doc.text(ln, ML + (i === 0 ? lw : 0), y); y += 5; });
      }
      y += 2;
    }

    if (section.type === "entries") {
      for (const item of (section.items || [])) {
        checkY(12);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text(item.title || "", ML, y);
        if (item.location) { doc.setFont("times", "normal"); doc.text(item.location, PW - MR, y, { align: "right" }); }
        y += 5;
        if (item.subtitle || item.date) {
          checkY(6);
          doc.setFont("times", "italic");
          if (item.subtitle) doc.text(item.subtitle, ML, y);
          if (item.date) doc.text(item.date, PW - MR, y, { align: "right" });
          y += 5;
        }
        if (item.bullets?.length) {
          doc.setFont("times", "normal");
          for (const bullet of item.bullets) {
            if (!bullet) continue;
            checkY(6);
            const bLines = doc.splitTextToSize("\u2013 " + bullet, CW - 4);
            bLines.forEach((ln, i) => { checkY(5); doc.text(ln, ML + (i === 0 ? 0 : 4), y); y += 5; });
          }
        }
        y += 2;
      }
      y += 1;
    }

    if (section.type === "projects") {
      doc.setFontSize(10);
      for (const item of (section.items || [])) {
        checkY(12);
        doc.setFont("times", "bold");
        doc.text(item.name || "", ML, y);
        if (item.tech) {
          const nw = doc.getTextWidth(item.name || "");
          doc.setFont("times", "italic");
          const tLines = doc.splitTextToSize(" \u2013 " + item.tech, CW - nw - 2);
          doc.text(tLines[0] || "", ML + nw, y);
          if (tLines.length > 1) { y += 5; tLines.slice(1).forEach(ln => { checkY(5); doc.text(ln, ML, y); y += 5; }); }
        }
        y += 5;
        if (item.bullets?.length) {
          doc.setFont("times", "normal");
          for (const bullet of item.bullets) {
            if (!bullet) continue;
            checkY(6);
            const bLines = doc.splitTextToSize("\u2013 " + bullet, CW - 4);
            bLines.forEach((ln, i) => { checkY(5); doc.text(ln, ML + (i === 0 ? 0 : 4), y); y += 5; });
          }
        }
        y += 3;
      }
    }

    if (section.type === "bullets") {
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      for (const bullet of (section.items || [])) {
        if (!bullet) continue;
        checkY(6);
        const bLines = doc.splitTextToSize("\u2013 " + bullet, CW - 4);
        bLines.forEach((ln, i) => { checkY(5); doc.text(ln, ML + (i === 0 ? 0 : 4), y); y += 5; });
      }
      y += 3;
    }
  }
  return doc;
}

// ─────────────────────────────────────────────────────────────────
// DOCX GENERATOR — proper HTML table layout (Word-compatible)
// ─────────────────────────────────────────────────────────────────
function downloadDOCX(resume) {
  const c = resume.contact || {};
  const contactParts = [c.phone, c.email, c.linkedin, c.github, c.other].filter(Boolean);

  const row = (left, right, leftBold = false, rightItalic = false) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:1pt 0;">
      <tr>
        <td style="font-weight:${leftBold ? 'bold' : 'normal'}; font-style:${leftBold ? 'normal' : 'normal'};">${left}</td>
        <td align="right" style="white-space:nowrap; font-style:${rightItalic ? 'italic' : 'normal'};">${right}</td>
      </tr>
    </table>`;

  let body = `<h1 style="text-align:center;font-size:18pt;margin:0 0 4pt 0;letter-spacing:1px;">${resume.name || ""}</h1>`;

  if (contactParts.length) {
    body += `<p style="text-align:center;font-size:9pt;margin:0 0 8pt 0;">${contactParts.join(" &nbsp;|&nbsp; ")}</p>`;
  }

  for (const section of (resume.sections || [])) {
    body += `<h2 style="font-size:11pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #000;padding-bottom:1pt;margin:10pt 0 4pt 0;">${section.title}</h2>`;

    if (section.type === "text") {
      body += `<p style="margin:0 0 6pt 0;font-size:10pt;line-height:1.4;">${section.content || ""}</p>`;
    }

    if (section.type === "skills") {
      for (const item of (section.items || [])) {
        body += `<p style="margin:1pt 0;font-size:10pt;"><b>${item.label}:</b> ${item.value || ""}</p>`;
      }
    }

    if (section.type === "entries") {
      for (const item of (section.items || [])) {
        body += row(`<b>${item.title || ""}</b>`, item.location || "", false);
        if (item.subtitle || item.date) {
          body += row(`<i>${item.subtitle || ""}</i>`, `<i>${item.date || ""}</i>`);
        }
        if (item.bullets?.length) {
          body += `<ul style="margin:2pt 0 4pt 8pt;padding:0;">`;
          item.bullets.filter(Boolean).forEach(b => {
            body += `<li style="font-size:10pt;margin:1pt 0;list-style-type:none;">&ndash; ${b}</li>`;
          });
          body += `</ul>`;
        }
        body += `<p style="margin:2pt 0;"></p>`;
      }
    }

    if (section.type === "projects") {
      for (const item of (section.items || [])) {
        body += `<p style="margin:4pt 0 1pt 0;font-size:10pt;"><b>${item.name || ""}</b>${item.tech ? ` <i>&ndash; ${item.tech}</i>` : ""}</p>`;
        if (item.bullets?.length) {
          body += `<ul style="margin:2pt 0 4pt 8pt;padding:0;">`;
          item.bullets.filter(Boolean).forEach(b => {
            body += `<li style="font-size:10pt;margin:1pt 0;list-style-type:none;">&ndash; ${b}</li>`;
          });
          body += `</ul>`;
        }
      }
    }

    if (section.type === "bullets") {
      body += `<ul style="margin:2pt 0 4pt 8pt;padding:0;">`;
      (section.items || []).filter(Boolean).forEach(b => {
        body += `<li style="font-size:10pt;margin:1pt 0;list-style-type:none;">&ndash; ${b}</li>`;
      });
      body += `</ul>`;
    }
  }

  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
       xmlns:w='urn:schemas-microsoft-com:office:word'
       xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'>
<style>
  body { font-family: Georgia, 'Times New Roman', Times, serif; font-size: 10pt; margin: 72pt; }
</style>
</head>
<body>${body}</body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "Optimized_Resume.doc"; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
function ResumeCustomizer() {
  const [inputMode, setInputMode] = useState("pdf");
  const [file, setFile] = useState(null);
  const [latexCode, setLatexCode] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDiff, setShowDiff] = useState(true); // open by default

  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.userData);

  const canCustomize =
    !loading && jd.trim() &&
    (inputMode === "pdf" ? !!file : latexCode.trim().length > 50);

  const customize = async () => {
    if (!canCustomize) return;
    setLoading(true); setError(""); setResult(null);

    const formData = new FormData();
    if (inputMode === "pdf" && file) formData.append("resume", file);
    if (inputMode === "latex") formData.append("latexCode", latexCode);
    formData.append("jobDescription", jd);
    if (socialLinks.trim()) formData.append("socialLinks", socialLinks);
    if (customInstructions.trim()) formData.append("customInstructions", customInstructions);

    try {
      const response = await axios.post(`${ServerUrl}/api/resume/customize`, formData, {
        withCredentials: true,
      });
      setResult(response.data);
      if (response.data.credits !== undefined && userData) {
        dispatch(setUserData({ ...userData, credits: response.data.credits }));
      }
      setShowDiff(true);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Customization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null); setFile(null); setLatexCode("");
    setSocialLinks(""); setCustomInstructions(""); setJd(""); setError("");
  };

  // ── INPUT PHASE ───────────────────────────────────────────
  if (!result) {
    return (
      <div className="flex flex-col gap-6">

        {/* Input mode toggle */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Resume Input Method</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setInputMode("pdf")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-medium text-sm transition ${inputMode === "pdf" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <FaFilePdf /> Upload PDF
            </button>
            <button onClick={() => setInputMode("latex")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-medium text-sm transition ${inputMode === "latex" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <FaCode /> Paste LaTeX Code
            </button>
          </div>

          {/* LaTeX tip */}
          {inputMode === "pdf" && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <FaLightbulb className="mt-0.5 shrink-0 text-amber-500" />
              <span>
                <strong>Tip:</strong> For the best formatting in the generated PDF/DOCX, use the <strong>Paste LaTeX Code</strong> option
                (export from Overleaf or a LaTeX editor). PDF text extraction may lose formatting and hyperlinks.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Resume input */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-800">
              {inputMode === "pdf" ? "1. Upload Resume (PDF)" : "1. Paste LaTeX Source Code"}
            </h2>
            <AnimatePresence mode="wait">
              {inputMode === "pdf" ? (
                <motion.div key="pdf" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-blue-50 hover:border-blue-400 transition flex flex-col items-center justify-center min-h-[180px] cursor-pointer">
                  <input type="file" accept=".pdf"
                    onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(""); } }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <FaCloudUploadAlt size={28} />
                  </div>
                  <p className="font-semibold text-gray-700">{file ? file.name : "Click or drag to upload PDF"}</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5 MB · PDF only</p>
                </motion.div>
              ) : (
                <motion.div key="latex" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <textarea value={latexCode} onChange={(e) => setLatexCode(e.target.value)}
                    placeholder={`\\documentclass{article}\n\\begin{document}\n\\textbf{Your Name} ...\n\\end{document}`}
                    className="w-full h-52 border-2 border-purple-200 rounded-2xl p-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none font-mono text-xs text-gray-800 bg-gray-50" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* OCR notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 flex gap-2">
              <FaInfoCircle className="mt-0.5 shrink-0 text-gray-400" />
              <span>PDF extraction may miss embedded hyperlinks. Add your social links manually below.</span>
            </div>
          </div>

          {/* Job description */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-800">2. Paste Job Description</h2>
            <textarea value={jd} onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here — the AI uses this to heavily rewrite your bullet points with matching keywords, tools, and action verbs..."
              className="flex-1 min-h-[220px] border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm text-gray-800" />
          </div>
        </div>

        {/* Social links */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            3. Social & Portfolio Links
            <span className="text-xs font-normal text-gray-400">(optional — ensures they appear in contact section)</span>
          </h2>
          <textarea value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} rows={2}
            placeholder={"LinkedIn: https://linkedin.com/in/yourname\nGitHub: https://github.com/yourname"}
            className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm text-gray-800" />
        </div>

        {/* Custom instructions */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            4. Custom Optimization Instructions
            <span className="text-xs font-normal text-gray-400">(optional — tells AI how to tailor specifically)</span>
          </h2>
          <textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={3}
            placeholder={`Examples:\n• "Emphasize my Python and machine learning experience more than other skills"\n• "Make the tone more senior/lead-level"`}
            className="w-full border-2 border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-sm text-gray-800" />
          <p className="text-xs text-gray-400 mt-1">These instructions are passed directly to the AI alongside the JD.</p>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        <button onClick={customize} disabled={!canCustomize}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all text-lg">
          {loading ? (
            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>Optimizing resume with AI — this may take 15–30 seconds...</>
          ) : (
            <><FaWandMagicSparkles /> One-Click Customize Resume</>
          )}
        </button>
      </div>
    );
  }

  // ── RESULT PHASE ─────────────────────────────────────────
  const { resume, atsScoreBefore, atsScoreAfter, diff } = result;
  const changedSections = (diff || []).filter(d => d.original !== d.optimized);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">

      {/* Score header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaCheckCircle className="text-green-400" /> Resume Optimized!
          </h2>
          <p className="text-gray-300 mt-1">
            {resume.name} · {resume.sections?.length || 0} sections · {changedSections.length} sections rewritten
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">ATS Match Before</p>
            <div className="w-16 h-16">
              <CircularProgressbar value={atsScoreBefore} text={`${atsScoreBefore}%`}
                styles={buildStyles({ pathColor: '#ef4444', textColor: '#fff', trailColor: 'rgba(255,255,255,0.1)', textSize: '24px' })} />
            </div>
          </div>
          <div className="text-3xl text-gray-500">→</div>
          <div className="text-center">
            <p className="text-xs font-medium text-green-400 mb-2">ATS Match After</p>
            <div className="w-16 h-16">
              <CircularProgressbar value={atsScoreAfter} text={`${atsScoreAfter}%`}
                styles={buildStyles({ pathColor: '#22c55e', textColor: '#fff', trailColor: 'rgba(255,255,255,0.1)', textSize: '24px' })} />
            </div>
          </div>
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={() => buildProfessionalPDF(resume).save("Optimized_Resume.pdf")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition">
          <FaFilePdf /> Download PDF
        </button>
        <button onClick={() => downloadDOCX(resume)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition">
          <FaFileWord /> Download DOCX
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <span className="text-xs">{changedSections.length} of {resume.sections?.length || 0} sections changed</span>
          <button onClick={() => setShowDiff(!showDiff)}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium shadow-sm transition">
            {showDiff ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            {showDiff ? "Hide Changes" : "Show Changes"}
          </button>
        </div>
      </div>

      {/* Sections preserved badge strip */}
      <div className="flex flex-wrap gap-2">
        {(resume.sections || []).map((s, i) => {
          const changed = changedSections.some(d => d.section === s.title || s.title.toLowerCase().includes(d.section?.toLowerCase()));
          return (
            <span key={i} className={`text-xs px-3 py-1 rounded-full font-medium border ${changed ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              {changed ? '✓ ' : ''}{s.title}
            </span>
          );
        })}
      </div>

      {/* ── DIFF VIEW — open by default ── */}
      {showDiff && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold text-gray-800">
              AI Changes — {changedSections.length} section{changedSections.length !== 1 ? 's' : ''} rewritten
            </h3>
            {changedSections.length === 0 && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                No diff returned — try adding more specific custom instructions
              </span>
            )}
          </div>

          {(diff || []).map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 text-sm">{item.section}</h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Modified</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                <div className="p-4 bg-red-50/40">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Original</span>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{item.original}</p>
                </div>
                <div className="p-4 bg-green-50/40">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 block">AI Optimized</span>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{item.optimized}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t flex justify-center">
        <button onClick={reset} className="text-gray-400 hover:text-gray-700 font-medium text-sm transition">
          ← Start New Customization
        </button>
      </div>
    </motion.div>
  );
}

export default ResumeCustomizer;
