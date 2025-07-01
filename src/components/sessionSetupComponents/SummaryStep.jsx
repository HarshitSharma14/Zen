import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryStep = ({ sessionData, onStart, onPrev }) => {
    const [isStarting, setIsStarting] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const handleStart = () => {
        setIsStarting(true);
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onStart();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Format break details for display
    const getBreakDetails = () => {
        switch (sessionData.breakType) {
            case 'pomodoro':
                return '🍅 25min focus + 5min breaks + long break after 4 cycles';
            case 'regular':
                return `⏱️ ${sessionData.regularBreaks.breakDuration} min breaks, ${sessionData.regularBreaks.numberOfBreaks} total`;
            case 'custom':
                return `🎯 ${sessionData.customBreaks.length} custom breaks configured`;
            default:
                return 'No breaks configured';
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const countdownVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 25 }
        },
        exit: {
            opacity: 0,
            scale: 1.5,
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-10 blur-3xl"
                    animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Countdown Overlay */}
            <AnimatePresence>
                {isStarting && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="text-center"
                            variants={countdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            key={countdown}
                        >
                            <motion.div
                                className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotateY: [0, 180, 360]
                                }}
                                transition={{ duration: 1 }}
                            >
                                {countdown}
                            </motion.div>
                            <motion.p
                                className="text-white text-xl font-medium"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                Starting your focus session...
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <motion.h2
                        className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Review Your Session
                    </motion.h2>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Session Overview Card */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">📋</span>
                                Session Overview
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <h4 className="text-purple-200 font-medium mb-2 flex items-center gap-2">
                                        <span className="text-lg">✏️</span>
                                        Session Name
                                    </h4>
                                    <p className="text-white text-lg font-semibold">
                                        {sessionData.sessionName || 'Unnamed Session'}
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <h4 className="text-purple-200 font-medium mb-2 flex items-center gap-2">
                                        <span className="text-lg">⏰</span>
                                        Duration
                                    </h4>
                                    <p className="text-white text-lg font-semibold">
                                        {sessionData.isTimeBound
                                            ? `${sessionData.totalTime} minutes ${sessionData.isSessionTime ? '(total session)' : '(focus only)'}`
                                            : 'Unlimited time'
                                        }
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Break Configuration Card */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">☕</span>
                                Break Configuration
                            </h3>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <h4 className="text-purple-200 font-medium mb-2">Break Type</h4>
                                <p className="text-white text-lg font-semibold mb-2 capitalize">{sessionData.breakType}</p>
                                <p className="text-purple-100 text-sm">{getBreakDetails()}</p>

                                {/* Custom breaks details */}
                                {sessionData.breakType === 'custom' && sessionData.customBreaks.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h5 className="text-purple-200 text-sm font-medium">Custom Break Schedule:</h5>
                                        {sessionData.customBreaks.map((breakItem, index) => (
                                            <div key={index} className="text-xs text-purple-100 bg-white/5 rounded p-2">
                                                Break {index + 1}: {breakItem.duration} minutes after {breakItem.afterFocusTime} minutes of focus
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Windows Selection Card */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">🖼️</span>
                                Selected Windows
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Focus Windows */}
                                <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/20">
                                    <h4 className="text-green-200 font-medium mb-3 flex items-center gap-2">
                                        <span className="text-lg">🎯</span>
                                        Focus Windows ({sessionData.focusWindows?.length || 0})
                                    </h4>
                                    {sessionData.focusWindows?.length > 0 ? (
                                        <div className="space-y-2">
                                            {sessionData.focusWindows.map((window) => (
                                                <div key={window.id} className="text-sm text-green-100 bg-green-500/10 rounded p-2 flex items-center gap-2">
                                                    <span>{window.icon || '💻'}</span>
                                                    <span>{window.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-green-300 text-sm italic">No focus windows selected</p>
                                    )}
                                </div>

                                {/* Break Windows */}
                                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-400/20">
                                    <h4 className="text-orange-200 font-medium mb-3 flex items-center gap-2">
                                        <span className="text-lg">☕</span>
                                        Break Windows ({sessionData.breakWindows?.length || 0})
                                    </h4>
                                    {sessionData.breakWindows?.length > 0 ? (
                                        <div className="space-y-2">
                                            {sessionData.breakWindows.map((window) => (
                                                <div key={window.id} className="text-sm text-orange-100 bg-orange-500/10 rounded p-2 flex items-center gap-2">
                                                    <span>{window.icon || '🎵'}</span>
                                                    <span>{window.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-orange-300 text-sm italic">No break windows selected</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-xl">📊</span>
                                Session Statistics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {sessionData.focusWindows?.length || 0}
                                    </div>
                                    <p className="text-purple-200 text-sm">Focus Apps</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-400">
                                        {sessionData.breakWindows?.length || 0}
                                    </div>
                                    <p className="text-orange-200 text-sm">Break Apps</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">
                                        {sessionData.isTimeBound ? sessionData.totalTime : '∞'}
                                    </div>
                                    <p className="text-blue-200 text-sm">Minutes</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {sessionData.breakType === 'regular'
                                            ? sessionData.regularBreaks?.numberOfBreaks || 0
                                            : sessionData.breakType === 'custom'
                                                ? sessionData.customBreaks?.length || 0
                                                : sessionData.breakType === 'pomodoro' ? '4+' : '0'
                                        }
                                    </div>
                                    <p className="text-green-200 text-sm">Breaks</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Start Session Card */}
                        <motion.div
                            className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/30 text-center"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            <motion.div
                                className="text-6xl mb-4"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotateY: [0, 10, -10, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                🚀
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
                            <p className="text-purple-100 mb-6 max-w-md mx-auto">
                                Your session is configured and ready to go. Click the button below to begin your focus journey!
                            </p>

                            <motion.button
                                onClick={handleStart}
                                disabled={isStarting}
                                className={`px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl transition-all ${isStarting
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white hover:shadow-purple-500/50'
                                    }`}
                                whileHover={!isStarting ? {
                                    scale: 1.05,
                                    boxShadow: '0 25px 50px rgba(168, 85, 247, 0.5)'
                                } : {}}
                                whileTap={!isStarting ? { scale: 0.98 } : {}}
                            >
                                {isStarting ? 'Starting...' : '🎯 Start Focus Session'}
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="p-6 border-t border-white/10">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <motion.button
                            onClick={onPrev}
                            disabled={isStarting}
                            className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-medium hover:border-white/50 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={!isStarting ? { scale: 1.05 } : {}}
                            whileTap={!isStarting ? { scale: 0.95 } : {}}
                        >
                            ← Previous
                        </motion.button>

                        <div className="flex items-center gap-2 text-white/60 text-sm">
                            <span className="text-green-400">✓</span>
                            Session configured successfully
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryStep;