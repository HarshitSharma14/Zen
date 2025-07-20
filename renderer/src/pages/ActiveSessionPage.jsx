import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import { ScheduleOverlay } from '../components/activeSessionComponents/ScheduleOverlay';
import { WindowSelectionDialog } from '../components/activeSessionComponents/WinowSelectionDialogBox';


const ActiveSessionPage = () => {
    const {
        activeSession,
        sessionConfig,
        updateSessionProgress,
        endSession,
        setCurrentPage,
        setCurrentWindow,
        currentWindow,
        updateSessionConfig,
        startSession
    } = useAppStore();

    const [showSchedule, setShowSchedule] = useState(false);
    const [showWindowConfig, setShowWindowConfig] = useState(false);
    const [windowConfigType, setWindowConfigType] = useState('focus');

    // Check if we have a valid session on mount
    useEffect(() => {
        if (!activeSession.isActive && sessionConfig && sessionConfig.timeline && sessionConfig.timeline.length > 0) {
            console.log('Found session config but no active session, restarting session');
            // Restart the session with existing config
            startSession(sessionConfig);
        }
    }, [activeSession.isActive, sessionConfig, startSession]);

    // Calculate current segment index
    const getCurrentSegmentIndex = () => {
        if (!activeSession.timeline || activeSession.timeline.length === 0) return 0;

        let cumulativeTime = 0;
        for (let i = 0; i < activeSession.timeline.length; i++) {
            const segment = activeSession.timeline[i];
            if (activeSession.elapsedTime < cumulativeTime + (segment.duration * 60)) {
                return i;
            }
            cumulativeTime += segment.duration * 60;
        }
        return activeSession.timeline.length - 1;
    };

    const currentSegmentIndex = getCurrentSegmentIndex();


    // Window Tracking
    useEffect(() => {
        const interval = setInterval(async () => {
            const currentWindow = await window.electronAPI.getCurrentWindow()
            console.log(currentWindow)
            if (currentWindow)
                setCurrentWindow(currentWindow)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // Listen for window type selection
    useEffect(() => {
        const handleWindowTypeSelected = (data) => {
            const { windowInfo, type } = data;

            console.log(sessionConfig.focusWindows)

            // Update session config with the new window
            const updatedConfig = {
                focusWindows: type === 'focus'
                    ? [...sessionConfig.focusWindows, { name: windowInfo.name, appIcon: windowInfo.appIconDataURL, id: windowInfo.id }]
                    : sessionConfig.focusWindows,
                breakWindows: type === 'break'
                    ? [...sessionConfig.breakWindows, { name: windowInfo.name, appIcon: windowInfo.appIconDataURL, id: windowInfo.id }]
                    : sessionConfig.breakWindows
            };

            // Update the store
            updateSessionConfig(updatedConfig);
            console.log('Window type selected:', type, 'for window:', windowInfo);
        };

        window.electronAPI.onWindowTypeSelected(handleWindowTypeSelected);

        return () => {
            // Cleanup listener if needed
        };
    }, [sessionConfig]);


    useEffect(() => {
        async function openDialog() {
            console.log('currentWindow', activeSession.currentWindow)
            console.log('sessionConfig.focusWindows', sessionConfig.focusWindows)
            console.log('sessionConfig.breakWindows', sessionConfig.breakWindows)
            const old = sessionConfig.focusWindows.some((window) => {
                return window.id === activeSession.currentWindow.id
            }) || sessionConfig.breakWindows.some((window) => {
                return window.id === activeSession.currentWindow.id
            })
            if (activeSession.currentWindow && !old) {
                console.log('in')
                // Show the dialog for new window
                await window.electronAPI.showNewWindowDialog(activeSession.currentWindow);
            }
        }
        openDialog()
    }, [activeSession.currentWindow])


    // Update session progress every second
    useEffect(() => {
        if (!activeSession.isActive) return;

        const interval = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now - new Date(activeSession.startTime)) / 1000);
            updateSessionProgress(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession.isActive, activeSession.startTime]);

    // Calculate timeline with cumulative start times
    const processedTimeline = activeSession.timeline?.map((segment, index) => {
        let cumulativeStart = 0;
        for (let i = 0; i < index; i++) {
            cumulativeStart += activeSession.timeline[i].duration;
        }
        return { ...segment, cumulativeStart };
    }) || [];

    // Format time helpers
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };



    const getCurrentSegmentTimeLeft = () => {
        const currentSegment = activeSession.timeline[currentSegmentIndex];
        if (!currentSegment) return 0;

        let segmentStart = 0;
        for (let i = 0; i < currentSegmentIndex; i++) {
            segmentStart += activeSession.timeline[i].duration * 60;
        }

        const segmentElapsed = activeSession.elapsedTime - segmentStart;
        return Math.max(0, (currentSegment.duration * 60) - segmentElapsed);
    };

    const handleEndSession = () => {
        endSession();
        setCurrentPage('home');
    };

    const handleWindowConfig = (type) => {
        setWindowConfigType(type);
        setShowWindowConfig(true);
    };


    if (!activeSession.isActive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">No Active Session</h2>
                    <button
                        onClick={() => setCurrentPage('home')}
                        className="px-6 py-3 bg-purple-500 rounded-xl"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

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

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        {/* Left - Window Configuration */}
                        <div className="flex gap-3">
                            <motion.button
                                onClick={() => handleWindowConfig('focus')}
                                className="px-4 py-2 bg-green-500/20 border border-green-400/50 text-green-200 rounded-lg hover:bg-green-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                🎯 Configure Focus Windows
                            </motion.button>
                            <motion.button
                                onClick={() => handleWindowConfig('break')}
                                className="px-4 py-2 bg-orange-500/20 border border-orange-400/50 text-orange-200 rounded-lg hover:bg-orange-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ☕ Configure Break Windows
                            </motion.button>
                        </div>

                        {/* Center - Session Title */}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white">
                                {sessionConfig?.sessionName || 'Focus Session'}
                            </h1>
                        </div>

                        {/* Right - Controls */}
                        <div className="flex gap-3 relative">
                            <motion.button
                                onClick={() => setShowSchedule(!showSchedule)}
                                className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📋 See Schedule
                            </motion.button>
                            <motion.button
                                onClick={handleEndSession}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                End Session
                            </motion.button>

                            {/* Schedule Overlay */}
                            <AnimatePresence>
                                {showSchedule && (
                                    <ScheduleOverlay
                                        isOpen={showSchedule}
                                        onClose={() => setShowSchedule(false)}
                                        timeline={processedTimeline}
                                        currentIndex={currentSegmentIndex}
                                        startTime={new Date(activeSession.startTime)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center px-8">
                    <div className="flex items-center justify-center gap-8 w-full max-w-7xl">
                        {/* Previous 4 Segments (Left Side) */}
                        <div className="flex items-center gap-4 flex-1 justify-end">
                            {processedTimeline.slice(Math.max(0, currentSegmentIndex - 4), currentSegmentIndex).map((segment, reverseIndex) => {
                                const distanceFromCenter = 4 - reverseIndex;
                                const scale = Math.max(0.3, 1.3 - (distanceFromCenter * 0.1));
                                const opacity = Math.max(0.2, 1 - (distanceFromCenter * 0.2));
                                const originalIndex = currentSegmentIndex - 1 - reverseIndex;
                                const startTime = new Date(new Date(activeSession.startTime).getTime() + segment.cumulativeStart * 60000);

                                return (
                                    <motion.div
                                        key={originalIndex}
                                        className="flex flex-col items-center relative"
                                        style={{ zIndex: 10 - distanceFromCenter }}
                                        initial={{ scale: 0, opacity: 0, x: 100 }}
                                        animate={{
                                            scale: scale,
                                            opacity: opacity,
                                            x: 0,
                                            y: distanceFromCenter * 5
                                        }}
                                        transition={{
                                            delay: reverseIndex * 0.1,
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    >
                                        <motion.div
                                            className={`rounded-full border-4 flex flex-col items-center justify-center relative shadow-lg bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300`}
                                            style={{
                                                width: `${120 * scale}px`,
                                                height: `${120 * scale}px`,
                                                filter: `brightness(${0.4 + (0.6 * opacity)})`
                                            }}
                                        >
                                            <div className="text-gray-200 font-bold" style={{ fontSize: `${16 * scale}px` }}>
                                                {segment.duration}m
                                            </div>
                                            <div style={{ fontSize: `${20 * scale}px` }}>
                                                {segment.type === 'focus' ? '🎯' : '☕'}
                                            </div>

                                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full flex items-center justify-center"
                                                style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }}>
                                                <span className="text-white font-bold" style={{ fontSize: `${10 * scale}px` }}>✓</span>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="mt-2 text-center"
                                            style={{ opacity: opacity * 0.7 }}
                                        >
                                            <div className="text-white/70 font-medium" style={{ fontSize: `${12 * scale}px` }}>
                                                {segment.label}
                                            </div>
                                            <div className="text-white/50" style={{ fontSize: `${10 * scale}px` }}>
                                                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Current Segment (Center) */}
                        <motion.div
                            className="flex flex-col items-center z-50 relative"
                            key={currentSegmentIndex}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <motion.div
                                className={`w-80 h-80 rounded-full border-8 flex flex-col items-center justify-center relative ${processedTimeline[currentSegmentIndex]?.type === 'focus'
                                    ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-2xl shadow-green-500/50'
                                    : 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-2xl shadow-orange-500/50'
                                    }`}
                                animate={{
                                    scale: [1, 1.02, 1],
                                    boxShadow: processedTimeline[currentSegmentIndex]?.type === 'focus'
                                        ? ['0 25px 50px rgba(34, 197, 94, 0.5)', '0 35px 70px rgba(34, 197, 94, 0.7)', '0 25px 50px rgba(34, 197, 94, 0.5)']
                                        : ['0 25px 50px rgba(249, 115, 22, 0.5)', '0 35px 70px rgba(249, 115, 22, 0.7)', '0 25px 50px rgba(249, 115, 22, 0.5)']
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <motion.div
                                    className="text-8xl mb-4"
                                    animate={{
                                        y: [-8, 8, -8],
                                        rotate: [0, 3, -3, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {processedTimeline[currentSegmentIndex]?.type === 'focus' ? '🎯' : '☕'}
                                </motion.div>

                                <motion.div
                                    className="text-5xl font-bold text-white mb-2"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    {formatTime(getCurrentSegmentTimeLeft())}
                                </motion.div>

                                <div className="absolute inset-6">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="2"
                                        />
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.9)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 45}`}
                                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (getCurrentSegmentTimeLeft() / (processedTimeline[currentSegmentIndex]?.duration * 60 || 1)))}`}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </svg>
                                </div>
                            </motion.div>

                            <motion.div
                                className="mt-6 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className={`text-4xl font-bold mb-3 ${processedTimeline[currentSegmentIndex]?.type === 'focus'
                                    ? 'text-green-200'
                                    : 'text-orange-200'
                                    }`}>
                                    {processedTimeline[currentSegmentIndex]?.label}
                                </h2>
                                <p className="text-white/80 text-xl">
                                    {(() => {
                                        const startTime = new Date(new Date(activeSession.startTime).getTime() + processedTimeline[currentSegmentIndex]?.cumulativeStart * 60000);
                                        const endTime = new Date(startTime.getTime() + processedTimeline[currentSegmentIndex]?.duration * 60000);
                                        return `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                    })()}
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Next 4 Segments (Right Side) */}
                        <div className="flex items-center gap-4 flex-1">
                            {processedTimeline.slice(currentSegmentIndex + 1, currentSegmentIndex + 5).map((segment, index) => {
                                const distanceFromCenter = index + 1;
                                const scale = Math.max(0.3, 1.3 - (distanceFromCenter * 0.1));
                                const opacity = Math.max(0.2, 1 - (distanceFromCenter * 0.2));
                                const originalIndex = currentSegmentIndex + 1 + index;
                                const startTime = new Date(new Date(activeSession.startTime).getTime() + segment.cumulativeStart * 60000);

                                return (
                                    <motion.div
                                        key={originalIndex}
                                        className="flex flex-col items-center relative"
                                        style={{ zIndex: 10 - distanceFromCenter }}
                                        initial={{ scale: 0, opacity: 0, x: -100 }}
                                        animate={{
                                            scale: scale,
                                            opacity: opacity,
                                            x: 0,
                                            y: distanceFromCenter * 5
                                        }}
                                        transition={{
                                            delay: index * 0.1,
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    >
                                        <motion.div
                                            className={`rounded-full border-4 flex flex-col items-center justify-center relative shadow-lg ${segment.type === 'focus'
                                                ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-400'
                                                : 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-400'
                                                }`}
                                            style={{
                                                width: `${120 * scale}px`,
                                                height: `${120 * scale}px`,
                                                filter: `brightness(${0.4 + (0.6 * opacity)}) saturate(${0.5 + (0.5 * opacity)})`
                                            }}
                                            animate={{
                                                boxShadow: segment.type === 'focus'
                                                    ? [`0 ${5 * scale}px ${15 * scale}px rgba(34, 197, 94, ${0.3 * opacity})`]
                                                    : [`0 ${5 * scale}px ${15 * scale}px rgba(249, 115, 22, ${0.3 * opacity})`]
                                            }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        >
                                            <div className={`font-bold ${segment.type === 'focus' ? 'text-green-100' : 'text-orange-100'
                                                }`} style={{ fontSize: `${16 * scale}px` }}>
                                                {segment.duration}m
                                            </div>
                                            <div style={{ fontSize: `${20 * scale}px` }}>
                                                {segment.type === 'focus' ? '🎯' : '☕'}
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="mt-2 text-center"
                                            style={{ opacity: opacity * 0.7 }}
                                        >
                                            <div className="text-white/70 font-medium" style={{ fontSize: `${12 * scale}px` }}>
                                                {segment.label}
                                            </div>
                                            <div className="text-white/50" style={{ fontSize: `${10 * scale}px` }}>
                                                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>


            {/* Window Configuration Dialog */}
            <AnimatePresence>
                {showWindowConfig && (
                    <WindowSelectionDialog
                        isOpen={showWindowConfig}
                        onClose={() => setShowWindowConfig(false)}
                        type={windowConfigType}
                    />
                )}
            </AnimatePresence>


        </div>
    );
};

export default ActiveSessionPage;