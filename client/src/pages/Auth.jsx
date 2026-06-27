import React, { useState } from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function Auth({ isModel = false }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // "login" | "signup"
    const [tab, setTab] = useState("login")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form fields
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const resetForm = () => {
        setName(''); setEmail(''); setPassword(''); setError('')
    }

    const switchTab = (t) => {
        setTab(t)
        resetForm()
    }

    // ─── Finish auth: store user + navigate ───────────────────────────────────
    const onSuccess = (userData) => {
        dispatch(setUserData(userData))
        if (!isModel) navigate("/")
    }

    // ─── Google ───────────────────────────────────────────────────────────────
    const handleGoogleAuth = async () => {
        if (loading) return;
        setLoading(true); setError('')
        try {
            const response = await signInWithPopup(auth, provider)
            const { displayName: gName, email: gEmail } = response.user
            const result = await axios.post(ServerUrl + "/api/auth/google", { name: gName, email: gEmail }, { withCredentials: true })
            onSuccess(result.data)
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Google sign in failed. Try again.")
            dispatch(setUserData(null))
        } finally {
            setLoading(false)
        }
    }

    // ─── Email / Password — Login ─────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault()
        if (loading) return;
        setLoading(true); setError('')
        try {
            const result = await axios.post(ServerUrl + "/api/auth/login", { email, password }, { withCredentials: true })
            onSuccess(result.data)
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed. Check your credentials.")
        } finally {
            setLoading(false)
        }
    }

    // ─── Email / Password — Sign Up ───────────────────────────────────────────
    const handleSignup = async (e) => {
        e.preventDefault()
        if (loading) return;
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true); setError('')
        try {
            const result = await axios.post(ServerUrl + "/api/auth/register", { name, email, password }, { withCredentials: true })
            onSuccess(result.data)
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed. Try again.")
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition placeholder-gray-400"

    return (
        <div className={`w-full ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}`}>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"} bg-white shadow-2xl border border-gray-200`}
            >
                {/* Logo */}
                <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <div className='flex flex-col'>
                        <h2 className='font-semibold text-lg leading-tight text-gray-800'>CareerX AI</h2>
                        <span className='text-[10px] text-gray-400 font-medium tracking-wide block -mt-1'>(Formerly InterviewX AI)</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-6'>
                    Continue with
                    <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2 ml-2'>
                        <IoSparkles size={16} />
                        AI Smart Interview
                    </span>
                </h1>

                {/* Tab Switcher */}
                <div className='flex bg-gray-100 rounded-xl p-1 mb-6'>
                    {["login", "signup"].map((t) => (
                        <button
                            key={t}
                            onClick={() => switchTab(t)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${tab === t ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {t === "login" ? "Log In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                    {tab === "login" ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            onSubmit={handleLogin}
                            className='space-y-3'
                        >
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className={inputClass}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className={inputClass}
                            />
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ opacity: 0.9, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className='w-full py-3 bg-black text-white text-sm font-semibold rounded-full shadow disabled:opacity-60 disabled:cursor-not-allowed transition'
                            >
                                {loading ? "Signing in..." : "Log In"}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="signup"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            onSubmit={handleSignup}
                            className='space-y-3'
                        >
                            <input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className={inputClass}
                            />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className={inputClass}
                            />
                            <input
                                type="password"
                                placeholder="Password (min. 6 characters)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className={inputClass}
                            />
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ opacity: 0.9, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className='w-full py-3 bg-black text-white text-sm font-semibold rounded-full shadow disabled:opacity-60 disabled:cursor-not-allowed transition'
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Divider */}
                <div className='flex items-center gap-3 my-5'>
                    <div className='flex-1 h-px bg-gray-200' />
                    <span className='text-xs text-gray-400 font-medium'>or</span>
                    <div className='flex-1 h-px bg-gray-200' />
                </div>

                {/* Google Button */}
                <motion.button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    whileHover={{ opacity: 0.9, scale: 1.03 }}
                    whileTap={{ opacity: 1, scale: 0.98 }}
                    className='w-full flex items-center justify-center gap-3 py-3 border border-gray-200 bg-white text-gray-700 text-sm font-semibold rounded-full shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition'
                >
                    <FcGoogle size={20} />
                    Continue with Google
                </motion.button>

                {/* Error */}
                {error && (
                    <p className='mt-4 text-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3'>
                        {error}
                    </p>
                )}

                {/* Toggle hint */}
                <p className='mt-5 text-center text-xs text-gray-400'>
                    {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                        className='text-green-600 font-semibold hover:underline'
                    >
                        {tab === "login" ? "Sign Up" : "Log In"}
                    </button>
                </p>
            </motion.div>
        </div>
    )
}

export default Auth
