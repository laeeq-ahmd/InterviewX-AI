import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ATSAnalyzer from '../components/ATSAnalyzer';
import ResumeCustomizer from '../components/ResumeCustomizer';
import ResumeVersions from '../components/ResumeVersions';
import CoverLetter from '../components/CoverLetter';

const TABS = [
  { id: 'analyzer',    label: 'ATS Analyzer' },
  { id: 'customizer',  label: 'One-Click Customizer' },
  { id: 'versions',    label: 'Version History' },
  { id: 'coverletter', label: 'Cover Letter' },
];

function ResumeTools() {
  const location = useLocation();
  const initialTab = location.state?.tab || 'analyzer';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className='min-h-screen bg-[#f3f3f3]'>
      <Navbar />
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800'>Resume Intelligence Suite</h1>
          <p className='text-gray-500 mt-2'>Analyze, customize, and track your resumes</p>
        </div>

        <div className='flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto'>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className='absolute bottom-0 left-0 w-full h-0.5 bg-blue-600' />
              )}
            </button>
          ))}
        </div>

        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[60vh]'>
          {activeTab === 'analyzer'    && <ATSAnalyzer />}
          {activeTab === 'customizer'  && <ResumeCustomizer />}
          {activeTab === 'versions'    && <ResumeVersions />}
          {activeTab === 'coverletter' && <CoverLetter />}
        </div>
      </div>
    </div>
  );
}

export default ResumeTools;
