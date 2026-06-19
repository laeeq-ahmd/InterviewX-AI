import React from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
function Auth({isModel = false}) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const handleGoogleAuth = async () => {
        if (loading) return;
        setLoading(true)
        setError('')
        try {
            const response = await signInWithPopup(auth, provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            console.log("[Auth] Firebase OK:", email)
            const result = await axios.post(ServerUrl + "/api/auth/google", {name, email}, {withCredentials: true})
            console.log("[Auth] Backend OK:", result.data)
            dispatch(setUserData(result.data))
            if (!isModel) {
                navigate("/")
            }
        } catch (error) {
            console.error("[Auth] Error:", error?.response?.data || error?.message || error)
            setError(error?.response?.data?.message || error?.message || "Sign in failed. Please try again.")
            dispatch(setUserData(null))
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className={`
      w-full 
      ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}
    `}>
        <motion.div 
        initial={{opacity:0 , y:-40}} 
        animate={{opacity:1 , y:0}} 
        transition={{duration:1.05}}
        className={`
        w-full 
        ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
        bg-white shadow-2xl border border-gray-200
      `}>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <BsRobot size={18}/>

                </div>
                <div className='flex flex-col'>
                    <h2 className='font-semibold text-lg leading-tight text-gray-800'>CareerX AI</h2>
                    <span className='text-[10px] text-gray-400 font-medium tracking-wide block -mt-1'>(Formerly InterviewX AI)</span>
                </div>
            </div>

            <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                Continue with
                <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparkles size={16}/>
                    AI Smart Interview

                </span>
            </h1>

            <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                Sign in to start AI-powered mock interviews,
        track your progress, and unlock detailed performance insights.
            </p>


            <motion.button 
            onClick={handleGoogleAuth}
            disabled={loading}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1 , scale:0.98}}
            className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:opacity-60 disabled:cursor-not-allowed'>
                <FcGoogle size={20}/>
                {loading ? "Signing in..." : "Continue with Google"}
            </motion.button>

            {error && (
                <p className='mt-4 text-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3'>
                    {error}
                </p>
            )}
        </motion.div>

      
    </div>
  )
}

export default Auth
