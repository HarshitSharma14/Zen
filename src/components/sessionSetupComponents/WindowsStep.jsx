import React from 'react';
import { motion } from 'framer-motion';

const WindowsStep = ({ sessionData, setSessionData, onNext, onPrev }) => {
    const mockWindows = [
        { id: 1, name: 'VS Code - Project', app: 'Visual Studio Code', icon: '💻' },
        { id: 2, name: 'Chrome - Documentation', app: 'Google Chrome', icon: '📖' },
        { id: 3, name: 'Chrome - YouTube', app: 'Google Chrome', icon: '🎥' },
        { id: 4, name: 'Spotify - Music', app: 'Spotify', icon: '🎵' },
        { id: 5, name: 'Discord - Chat', app: 'Discord', icon: '💬' },
        { id: 6, name: 'Instagram - Social', app: 'Instagram', icon: '📸' }
    ];

    const selectMock = (type) => {
        const focus = mockWindows.slice(0, 2);
        const breakW = mockWindows.slice(2, 4);
        setSessionData(prev => ({
            ...prev,
            focusWindows: type === 'focus' ? focus : prev.focusWindows,
            breakWindows: type === 'break' ? breakW : prev.breakWindows
        }));
    };

    // Validation - both focus and break windows should be selected
    const isValid = () => {
        return sessionData.focusWindows.length > 0 && sessionData.breakWindows.length > 0;
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const windowVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full opacity-10 blur-3xl"
                    animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <motion.h2
                        className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Select Your Windows
                    </motion.h2>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Instructions */}
                        <motion.div
                            className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3 className="text-blue-200 font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">📝</span>
                                Important Setup Instructions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100 text-sm">
                                <div className="space-y-2">
                                    <p>• <strong className="text-blue-200">Focus Windows:</strong> Select apps/windows you'll use for productive work</p>
                                    <p>• <strong className="text-blue-200">Break Windows:</strong> Select apps for your breaks and relaxation</p>
                                </div>
                                <div className="space-y-2">
                                    <p>• <strong className="text-blue-200">Tip:</strong> Open all needed windows before starting your session</p>
                                    <p>• <strong className="text-blue-200">For breaks:</strong> Keep activities on your computer so we can track when break ends</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Focus Windows Section */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    Focus Windows
                                </h3>
                                <motion.button
                                    onClick={() => selectMock('focus')}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    🖼️ Select Focus Windows
                                </motion.button>
                            </div>

                            {sessionData.focusWindows.length > 0 ? (
                                <motion.div
                                    className="space-y-3"
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: { transition: { staggerChildren: 0.1 } }
                                    }}
                                >
                                    {sessionData.focusWindows.map((window) => (
                                        <motion.div
                                            key={window.id}
                                            className="flex items-center gap-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl hover:bg-green-500/30 transition-all"
                                            variants={windowVariants}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg"></div>
                                            <span className="text-2xl">{window.icon}</span>
                                            <div className="flex-1">
                                                <span className="text-white font-medium block">{window.name}</span>
                                                <span className="text-green-200 text-sm">({window.app})</span>
                                            </div>
                                            <div className="px-3 py-1 bg-green-400/20 rounded-full">
                                                <span className="text-green-300 text-xs font-medium">FOCUS</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="text-center py-8 border-2 border-dashed border-white/20 rounded-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="text-4xl mb-2">🖱️</div>
                                    <p className="text-white/60 italic">No focus windows selected yet</p>
                                    <p className="text-white/40 text-sm mt-1">Click the button above to select windows</p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Break Windows Section */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <span className="text-2xl">☕</span>
                                    Break Windows
                                </h3>
                                <motion.button
                                    onClick={() => selectMock('break')}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: '0 10px 25px rgba(249, 115, 22, 0.4)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    🖼️ Select Break Windows
                                </motion.button>
                            </div>

                            {sessionData.breakWindows.length > 0 ? (
                                <motion.div
                                    className="space-y-3"
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: { transition: { staggerChildren: 0.1 } }
                                    }}
                                >
                                    {sessionData.breakWindows.map((window) => (
                                        <motion.div
                                            key={window.id}
                                            className="flex items-center gap-4 p-4 bg-orange-500/20 border border-orange-400/30 rounded-xl hover:bg-orange-500/30 transition-all"
                                            variants={windowVariants}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="w-4 h-4 bg-orange-400 rounded-full shadow-lg"></div>
                                            <span className="text-2xl">{window.icon}</span>
                                            <div className="flex-1">
                                                <span className="text-white font-medium block">{window.name}</span>
                                                <span className="text-orange-200 text-sm">({window.app})</span>
                                            </div>
                                            <div className="px-3 py-1 bg-orange-400/20 rounded-full">
                                                <span className="text-orange-300 text-xs font-medium">BREAK</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="text-center py-8 border-2 border-dashed border-white/20 rounded-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="text-4xl mb-2">🖱️</div>
                                    <p className="text-white/60 italic">No break windows selected yet</p>
                                    <p className="text-white/40 text-sm mt-1">Click the button above to select windows</p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Selection Summary */}
                        {(sessionData.focusWindows.length > 0 || sessionData.breakWindows.length > 0) && (
                            <motion.div
                                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    Selection Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-400">
                                            {sessionData.focusWindows.length}
                                        </div>
                                        <p className="text-green-200 text-sm">Focus Windows</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-400">
                                            {sessionData.breakWindows.length}
                                        </div>
                                        <p className="text-orange-200 text-sm">Break Windows</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="p-6 border-t border-white/10">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <motion.button
                            onClick={onPrev}
                            className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-medium hover:border-white/50 hover:bg-white/5 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ← Previous
                        </motion.button>

                        <div className="flex items-center gap-4">
                            {!isValid() && (
                                <p className="text-red-300 text-sm">Please select both focus and break windows</p>
                            )}
                            <motion.button
                                onClick={onNext}
                                disabled={!isValid()}
                                className={`px-8 py-3 rounded-xl font-medium transition-all ${isValid()
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                whileHover={isValid() ? { scale: 1.05 } : {}}
                                whileTap={isValid() ? { scale: 0.95 } : {}}
                            >
                                Next: Review & Start →
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WindowsStep;