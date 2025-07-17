import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';

import { windowTracker } from '../services/WindowTracker';
import { categorizeWindow } from '../utils/windowUtils';
import ImmediateWindowCategorizationDialog from '../components/ImmediateWindowCategorizationDialog';
const WindowSelectionDialog = ({ isOpen, onClose, onSelect, type, currentFocusWindows = [], currentBreakWindows = [] }) => {
    const [windows, setWindows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWindows, setSelectedWindows] = useState([]);

    const selectedOtherTypeWindows = type === 'focus' ? currentBreakWindows : currentFocusWindows;

    const fetchWindows = async () => {
        setLoading(true);
        try {
            const availableWindows = await window.electronAPI.getAvailableWindows();
            setWindows(availableWindows);
        } catch (error) {
            console.error('Error fetching windows:', error);
            setWindows([
                { id: 1, name: 'VS Code - Project', thumbnail: null },
                { id: 2, name: 'Chrome - Documentation', thumbnail: null },
                { id: 3, name: 'Chrome - YouTube', thumbnail: null },
                { id: 4, name: 'Spotify - Music', thumbnail: null },
            ]);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchWindows();
            setSelectedWindows(type === 'focus' ? currentFocusWindows : currentBreakWindows);
        }
    }, [isOpen, type]);

    const toggleWindow = (window) => {
        const isSelectedOtherType = selectedOtherTypeWindows.some(w => w.id === window.id);
        if (isSelectedOtherType) return;

        setSelectedWindows(prev => {
            const isSelected = prev.some(w => w.id === window.id);
            if (isSelected) {
                return prev.filter(w => w.id !== window.id);
            } else {
                return [...prev, window];
            }
        });
    };

    const handleConfirm = () => {
        onSelect(selectedWindows);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
            >
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">
                            Configure {type === 'focus' ? 'Focus' : 'Break'} Windows
                        </h3>
                        <button onClick={onClose} className="text-white/60 hover:text-white p-2">✕</button>
                    </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
                                <p className="text-white/70">Loading windows...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {windows.map((window) => {
                                const isSelected = selectedWindows.some(w => w.id === window.id);
                                const isSelectedOtherType = selectedOtherTypeWindows.some(w => w.id === window.id);

                                return (
                                    <motion.div
                                        key={window.id}
                                        onClick={() => toggleWindow(window)}
                                        className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${isSelectedOtherType
                                            ? 'border-gray-500 bg-gray-500/20 cursor-not-allowed opacity-50'
                                            : isSelected
                                                ? (type === 'focus' ? 'border-green-400 bg-green-400/20' : 'border-orange-400 bg-orange-400/20')
                                                : 'border-white/20 bg-white/5 hover:border-white/40'
                                            }`}
                                        whileHover={{ scale: isSelectedOtherType ? 1 : 1.02 }}
                                        whileTap={{ scale: isSelectedOtherType ? 1 : 0.98 }}
                                    >
                                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                            {window.thumbnail ? (
                                                <img src={window.thumbnail} alt={window.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                                    <span className="text-4xl">🖼️</span>
                                                </div>
                                            )}

                                            {isSelected && !isSelectedOtherType && (
                                                <motion.div
                                                    className={`absolute inset-0 flex items-center justify-center ${type === 'focus' ? 'bg-green-500/30' : 'bg-orange-500/30'
                                                        }`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <motion.div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'focus' ? 'bg-green-500' : 'bg-orange-500'
                                                            } text-white text-xl font-bold`}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    >
                                                        ✓
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="p-3">
                                            <p className="text-white font-medium text-sm truncate">{window.name}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center">
                    <p className="text-white/60 text-sm">
                        {selectedWindows.length} window{selectedWindows.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/5">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedWindows.length === 0}
                            className={`px-6 py-2 rounded-lg font-medium ${selectedWindows.length > 0
                                ? (type === 'focus' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white')
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Update {type === 'focus' ? 'Focus' : 'Break'} Windows
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ScheduleOverlay = ({ isOpen, onClose, timeline, currentIndex, startTime }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            className="absolute top-20 right-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-96 z-40"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Session Schedule</h3>
                <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {timeline.map((segment, index) => {
                    const segmentStartTime = new Date(startTime.getTime() + segment.cumulativeStart * 60000);
                    const segmentEndTime = new Date(startTime.getTime() + (segment.cumulativeStart + segment.duration) * 60000);
                    const status = index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming';

                    return (
                        <motion.div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${status === 'current'
                                ? (segment.type === 'focus' ? 'border-green-400 bg-green-500/20' : 'border-orange-400 bg-orange-500/20')
                                : status === 'completed'
                                    ? 'border-gray-500 bg-gray-500/20'
                                    : 'border-white/20 bg-white/5'
                                }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                        {segment.type === 'focus' ? '🎯' : '☕'}
                                    </span>
                                    <span className={`font-medium ${status === 'current'
                                        ? (segment.type === 'focus' ? 'text-green-200' : 'text-orange-200')
                                        : status === 'completed'
                                            ? 'text-gray-300'
                                            : 'text-white'
                                        }`}>
                                        {segment.label}
                                    </span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${status === 'current' ? 'bg-blue-500 text-white' :
                                    status === 'completed' ? 'bg-gray-600 text-gray-200' :
                                        'bg-white/20 text-white/70'
                                    }`}>
                                    {status === 'current' ? 'ACTIVE' : status === 'completed' ? 'DONE' : 'PENDING'}
                                </span>
                            </div>

                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Duration:</span>
                                    <span className="text-white">{segment.duration} minutes</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Start:</span>
                                    <span className="text-white">{segmentStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">End:</span>
                                    <span className="text-white">{segmentEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                <div className="flex justify-between text-white/60">
                    <span>Total Duration:</span>
                    <span className="text-white font-medium">
                        {timeline.reduce((total, segment) => total + segment.duration, 0)} minutes
                    </span>
                </div>
            </div>
        </motion.div>
    );
};


// Add this hook inside your ActiveSessionPage component:
const useWindowTracking = () => {
    const {
        activeSession,
        sessionConfig,
        updateCurrentWindow,
        startViolation,
        endViolation
    } = useAppStore();

    useEffect(() => {
        if (!activeSession.isActive) return;

        console.log('🚀 Initializing window tracking...');

        const handleWindowChange = (windowInfo) => {
            // Update current window in store
            updateCurrentWindow(windowInfo);

            // Categorize the window
            const category = categorizeWindow(
                windowInfo,
                sessionConfig?.focusWindows || [],
                sessionConfig?.breakWindows || []
            );

            console.log('📊 Window categorized as:', category.type, windowInfo);

            // Handle different scenarios based on current segment and window type
            const currentSegment = activeSession.currentSegment;

            if (category.type === 'unknown') {
                // ✅ NEW: Immediately show categorization dialog
                console.log('❓ Unknown window detected, showing categorization dialog');
                setPendingWindow(windowInfo);
                setShowCategorization(true);
            } else {
                // Handle violations based on segment type and window type
                handleWindowViolation(currentSegment?.type, category.type, windowInfo);
            }
        };

        const handleWindowViolation = (segmentType, windowType, windowInfo) => {
            // If in focus segment but on break window = violation
            if (segmentType === 'focus' && windowType === 'break') {
                if (!activeSession.currentViolation || activeSession.currentViolation.type !== 'focus') {
                    startViolation('focus', windowInfo);
                }
            }
            // If in break segment but on focus window = violation  
            else if (segmentType === 'break' && windowType === 'focus') {
                if (!activeSession.currentViolation || activeSession.currentViolation.type !== 'break') {
                    startViolation('break', windowInfo);
                }
            }
            // If back to appropriate window type, end any current violation
            else if (
                (segmentType === 'focus' && windowType === 'focus') ||
                (segmentType === 'break' && windowType === 'break')
            ) {
                if (activeSession.currentViolation) {
                    endViolation();
                }
            }
        };

        // Start tracking
        windowTracker.start(handleWindowChange);

        // Cleanup on unmount
        return () => {
            windowTracker.stop();
        };
    }, [activeSession.isActive, activeSession.currentSegment]);

    const handleWindowCategorization = (windowInfo, category) => {
        console.log('✅ User categorized window:', windowInfo.title, 'as', category);

        categorizeWindow(windowInfo.id, category, windowInfo);

        setPendingWindow(null);
        setShowCategorization(false);

        const currentSegment = activeSession.currentSegment;
        if (currentSegment) {
            const segmentType = currentSegment.type;

            if (segmentType === 'focus' && category === 'break') {
                startViolation('focus', windowInfo);
            } else if (segmentType === 'break' && category === 'focus') {
                startViolation('break', windowInfo);
            }
        }
    };
};


const ActiveSessionPage = () => {
    const {
        activeSession,
        sessionConfig,
        updateSessionProgress,
        endSession,
        setCurrentPage
    } = useAppStore();

    const [showSchedule, setShowSchedule] = useState(false);
    const [showWindowConfig, setShowWindowConfig] = useState(false);
    const [windowConfigType, setWindowConfigType] = useState('focus');
    const [pendingWindow, setPendingWindow] = useState(null);
    const [showCategorization, setShowCategorization] = useState(false);
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

    useWindowTracking();

    // Handle immediate window categorization
    const handleWindowCategorization = (windowInfo, category) => {
        console.log('✅ User categorized window:', windowInfo.title, 'as', category);

        // Store the categorization in the session config
        categorizeWindow(windowInfo.id, category, windowInfo);

        // Clear pending state
        setPendingWindow(null);
        setShowCategorization(false);

        // After categorization, check for violations with the current segment
        const currentSegment = activeSession.currentSegment;
        if (currentSegment) {
            const segmentType = currentSegment.type;

            // Check if this creates a violation
            if (segmentType === 'focus' && category === 'break') {
                console.log('⚠️ Categorized as break window during focus - starting violation');
                startViolation('focus', windowInfo);
            } else if (segmentType === 'break' && category === 'focus') {
                console.log('⚠️ Categorized as focus window during break - starting violation');
                startViolation('break', windowInfo);
            }
        }
    };

    const currentSegmentIndex = getCurrentSegmentIndex();

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

    const handleWindowSelection = (windows) => {
        // Update the session config with new windows
        // For now, just close the dialog - you can implement the actual update logic
        setShowWindowConfig(false);
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
                        onSelect={handleWindowSelection}
                        type={windowConfigType}
                        currentFocusWindows={sessionConfig?.focusWindows || []}
                        currentBreakWindows={sessionConfig?.breakWindows || []}
                    />
                )}
            </AnimatePresence>

            {/* Immediate Window Categorization Dialog */}
            <ImmediateWindowCategorizationDialog
                windowInfo={pendingWindow}
                isOpen={showCategorization}
                onCategorize={handleWindowCategorization}
                onClose={() => { }} // Don't allow closing
            />
        </div>
    );
};

export default ActiveSessionPage;