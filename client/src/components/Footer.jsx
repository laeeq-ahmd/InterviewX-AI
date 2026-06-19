import React from 'react'
import { BsRobot } from 'react-icons/bs'
import { FaGithub, FaEnvelope } from 'react-icons/fa'
import { FaArrowRightLong } from 'react-icons/fa6'

function Footer() {
  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pb-10 py-4 pt-10'>
      <div className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 py-10 px-6 md:px-10'>
        
        {/* Top brand section */}
        <div className='flex flex-col items-center justify-center gap-3 mb-6 text-center'>
            <div className='bg-black text-white p-3 rounded-xl'><BsRobot size={22}/></div>
            <h2 className='font-bold text-xl text-gray-800'>CareerX AI <span className="text-sm font-normal text-gray-500">(Formerly InterviewX AI)</span></h2>
            <p className='text-gray-500 text-sm max-w-xl mt-1'>
              An AI-powered platform designed to improve your career readiness through mock interviews and intelligent resume tools.
            </p>
        </div>

        {/* Version Flowchart */}
        <div className='max-w-3xl mx-auto my-12 bg-gray-50/80 border border-gray-100 rounded-2xl p-6 md:p-8'>
          <h3 className='text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-8'>Platform Evolution</h3>
          
          <div className='flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8'>
            {/* v1 */}
            <div className='flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center w-full'>
              <div className='inline-block bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1.5 rounded-full mb-4'>v1.0</div>
              <h4 className='font-bold text-gray-800 mb-2'>Interview Preparation</h4>
              <p className='text-sm text-gray-500 leading-relaxed'>Voice-based mock interviews and basic performance analysis.</p>
            </div>
            
            <FaArrowRightLong className='text-gray-300 hidden md:block shrink-0' size={24} />
            <div className='w-[2px] h-8 bg-gray-200 block md:hidden'></div>

            {/* v2 */}
            <div className='flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm text-center w-full relative overflow-hidden'>
              <div className='absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl'></div>
              <div className='inline-block bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-full mb-4 shadow-sm'>v2.0 (Current)</div>
              <h4 className='font-bold text-gray-800 mb-2'>Career Intelligence</h4>
              <p className='text-sm text-blue-900/70 leading-relaxed'>Added ATS analysis, One-Click Resume Customization, and AI Cover Letters.</p>
            </div>
          </div>
        </div>

        <hr className='border-gray-100 my-8' />

        {/* Built By Section */}
        <div className='flex flex-col md:flex-row items-center justify-between gap-6 text-sm px-4'>
          <div className='flex flex-col md:flex-row items-center gap-2'>
            <p className='font-medium text-gray-500'>Built by</p>
            <p className='font-bold text-gray-800 text-base'>Laeeq Ahmed</p>
          </div>
          <div className='flex flex-wrap justify-center items-center gap-6'>
            <a href="https://github.com/laeeq-ahmd" target="_blank" rel="noopener noreferrer" className='flex items-center gap-2.5 text-gray-500 hover:text-black transition-colors font-medium bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200'>
              <FaGithub size={18} /> github.com/laeeq-ahmd
            </a>
            <a href="mailto:laeeq.amd@gmail.com" className='flex items-center gap-2.5 text-gray-500 hover:text-blue-600 transition-colors font-medium bg-blue-50/50 hover:bg-blue-50 px-4 py-2 rounded-full border border-blue-100'>
              <FaEnvelope size={18} /> laeeq.amd
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Footer
