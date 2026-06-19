import React, { useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaPaintBrush } from 'react-icons/fa';
import { motion } from "motion/react";
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function ATSAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.userData);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const analyze = async () => {
    if (!file) {
      setError("Please select a resume PDF to analyze.");
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post(`${ServerUrl}/api/resume/analyze-ats`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      if (response.data.credits !== undefined && userData) {
        dispatch(setUserData({ ...userData, credits: response.data.credits }));
      }
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      {!result ? (
        <div className='max-w-2xl mx-auto w-full'>
          <div className='text-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-800'>ATS Compatibility Check</h2>
            <p className='text-gray-500 mt-2'>Upload your resume to see how it performs against Applicant Tracking Systems.</p>
          </div>

          <div className='border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:bg-gray-50 transition relative bg-gray-50/50'>
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            />
            <div className='flex flex-col items-center gap-4'>
              <div className='w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center'>
                <FaCloudUploadAlt size={32} />
              </div>
              <div>
                <p className='text-lg font-medium text-gray-700'>
                  {file ? file.name : "Drag & drop your resume PDF here"}
                </p>
                <p className='text-sm text-gray-500 mt-1'>Supports .pdf up to 5MB</p>
              </div>
            </div>
          </div>

          {error && <p className='text-red-500 text-center mt-4 text-sm'>{error}</p>}

          <div className='mt-8 flex justify-center'>
            <button
              onClick={analyze}
              disabled={loading || !file}
              className='bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Top Level Scores */}
          <div className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center'>
            <h3 className='text-gray-500 font-medium mb-4'>Overall ATS Score</h3>
            <div className='w-32 h-32'>
              <CircularProgressbar 
                value={result.score} 
                text={`${result.score}`}
                styles={buildStyles({
                  pathColor: result.score > 75 ? '#10b981' : result.score > 50 ? '#f59e0b' : '#ef4444',
                  textColor: '#1f2937',
                  trailColor: '#f3f4f6'
                })}
              />
            </div>
          </div>

          <div className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center'>
            <h3 className='text-gray-500 font-medium mb-4'>Keyword Coverage</h3>
            <div className='w-32 h-32'>
              <CircularProgressbar 
                value={result.keywordCoverage} 
                text={`${result.keywordCoverage}%`}
                styles={buildStyles({
                  pathColor: '#3b82f6',
                  textColor: '#1f2937',
                  trailColor: '#f3f4f6'
                })}
              />
            </div>
          </div>

          <div className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6'>
            <div className='flex items-center gap-2 text-red-500 mb-4'>
              <FaExclamationTriangle />
              <h3 className='font-semibold text-gray-800'>Missing Keywords</h3>
            </div>
            <div className='flex flex-wrap gap-2'>
              {result.missingKeywords?.length > 0 ? result.missingKeywords.map((kw, i) => (
                <span key={i} className='bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-100'>
                  {kw}
                </span>
              )) : (
                <p className='text-sm text-gray-500'>Excellent! No critical keywords missing.</p>
              )}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6'>
              <div className='flex items-center gap-2 text-green-500 mb-4'>
                <FaCheckCircle />
                <h3 className='font-semibold text-gray-800'>Strengths</h3>
              </div>
              <ul className='space-y-3'>
                {result.strengths?.map((s, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                    <span className='text-green-500 mt-1'>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='bg-white border border-gray-100 rounded-2xl shadow-sm p-6'>
              <div className='flex items-center gap-2 text-orange-500 mb-4'>
                <FaExclamationTriangle />
                <h3 className='font-semibold text-gray-800'>Areas for Improvement</h3>
              </div>
              <ul className='space-y-3'>
                {result.weaknesses?.map((w, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm text-gray-600'>
                    <span className='text-orange-500 mt-1'>•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-blue-50 border border-blue-100 rounded-2xl shadow-sm p-6'>
              <div className='flex items-center gap-2 text-blue-600 mb-4'>
                <FaPaintBrush />
                <h3 className='font-semibold text-gray-800'>Formatting Suggestions</h3>
              </div>
              <ul className='space-y-3'>
                {result.formattingSuggestions?.map((s, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm text-gray-700'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='bg-purple-50 border border-purple-100 rounded-2xl shadow-sm p-6'>
              <div className='flex items-center gap-2 text-purple-600 mb-4'>
                <FaLightbulb />
                <h3 className='font-semibold text-gray-800'>Content Suggestions</h3>
              </div>
              <ul className='space-y-3'>
                {result.contentSuggestions?.map((s, i) => (
                  <li key={i} className='flex items-start gap-2 text-sm text-gray-700'>
                    <span className='text-purple-500 mt-1'>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='md:col-span-3 flex justify-center mt-4'>
            <button
              onClick={() => { setResult(null); setFile(null); }}
              className='text-gray-500 hover:text-black font-medium transition'
            >
              Analyze Another Resume
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ATSAnalyzer;
