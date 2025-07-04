import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryStep = ({ sessionData, onStart, onPrev }) => {
    const [isStarting, setIsStarting] = useState(false);
    const [countdown, setCountdown] = useState(3);
    // Add this after your existing useState declarations
    const [currentTime, setCurrentTime] = useState(new Date());
    const handleStart = () => {
        setIsStarting(true);
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);

                    // Prepare complete session config with timeline
                    const sessionConfig = {
                        ...sessionData,
                        timeline: sessionTimeline, // Include the calculated timeline
                        startTime: new Date()
                    };

                    // Start session with config
                    onStart(sessionConfig);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Add this useEffect after your existing state declarations
    useEffect(() => {
        if (isStarting) return
        const scheduleNextUpdate = () => {
            const now = new Date();
            // Calculate milliseconds until next minute boundary
            const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

            return setTimeout(() => {
                setCurrentTime(new Date());
                // Schedule the next update for the following minute
                scheduleNextUpdate();
            }, msUntilNextMinute);
        };

        // Schedule the first update
        const timeoutId = scheduleNextUpdate();

        // Cleanup on unmount
        return () => clearTimeout(timeoutId);
    }, [isStarting]); // Empty dependency array - only run once on mount

    // Calculate session timeline
    const sessionTimeline = useMemo(() => {
        if (!sessionData.isTimeBound) {
            return [{ type: 'focus', duration: '∞', label: 'Unlimited Focus Time' }];
        }

        const timeline = [];
        let currentTime = 0;
        const startTime = new Date();

        const addSegment = (type, duration, label) => {
            const segmentStart = new Date(startTime.getTime() + currentTime * 60000);
            const segmentEnd = new Date(startTime.getTime() + (currentTime + duration) * 60000);

            timeline.push({
                type,
                duration,
                label,
                cumulativeTime: currentTime + duration,
                startTime: segmentStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: segmentEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            currentTime += duration;
        };


        switch (sessionData.breakType) {
            case 'pomodoro': {
                console.log(sessionData)
                let timeUsed = 0;
                let focusTimeUsed = 0;
                let cycleCount = 0;
                while (true) {
                    // Determine how much focus time we can add
                    console.log(cycleCount)
                    let focusTime = 25; // Standard pomodoro focus time

                    if (sessionData.isSessionTime) {
                        // Total time includes breaks - check remaining total time
                        const remainingTotal = sessionData.totalTime - timeUsed;
                        focusTime = Math.min(25, remainingTotal);
                    } else {
                        // Total time is focus only - check remaining focus time
                        const remainingFocus = sessionData.totalTime - focusTimeUsed;
                        focusTime = Math.min(25, remainingFocus);
                    }

                    if (focusTime <= 0) break;

                    addSegment('focus', focusTime, `Focus Period ${cycleCount + 1}`);
                    timeUsed += focusTime;
                    focusTimeUsed += focusTime;

                    // Check if we've reached our focus time limit (for focus-only mode)
                    if (!sessionData.isSessionTime && focusTimeUsed >= sessionData.totalTime) break;

                    // Add break if there's time/need
                    const isLongBreak = (cycleCount + 1) % 4 === 0;
                    let breakTime = isLongBreak ? 15 : 5; // Standard break times

                    if (sessionData.isSessionTime) {
                        // Break counts toward total time - check if it fits
                        const remainingTotal = sessionData.totalTime - timeUsed;
                        breakTime = Math.min(breakTime, remainingTotal);

                        if (breakTime <= 0) break; // No time left for break
                    }

                    addSegment('break', breakTime, isLongBreak ? `Long Break ${Math.floor(cycleCount / 4) + 1}` : `Break ${cycleCount + 1}`);
                    timeUsed += breakTime;

                    cycleCount++;

                    // Check if we've used up total session time (for total-time mode)
                    if (sessionData.isSessionTime && timeUsed >= sessionData.totalTime) break;
                }
                break;
            }
            case 'regular': {
                let timeUsed = 0;
                let focusTimeUsed = 0;
                const { breakDuration, breakAfterFocusTime } = sessionData.regularBreaks;
                let periodCount = 0;

                while (true) {
                    // Add focus segment
                    let focusTime = breakAfterFocusTime;

                    if (sessionData.isSessionTime) {
                        // Total time includes breaks - check remaining total time
                        const remainingTotal = sessionData.totalTime - timeUsed;
                        focusTime = Math.min(breakAfterFocusTime, remainingTotal);
                    } else {
                        // Total time is focus only - check remaining focus time
                        const remainingFocus = sessionData.totalTime - focusTimeUsed;
                        focusTime = Math.min(breakAfterFocusTime, remainingFocus);
                    }

                    if (focusTime <= 0) break;

                    addSegment('focus', focusTime, `Focus Period ${periodCount + 1}`);
                    timeUsed += focusTime;
                    focusTimeUsed += focusTime;

                    // Check if we've reached our focus time limit (for focus-only mode)
                    if (!sessionData.isSessionTime && focusTimeUsed >= sessionData.totalTime) break;

                    // Add break if there's time/need
                    let breakTime = breakDuration;

                    if (sessionData.isSessionTime) {
                        // Break counts toward total time - check if it fits
                        const remainingTotal = sessionData.totalTime - timeUsed;
                        breakTime = Math.min(breakDuration, remainingTotal);

                        if (breakTime <= 0) break; // No time left for break
                    }

                    addSegment('break', breakTime, `Break ${periodCount + 1}`);
                    timeUsed += breakTime;

                    periodCount++;

                    // Check if we've used up total session time (for total-time mode)
                    if (sessionData.isSessionTime && timeUsed >= sessionData.totalTime) break;
                }
                break;
            }
            case 'custom': {
                let timeUsed = 0;
                let focusTimeUsed = 0;

                // Add all custom break segments
                for (let i = 0; i < sessionData.customBreaks.length; i++) {
                    const breakItem = sessionData.customBreaks[i];

                    // Add focus segment
                    let focusTime = breakItem.afterFocusTime;

                    if (sessionData.isSessionTime) {
                        // Check remaining total time
                        const remainingTotal = sessionData.totalTime - timeUsed;
                        focusTime = Math.min(breakItem.afterFocusTime, remainingTotal);
                    } else {
                        // Check remaining focus time  
                        const remainingFocus = sessionData.totalTime - focusTimeUsed;
                        focusTime = Math.min(breakItem.afterFocusTime, remainingFocus);
                    }

                    if (focusTime <= 0) break;

                    addSegment('focus', focusTime, `Focus Period ${i + 1}`);
                    timeUsed += focusTime;
                    focusTimeUsed += focusTime;

                    // Check if focus time limit reached (focus-only mode)
                    if (!sessionData.isSessionTime && focusTimeUsed >= sessionData.totalTime) break;

                    // Add break
                    let breakTime = breakItem.duration;

                    if (sessionData.isSessionTime) {
                        // Break counts toward total time
                        const remainingTotal = sessionData.totalTime - timeUsed;
                        breakTime = Math.min(breakItem.duration, remainingTotal);
                        if (breakTime <= 0) break;
                    }

                    addSegment('break', breakTime, `Break ${i + 1}`);
                    timeUsed += breakTime;

                    // Check if total session time used up
                    if (sessionData.isSessionTime && timeUsed >= sessionData.totalTime) break;
                }

                // Add remaining time as final focus
                let remainingTime = 0;
                if (sessionData.isSessionTime) {
                    remainingTime = sessionData.totalTime - timeUsed;
                } else {
                    remainingTime = sessionData.totalTime - focusTimeUsed;
                }

                if (remainingTime > 0) {
                    addSegment('focus', remainingTime, 'Final Focus');
                }
                break;
            }
            default:
                addSegment('focus', sessionData.totalTime, 'Focus Session');
        }

        return timeline;
    }, [sessionData, currentTime]);

    const totalSessionTime = sessionTimeline.reduce((total, segment) => total + (segment.duration === '∞' ? 0 : segment.duration), 0);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const timelineVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
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
                        Session Timeline Preview
                    </motion.h2>
                    <p className="text-purple-200 mt-2">Your complete session schedule with exact timings</p>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Session Overview */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">📋</span>
                                Session Overview
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <h4 className="text-purple-200 text-sm font-medium mb-1">Session Name</h4>
                                    <p className="text-white font-semibold">{sessionData.sessionName || 'Unnamed Session'}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <h4 className="text-blue-200 text-sm font-medium mb-1">Total Duration</h4>
                                    <p className="text-blue-400 text-xl font-bold">
                                        {sessionData.isTimeBound ? `${totalSessionTime} min` : '∞'}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <h4 className="text-green-200 text-sm font-medium mb-1">Focus Windows</h4>
                                    <p className="text-green-400 text-xl font-bold">{sessionData.focusWindows?.length || 0}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <h4 className="text-orange-200 text-sm font-medium mb-1">Break Windows</h4>
                                    <p className="text-orange-400 text-xl font-bold">{sessionData.breakWindows?.length || 0}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Session Timeline */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">⏱️</span>
                                Session Timeline
                            </h3>

                            <div className="space-y-4">
                                {sessionTimeline.map((segment, index) => (
                                    <motion.div
                                        key={index}
                                        className={`relative flex items-center gap-6 p-4 rounded-xl border-2 ${segment.type === 'focus'
                                            ? 'bg-green-500/10 border-green-400/30'
                                            : 'bg-orange-500/10 border-orange-400/30'
                                            }`}
                                        variants={timelineVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {/* Timeline connector */}
                                        {index < sessionTimeline.length - 1 && (
                                            <div className="absolute left-2 top-6 w-0.5 h-16 bg-white/20"></div>
                                        )}

                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${segment.type === 'focus'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-orange-500 text-white'
                                            }`}>
                                            {segment.type === 'focus' ? '🎯' : '☕'}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-semibold ${segment.type === 'focus' ? 'text-green-200' : 'text-orange-200'
                                                    }`}>
                                                    {segment.label}
                                                </h4>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${segment.type === 'focus'
                                                        ? 'bg-green-400/20 text-green-300'
                                                        : 'bg-orange-400/20 text-orange-300'
                                                        }`}>
                                                        {segment.duration === '∞' ? '∞' : `${segment.duration} min`}
                                                    </span>
                                                </div>
                                            </div>

                                            {sessionData.isTimeBound && segment.duration !== '∞' && (
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-white/60">Start Time:</span>
                                                        <p className="text-white font-medium">{segment.startTime}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/60">End Time:</span>
                                                        <p className="text-white font-medium">{segment.endTime}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/60">Total Elapsed:</span>
                                                        <p className="text-white font-medium">{segment.cumulativeTime} min</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Windows Selection Summary */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">🖼️</span>
                                Window Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Focus Windows */}
                                <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/20">
                                    <h4 className="text-green-200 font-medium mb-3 flex items-center gap-2">
                                        <span className="text-lg">🎯</span>
                                        Focus Windows ({sessionData.focusWindows?.length || 0})
                                    </h4>
                                    {sessionData.focusWindows?.length > 0 ? (
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {sessionData.focusWindows.map((window, index) => (
                                                <div key={window.id || index} className="text-sm text-green-100 bg-green-500/10 rounded p-2 flex items-center gap-2">
                                                    <span>💻</span>
                                                    <span className="truncate">{window.name}</span>
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
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {sessionData.breakWindows.map((window, index) => (
                                                <div key={window.id || index} className="text-sm text-orange-100 bg-orange-500/10 rounded p-2 flex items-center gap-2">
                                                    <span>🎵</span>
                                                    <span className="truncate">{window.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-orange-300 text-sm italic">No break windows selected</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Start Session Card */}
                        <motion.div
                            className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-400/30 text-center"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
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
                            <h3 className="text-2xl font-bold text-white mb-4">Ready to Begin?</h3>
                            <p className="text-purple-100 mb-6 max-w-md mx-auto">
                                Your session timeline is set! Starting now will follow the exact schedule shown above.
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
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
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
                            Timeline configured • Starting {sessionData.isTimeBound ? `at ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'now'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryStep;