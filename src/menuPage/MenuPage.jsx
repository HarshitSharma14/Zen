import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MenuPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"
                    animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-3xl"
                    animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-15 blur-3xl"
                    animate={{ x: [-150, 150, -150], y: [-100, 100, -100] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <motion.div
                className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="text-center mb-10" variants={itemVariants}>
                    <motion.h1
                        className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4"
                        variants={pulseVariants}
                    // animate="animate"
                    >
                        Focus Tracker
                    </motion.h1>
                    <motion.p
                        className="text-xl md:text-2xl text-blue-100 font-light"
                        variants={floatingVariants}
                    // animate="animate"
                    >
                        Transform your productivity with gamified focus sessions
                    </motion.p>
                </motion.div>

                {/* Feature Pills */}
                {/* <motion.div
                    className="flex flex-wrap justify-center gap-4 mb-2"
                    variants={itemVariants}
                >
                    {['Session Tracking', 'Multiplayer Mode', 'Progress Analytics', 'Distraction Blocking'].map((feature, index) => (
                        <motion.div
                            key={feature}
                            className="px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-white font-medium"
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                        >
                            {feature}
                        </motion.div>
                    ))}
                </motion.div> */}

                {/* Main Card */}
                <motion.div
                    className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {/* Toggle Buttons */}
                    <div className="flex bg-white/10 rounded-2xl p-1 mb-8">
                        <motion.button
                            className={`flex-1 py-3 text-center rounded-xl font-semibold transition-all ${isLogin
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                : 'text-white/70 hover:text-white'
                                }`}
                            onClick={() => setIsLogin(true)}
                            whileTap={{ scale: 0.98 }}
                        >
                            Login
                        </motion.button>
                        <motion.button
                            className={`flex-1 py-3 text-center rounded-xl font-semibold transition-all ${!isLogin
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                : 'text-white/70 hover:text-white'
                                }`}
                            onClick={() => setIsLogin(false)}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign Up
                        </motion.button>
                    </div>

                    {/* Form */}
                    <motion.div
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-6">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                                    />
                                </motion.div>
                            )}

                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                            />

                            <motion.button
                                className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="relative z-10">
                                    {isLogin ? 'Login & Start Tracking' : 'Create Account & Track Progress'}
                                </span>
                            </motion.button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-white/60 text-sm">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <motion.button
                                    className="text-purple-300 hover:text-purple-200 ml-1 font-medium"
                                    onClick={() => setIsLogin(!isLogin)}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {isLogin ? 'Sign up' : 'Login'}
                                </motion.button>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Continue Without Login */}
                <motion.div
                    className="mt-8"
                    variants={itemVariants}
                >
                    <motion.button
                        className="px-8 py-3 text-white/80 hover:text-white border-2 border-white/30 hover:border-white/50 rounded-xl font-medium transition-all backdrop-blur-sm"
                        whileHover={{
                            scale: 1.05,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(255,255,255,0.6)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Continue Without Login
                    </motion.button>
                </motion.div>

                {/* Bottom Stats */}
                {/* <motion.div
                    className="flex flex-wrap justify-center gap-8 mt-12 text-center"
                    variants={itemVariants}
                >
                    {[
                        { number: '10K+', label: 'Active Users' },
                        { number: '1M+', label: 'Focus Hours' },
                        { number: '95%', label: 'Productivity Boost' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 1 }}
                        >
                            <div className="text-2xl font-bold text-white">{stat.number}</div>
                            <div className="text-blue-200 text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div> */}
            </motion.div>
        </div>
    );
};

export default MenuPage;