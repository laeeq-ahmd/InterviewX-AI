import React, { useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaCloudUploadAlt, FaCopy, FaFilePdf, FaCheckCircle } from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { motion } from "motion/react";
import jsPDF from "jspdf";
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function CoverLetter() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.userData);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const generate = async () => {
    if (!file || !jd.trim()) {
      setError("Please select a resume and paste a job description.");
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jd);

    try {
      const response = await axios.post(`${ServerUrl}/api/resume/generate-cover-letter`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data.coverLetter);
      if (response.data.credits !== undefined && userData) {
        dispatch(setUserData({ ...userData, credits: response.data.credits }));
      }

    } catch (err) {
      console.error(err);
      setError("Failed to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const splitText = doc.splitTextToSize(result, maxLineWidth);
    
    let y = 20;
    splitText.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 6;
    });
    
    doc.save("Cover_Letter.pdf");
  };

  return (
    <div className='flex flex-col gap-8'>
      {!result ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='flex flex-col gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>1. Upload Resume</h2>
            <div className='border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition relative bg-gray-50/50 h-full flex flex-col items-center justify-center'>
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              />
              <div className='w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3'>
                <FaCloudUploadAlt size={28} />
              </div>
              <p className='font-medium text-gray-700'>{file ? file.name : "Upload PDF Resume"}</p>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <h2 className='text-xl font-bold text-gray-800'>2. Paste Job Description</h2>
            <textarea 
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the target job description here..."
              className='w-full h-48 border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
            ></textarea>
          </div>

          <div className='md:col-span-2 mt-4'>
            {error && <p className='text-red-500 text-center mb-4 text-sm'>{error}</p>}
            <button
              onClick={generate}
              disabled={loading || !file || !jd.trim()}
              className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all text-lg'
            >
              {loading ? "Generating Cover Letter..." : <><FaWandMagicSparkles /> Generate Cover Letter</>}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex flex-col gap-6'>
          
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-gray-800'>Your AI Cover Letter</h2>
            <div className='flex gap-3'>
              <button 
                onClick={copyToClipboard}
                className='flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition text-sm'
              >
                {copied ? <><FaCheckCircle className="text-green-500" /> Copied</> : <><FaCopy /> Copy Text</>}
              </button>
              <button 
                onClick={downloadPDF}
                className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition text-sm'
              >
                <FaFilePdf /> Download PDF
              </button>
            </div>
          </div>

          <div className='bg-white border border-gray-200 rounded-2xl shadow-sm p-8'>
            <div className='prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed'>
              {result}
            </div>
          </div>

          <div className='mt-4 flex justify-center'>
            <button 
              onClick={() => { setResult(''); setFile(null); setJd(''); }} 
              className='text-gray-500 hover:text-gray-800 font-medium transition'
            >
              Generate Another Cover Letter
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}

export default CoverLetter;
