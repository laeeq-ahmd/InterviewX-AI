import React from 'react'
import { FaArrowLeft, FaCheckCircle, FaClock, FaLightbulb, FaCode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function Step3Report({ report }) {
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    technicalKnowledge = 0,
    problemSolving = 0,
    recommendation = null,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
    { label: "Technical Knowledge", value: technicalKnowledge },
    { label: "Problem Solving", value: problemSolving },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  // Readiness badge styling
  const readinessConfig = {
    Ready: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: <FaCheckCircle className="text-green-500" /> },
    Intermediate: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: <FaClock className="text-yellow-500" /> },
    Beginner: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: <FaClock className="text-red-400" /> },
  };
  const readiness = recommendation?.readinessLevel || "";
  const readinessStyle = readinessConfig[readiness] || readinessConfig["Beginner"];

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // TITLE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, { align: "center" });

    currentY += 5;
    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 15;

    // FINAL SCORE BOX
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, { align: "center" });
    currentY += 30;

    // READINESS LEVEL
    if (readiness) {
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, currentY, contentWidth, 14, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Interview Readiness: ${readiness}`, margin + 10, currentY + 9);
      currentY += 24;
    }

    // ALL 5 SKILLS BOX
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 46, 4, 4, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);
    doc.text(`Technical Knowledge: ${technicalKnowledge}`, margin + 10, currentY + 34);
    doc.text(`Problem Solving: ${problemSolving}`, margin + 10, currentY + 42);
    currentY += 56;

    // STUDY TOPICS
    if (recommendation?.studyTopics?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Recommended Study Topics:", margin, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      recommendation.studyTopics.forEach(topic => {
        doc.text(`• ${topic}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 4;
    }

    // DSA TOPICS
    if (recommendation?.dsaTopics?.length) {
      doc.setFont("helvetica", "bold");
      doc.text("Recommended DSA Topics:", margin, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      recommendation.dsaTopics.forEach(topic => {
        doc.text(`• ${topic}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 4;
    }

    // ADVICE
    let advice = "";
    if (finalScore >= 8) {
      advice = "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice = "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice = "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);
    doc.setFont("helvetica", "bold");
    doc.text("Professional Advice", margin + 10, currentY + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 20);
    currentY += 50;

    // QUESTION TABLE
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback,
      ]),
      styles: { fontSize: 9, cellPadding: 5, valign: "top" },
      headStyles: { fillColor: [34, 197, 94], textColor: 255, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: "auto" },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save("AI_Interview_Report.pdf");
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8'>
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>
          <button
            onClick={() => navigate("/history")}
            className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
            <FaArrowLeft className='text-gray-600' />
          </button>

          <div>
            <h1 className='text-3xl font-bold flex-nowrap text-gray-800'>
              Interview Analytics Dashboard
            </h1>
            <p className='text-gray-500 mt-2'>
              AI-powered performance insights
            </p>
          </div>
        </div>

        <button onClick={downloadPDF} className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base text-nowrap'>
          Download PDF
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>

        {/* Left column */}
        <div className='space-y-6'>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center">

            <h3 className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
              Overall Performance
            </h3>
            <div className='relative w-20 h-20 sm:w-25 sm:h-25 mx-auto'>
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: "#10b981",
                  textColor: "#ef4444",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>

            <p className="text-gray-400 mt-3 text-xs sm:text-sm">Out of 10</p>

            <div className="mt-4">
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{performanceText}</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">{shortTagline}</p>
            </div>
          </motion.div>

          {/* Skill Evaluation — 5 dimensions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8'>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
              Skill Evaluation
            </h3>

            <div className='space-y-5'>
              {skills.map((s, i) => (
                <div key={i}>
                  <div className='flex justify-between mb-2 text-sm sm:text-base'>
                    <span>{s.label}</span>
                    <span className='font-semibold text-green-600'>{s.value}</span>
                  </div>

                  <div className='bg-gray-200 h-2 sm:h-3 rounded-full'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className='bg-green-500 h-full rounded-full'
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Readiness & Recommendations card */}
          {recommendation && recommendation.readinessLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8'>

              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-5">
                Interview Readiness
              </h3>

              {/* Readiness badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${readinessStyle.bg} ${readinessStyle.text} ${readinessStyle.border} mb-6`}>
                {readinessStyle.icon}
                {readiness}
              </div>

              {/* Study Topics */}
              {recommendation.studyTopics?.length > 0 && (
                <div className='mb-5'>
                  <div className='flex items-center gap-2 mb-3'>
                    <FaLightbulb className='text-yellow-400 text-sm' />
                    <p className='text-sm font-semibold text-gray-600'>Recommended Study Topics</p>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {recommendation.studyTopics.map((topic, i) => (
                      <span key={i} className='bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium'>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DSA Topics */}
              {recommendation.dsaTopics?.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <FaCode className='text-purple-400 text-sm' />
                    <p className='text-sm font-semibold text-gray-600'>Recommended DSA Topics</p>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {recommendation.dsaTopics.map((topic, i) => (
                      <span key={i} className='bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-medium'>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right column — charts + question breakdown */}
        <div className='lg:col-span-2 space-y-6'>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
              Performance Trend
            </h3>

            <div className='h-64 sm:h-72'>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
              Question Breakdown
            </h3>
            <div className='space-y-6'>
              {questionWiseScore.map((q, i) => (
                <div key={i} className='bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200'>

                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                    <div>
                      <p className="text-xs text-gray-400">Question {i + 1}</p>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>

                    <div className='bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit'>
                      {q.score ?? 0}/10
                    </div>
                  </div>

                  {/* Per-question sub-scores */}
                  {(q.technicalKnowledge !== undefined || q.problemSolving !== undefined) && (
                    <div className='flex flex-wrap gap-2 mb-3'>
                      {q.confidence !== undefined && (
                        <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                          Conf: {q.confidence}
                        </span>
                      )}
                      {q.communication !== undefined && (
                        <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                          Comm: {q.communication}
                        </span>
                      )}
                      {q.technicalKnowledge !== undefined && q.technicalKnowledge > 0 && (
                        <span className='text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full'>
                          Tech: {q.technicalKnowledge}
                        </span>
                      )}
                      {q.problemSolving !== undefined && q.problemSolving > 0 && (
                        <span className='text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full'>
                          PS: {q.problemSolving}
                        </span>
                      )}
                    </div>
                  )}

                  <div className='bg-green-50 border border-green-200 p-4 rounded-lg'>
                    <p className='text-xs text-green-600 font-semibold mb-1'>AI Feedback</p>
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Step3Report
