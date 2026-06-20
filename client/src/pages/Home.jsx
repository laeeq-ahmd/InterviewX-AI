import React from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { FaSearchengin, FaMagic, FaFileAlt, FaHistory, FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModel from '../components/AuthModel';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer';


function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()

  const goToResumeTool = (tab) => {
    if (!userData) { setShowAuth(true); return; }
    navigate("/resume-tools", { state: { tab } })
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col'>
      <Navbar />

      <div className='flex-1 px-6 py-20'>
        <div className='max-w-6xl mx-auto'>

          {/* ── Hero badge ── */}
          <div className='flex justify-center mb-6'>
            <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2'>
              <HiSparkles size={16} className="text-green-600" />
              AI Powered Career Platform
            </div>
          </div>

          {/* ── Hero headline ── */}
          <div className='text-center mb-16'>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'>
              Practice Interviews with
              <span className='relative inline-block'>
                <span className='bg-green-100 text-green-600 px-5 py-1 rounded-full'>
                  AI Intelligence
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'>
              Mock interviews, ATS resume analysis, one-click resume customization,
              and AI cover letters — all in one platform.
            </motion.p>

            <div className='flex flex-wrap justify-center gap-4 mt-10'>
              <motion.button
                onClick={() => {
                  if (!userData) { setShowAuth(true); return; }
                  navigate("/interview")
                }}
                whileHover={{ opacity: 0.9, scale: 1.03 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                className='bg-black text-white px-10 py-3 rounded-full hover:opacity-90 transition shadow-md'>
                Start Interview
              </motion.button>

              <motion.button
                onClick={() => goToResumeTool('analyzer')}
                whileHover={{ opacity: 0.9, scale: 1.03 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                className='border border-gray-300 px-10 py-3 rounded-full hover:bg-gray-100 transition'>
                Analyze My Resume
              </motion.button>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RESUME INTELLIGENCE SUITE — big feature cards
          ══════════════════════════════════════════ */}
          <div className='mb-32'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-center mb-12'>
              <div className='inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full mb-4'>
                <HiSparkles size={14} />
                NEW — Resume Intelligence Suite
              </div>
              <h2 className='text-4xl font-semibold'>
                Supercharge Your{" "}
                <span className="text-blue-600">Resume</span>
              </h2>
              <p className='text-gray-500 mt-3 max-w-xl mx-auto'>
                From ATS scoring to one-click tailoring — get interview-ready in minutes, not hours.
              </p>
            </motion.div>

            <div className='grid md:grid-cols-3 gap-6'>

              {/* Card 1 — ATS Analyzer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => goToResumeTool('analyzer')}
                className='group bg-white border-2 border-gray-100 hover:border-blue-400 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer'>

                <div className='w-14 h-14 bg-blue-50 group-hover:bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 transition'>
                  <BsBarChart size={26} />
                </div>

                <div className='inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
                  ATS ANALYZER
                </div>

                <h3 className='font-bold text-xl text-gray-900 mb-3'>Beat the ATS System</h3>
                <p className='text-gray-500 text-sm leading-relaxed mb-6'>
                  Upload your resume and get an instant ATS score, keyword gap analysis,
                  formatting tips, and content suggestions.
                </p>

                <div className='space-y-2 mb-6'>
                  {['ATS Score 0–100', 'Missing keyword chips', 'Strengths & weakness cards'].map(f => (
                    <div key={f} className='flex items-center gap-2 text-sm text-gray-600'>
                      <div className='w-1.5 h-1.5 bg-blue-500 rounded-full' />
                      {f}
                    </div>
                  ))}
                </div>

                <div className='flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all'>
                  Analyze Resume <FaArrowRight size={12} />
                </div>
              </motion.div>

              {/* Card 2 — Resume Customizer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => goToResumeTool('customizer')}
                className='group bg-gradient-to-b from-green-600 to-emerald-700 border-2 border-green-500 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer text-white relative overflow-hidden'>

                {/* Glow blob */}
                <div className='absolute -top-10 -right-10 w-40 h-40 bg-green-400/20 rounded-full blur-2xl' />

                <div className='relative'>
                  <div className='w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6'>
                    <FaMagic size={24} />
                  </div>

                  <div className='inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3'>
                    ONE-CLICK CUSTOMIZER
                  </div>

                  <h3 className='font-bold text-xl mb-3'>Tailor Resume to Any Job</h3>
                  <p className='text-green-100 text-sm leading-relaxed mb-6'>
                    Paste a job description, upload your resume, and let AI rewrite it
                    to perfectly match. Review diff-view changes before downloading.
                  </p>

                  <div className='space-y-2 mb-6'>
                    {['Match score before & after', 'Section-by-section diff view', 'Download as PDF'].map(f => (
                      <div key={f} className='flex items-center gap-2 text-sm text-green-100'>
                        <div className='w-1.5 h-1.5 bg-green-300 rounded-full' />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className='flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all'>
                    Customize Now <FaArrowRight size={12} />
                  </div>
                </div>
              </motion.div>

              {/* Card 3 — Cover Letter */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => goToResumeTool('coverletter')}
                className='group bg-white border-2 border-gray-100 hover:border-purple-400 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer'>

                <div className='w-14 h-14 bg-purple-50 group-hover:bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 transition'>
                  <FaFileAlt size={24} />
                </div>

                <div className='inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
                  COVER LETTER AI
                </div>

                <h3 className='font-bold text-xl text-gray-900 mb-3'>Compelling Cover Letters</h3>
                <p className='text-gray-500 text-sm leading-relaxed mb-6'>
                  Generate a professional, tailored cover letter from your resume and job
                  description in seconds. Copy or download as PDF.
                </p>

                <div className='space-y-2 mb-6'>
                  {['Job-description tailored', 'Professional 3-4 paragraphs', 'Copy or download PDF'].map(f => (
                    <div key={f} className='flex items-center gap-2 text-sm text-gray-600'>
                      <div className='w-1.5 h-1.5 bg-purple-500 rounded-full' />
                      {f}
                    </div>
                  ))}
                </div>

                <div className='flex items-center gap-2 text-purple-600 font-semibold text-sm group-hover:gap-3 transition-all'>
                  Generate Letter <FaArrowRight size={12} />
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── Interview Steps ── */}
          <div className='flex flex-col md:flex-row justify-center items-center gap-10 mb-28'>
            {
              [
                {
                  icon: <BsRobot size={24} />,
                  step: "STEP 1",
                  title: "Role & Experience Selection",
                  desc: "AI adjusts difficulty based on selected job role."
                },
                {
                  icon: <BsMic size={24} />,
                  step: "STEP 2",
                  title: "Smart Voice Interview",
                  desc: "Dynamic follow-up questions based on your answers."
                },
                {
                  icon: <BsClock size={24} />,
                  step: "STEP 3",
                  title: "Timer Based Simulation",
                  desc: "Real interview pressure with time tracking."
                }
              ].map((item, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 + index * 0.2 }}
                  whileHover={{ rotate: 0, scale: 1.06 }}
                  className={`
        relative bg-white rounded-3xl border-2 border-green-100 
        hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl 
        transition-all duration-300
        ${index === 0 ? "rotate-[-4deg]" : ""}
        ${index === 1 ? "rotate-[3deg] md:-mt-6 shadow-xl" : ""}
        ${index === 2 ? "rotate-[-3deg]" : ""}
      `}>

                  <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-white border-2 border-green-500 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg'>
                    {item.icon}</div>
                  <div className='pt-10 text-center'>
                    <div className='text-xs text-green-600 font-semibold mb-2 tracking-wider'>{item.step}</div>
                    <h3 className='font-semibold mb-3 text-lg'>{item.title}</h3>
                    <p className='text-sm text-gray-500 leading-relaxed'>{item.desc}</p>
                  </div>


                </motion.div>
              ))
            }
          </div>


          {/* ── Advanced AI Capabilities ── */}
          <div className='mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl font-semibold text-center mb-16'>
              Advanced AI{" "}
              <span className="text-green-600">Capabilities</span>
            </motion.h2>

            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    image: evalImg,
                    icon: <BsBarChart size={20} />,
                    title: "AI Answer Evaluation",
                    desc: "Scores communication, technical accuracy and confidence."
                  },
                  {
                    image: resumeImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Resume Based Interview",
                    desc: "Project-specific questions based on uploaded resume."
                  },
                  {
                    image: pdfImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Downloadable PDF Report",
                    desc: "Detailed strengths, weaknesses and improvement insights."
                  },
                  {
                    image: analyticsImg,
                    icon: <BsBarChart size={20} />,
                    title: "History & Analytics",
                    desc: "Track progress with performance graphs and topic analysis."
                  }
                ].map((item, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className='bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all'>
                    <div className='flex flex-col md:flex-row items-center gap-8'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-64' />
                      </div>

                      <div className='w-full md:w-1/2'>
                        <div className='bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6'>
                          {item.icon}
                        </div>
                        <h3 className='font-semibold mb-3 text-xl'>{item.title}</h3>
                        <p className='text-gray-500 text-sm leading-relaxed'>{item.desc}</p>
                      </div>

                    </div>


                  </motion.div>
                ))
              }
            </div>


          </div>

          {/* ── Interview Modes ── */}
          <div className='mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl font-semibold text-center mb-16'>
              Multiple Interview{" "}
              <span className="text-green-600">Modes</span>
            </motion.h2>

            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    img: hrImg,
                    title: "HR Interview Mode",
                    desc: "Behavioral and communication based evaluation."
                  },
                  {
                    img: techImg,
                    title: "Technical Mode",
                    desc: "Deep technical questioning based on selected role."
                  },

                  {
                    img: confidenceImg,
                    title: "Confidence Detection",
                    desc: "Basic tone and voice analysis insights."
                  },
                  {
                    img: creditImg,
                    title: "Credits System",
                    desc: "Unlock premium interview sessions easily."
                  }
                ].map((mode, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">

                    <div className='flex items-center justify-between gap-6'>
                      <div className="w-1/2">
                        <h3 className="font-semibold text-xl mb-3">
                          {mode.title}
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed">
                          {mode.desc}
                        </p>
                      </div>

                      <div className="w-1/2 flex justify-end">
                        <img
                          src={mode.img}
                          alt={mode.title}
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                    </div>


                  </motion.div>
                ))
              }
            </div>


          </div>

        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />

    </div>
  )
}

export default Home
