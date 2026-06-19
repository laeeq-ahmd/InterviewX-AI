import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    const requireAuth = (cb) => {
        if (!userData) { setShowAuth(true); return; }
        cb();
    }

    return (
        <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>

                {/* ── Logo — clicks back to home ── */}
                <div
                    onClick={() => navigate("/")}
                    className='flex items-center gap-3 cursor-pointer select-none'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <div className='hidden md:flex flex-col'>
                        <h1 className='font-semibold text-lg leading-tight text-gray-800'>CareerX AI</h1>
                        <span className='text-[10px] text-gray-400 font-medium tracking-wide block -mt-1'>(Formerly InterviewX AI)</span>
                    </div>
                </div>

                {/* ── Center nav links ── */}
                <div className='hidden md:flex items-center gap-1'>
                    <button
                        onClick={() => navigate("/interview")}
                        className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition'>
                        Mock Interview
                    </button>
                    <button
                        onClick={() => requireAuth(() => navigate("/resume-tools"))}
                        className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition'>
                        Resume Tools
                    </button>
                    <button
                        onClick={() => requireAuth(() => navigate("/history"))}
                        className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition'>
                        History
                    </button>
                    <button
                        onClick={() => navigate("/pricing")}
                        className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition'>
                        Pricing
                    </button>
                </div>

                {/* ── Right side: credits + avatar ── */}
                <div className='flex items-center gap-4'>

                    {/* Credits */}
                    <div className='relative'>
                        <button onClick={() => {
                            if (!userData) { setShowAuth(true); return; }
                            setShowCreditPopup(!showCreditPopup);
                            setShowUserPopup(false)
                        }} className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition'>
                            <BsCoin size={18} />
                            {userData?.credits || 0}
                        </button>

                        {showCreditPopup && (
                            <div className='absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50'>
                                <p className='text-sm text-gray-600 mb-4'>Need more credits to continue interviews?</p>
                                <button onClick={() => { navigate("/pricing"); setShowCreditPopup(false); }} className='w-full bg-black text-white py-2 rounded-lg text-sm'>Buy more credits</button>
                            </div>
                        )}
                    </div>

                    {/* User avatar */}
                    <div className='relative'>
                        <button
                            onClick={() => {
                                if (!userData) { setShowAuth(true); return; }
                                setShowUserPopup(!showUserPopup);
                                setShowCreditPopup(false)
                            }}
                            className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm'>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
                        </button>

                        {showUserPopup && (
                            <div className='absolute right-0 mt-3 w-44 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
                                <p className='text-sm text-blue-500 font-medium mb-3 truncate'>{userData?.name}</p>
                                <div className='border-t border-gray-100 pt-2'>
                                    <button onClick={handleLogout}
                                        className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 hover:text-red-600 transition'>
                                        <HiOutlineLogout size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        </div>
    )
}

export default Navbar
