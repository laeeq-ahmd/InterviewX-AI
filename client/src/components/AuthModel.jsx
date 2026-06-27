import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from 'motion/react';
import Auth from '../pages/Auth';

function AuthModel({ onClose }) {
    const { userData } = useSelector((state) => state.user)

    useEffect(() => {
        if (userData) { onClose() }
    }, [userData, onClose])

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className='fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm px-4'
                onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            >
                <motion.div
                    key="modal"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className='relative w-full max-w-md'
                >
                    <button
                        onClick={onClose}
                        className='absolute top-8 right-5 text-gray-500 hover:text-black transition z-10'
                    >
                        <FaTimes size={18} />
                    </button>
                    <Auth isModel={true} />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default AuthModel
