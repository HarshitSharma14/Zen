// src/components/ImmediateWindowCategorizationDialog.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImmediateWindowCategorizationDialog = ({
    windowInfo,
    isOpen,
    onCategorize,
    onClose
}) => {
    if (!isOpen || !windowInfo) return null;

    const handleCategorize = (category) => {
        onCategorize(windowInfo, category);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[9999] p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 text-center">
                            <div className="text-4xl mb-3">🪟</div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                New Window Detected
                            </h3>
                            <p className="text-white/70 text-sm">
                                Please categorize this window to continue tracking
                            </p>
                        </div>

                        {/* Window Info Display */}
                        <div className="p-6 border-b border-white/10">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">🔷</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium truncate">
                                            {windowInfo.title}
                                        </h4>
                                        <p className="text-white/60 text-sm truncate">
                                            {windowInfo.owner}
                                        </p>
                                        {windowInfo.id && (
                                            <p className="text-white/40 text-xs mt-1">
                                                ID: {windowInfo.id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categorization Buttons */}
                        <div className="p-6">
                            <div className="space-y-3">
                                <motion.button
                                    onClick={() => handleCategorize('focus')}
                                    className="w-full p-4 bg-green-500/20 border-2 border-green-400 rounded-xl text-white font-medium hover:bg-green-500/30 transition-all flex items-center gap-3"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="text-2xl">🎯</span>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold">Focus Window</div>
                                        <div className="text-sm text-green-200">For work, study, or productive tasks</div>
                                    </div>
                                </motion.button>

                                <motion.button
                                    onClick={() => handleCategorize('break')}
                                    className="w-full p-4 bg-orange-500/20 border-2 border-orange-400 rounded-xl text-white font-medium hover:bg-orange-500/30 transition-all flex items-center gap-3"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="text-2xl">☕</span>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold">Break Window</div>
                                        <div className="text-sm text-orange-200">For relaxation, entertainment, or breaks</div>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Footer Info */}
                            <div className="mt-6 text-center">
                                <p className="text-white/50 text-xs">
                                    This choice will be remembered for future sessions
                                </p>
                                <div className="mt-2 text-white/40 text-xs">
                                    ⚠️ You must categorize this window to continue
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImmediateWindowCategorizationDialog;