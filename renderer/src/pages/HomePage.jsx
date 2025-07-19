import React from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';

const HomePage = () => {
    const { setCurrentPage } = useAppStore();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-5, 5, -5],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full opacity-10 blur-3xl"
                    animate={{
                        x: [0, -60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Welcome Header */}
                <motion.div
                    className="text-center my-16"
                    variants={itemVariants}
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6"
                        variants={floatingVariants}
                        animate="animate"
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        className="text-xl md:text-2xl text-purple-100 font-light max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                        Ready to boost your productivity? Start tracking your focus and build better habits today.
                    </motion.p>
                </motion.div>

                {/* Main Action Card */}
                <motion.div
                    className="w-full max-w-lg mx-auto"
                    variants={itemVariants}
                >
                    <motion.div
                        className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center"
                        whileHover={{
                            scale: 1.02,
                            boxShadow: '0 25px 50px rgba(139, 92, 246, 0.3)'
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {/* Icon */}
                        <motion.div
                            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.8 }}
                        >
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Start Your Journey
                        </h2>

                        <p className="text-purple-100 text-lg mb-10 leading-relaxed">
                            Create your first focus session and begin tracking your productivity in real-time
                        </p>

                        {/* Main CTA Button */}
                        <motion.button
                            onClick={() => setCurrentPage('session-setup')}
                            className="w-full py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold text-xl rounded-2xl shadow-2xl relative overflow-hidden group"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 20px 40px rgba(168, 85, 247, 0.5)'
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.span
                                className="relative z-10 flex items-center justify-center gap-3"
                                initial={{ x: 0 }}
                                whileHover={{ x: 5 }}
                            >
                                Create New Session
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </motion.span>

                            {/* Animated Background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '0%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Quick Stats or Tips */}
                {/* <motion.div
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto"
                    variants={itemVariants}
                >
                    {[
                        {
                            icon: "🎯",
                            title: "Stay Focused",
                            desc: "Track your active windows and minimize distractions"
                        },
                        {
                            icon: "⚡",
                            title: "Real-time Data",
                            desc: "Get instant feedback on your productivity patterns"
                        },
                        {
                            icon: "👥",
                            title: "Study Together",
                            desc: "Join multiplayer sessions and compete with friends"
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.8 }}
                            whileHover={{
                                scale: 1.05,
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }}
                        >
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-purple-200 text-sm">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div> */}

                {/* Navigation Helper */}
                {/* <motion.div
                    className="mt-12"
                    variants={itemVariants}
                >
                    <motion.button
                        onClick={() => setCurrentPage('menu')}
                        className="text-purple-300 hover:text-purple-200 text-sm font-medium flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Landing
                    </motion.button>
                </motion.div> */}
            </motion.div>
        </div>
    );
};

export default HomePage;