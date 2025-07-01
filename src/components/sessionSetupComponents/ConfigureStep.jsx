import React from 'react';
import { motion } from 'framer-motion';

const ConfigureStep = ({ sessionData, setSessionData, onNext, onPrev, canGoNext }) => {
    const {
        sessionName,
        totalTime,
        isTimeBound,
        isSessionTime,
        breakType,
        regularBreaks,
        customBreaks
    } = sessionData;

    const updateField = (field, value) => {
        setSessionData(prev => ({ ...prev, [field]: value }));
    };

    const updateRegularBreaks = (field, value) => {
        setSessionData(prev => ({
            ...prev,
            regularBreaks: { ...prev.regularBreaks, [field]: value }
        }));
    };

    const addCustomBreak = () => {
        setSessionData(prev => ({
            ...prev,
            customBreaks: [...prev.customBreaks, { duration: 5, afterFocusTime: 25 }]
        }));
    };

    const updateCustomBreak = (index, field, value) => {
        const updated = [...customBreaks];
        updated[index][field] = Math.max(1, parseInt(value) || 1);
        setSessionData(prev => ({ ...prev, customBreaks: updated }));
    };

    const removeCustomBreak = (index) => {
        setSessionData(prev => ({
            ...prev,
            customBreaks: prev.customBreaks.filter((_, i) => i !== index)
        }));
    };

    // Validation helpers
    const handleNumberInput = (field, value, min = 1, max = 999) => {
        const numValue = parseInt(value) || min;
        const clampedValue = Math.max(min, Math.min(max, numValue));
        updateField(field, clampedValue);
    };

    const handleRegularBreakInput = (field, value, min = 1, max = 999) => {
        const numValue = parseInt(value) || min;
        const clampedValue = Math.max(min, Math.min(max, numValue));
        updateRegularBreaks(field, clampedValue);
    };

    // Validation logic
    const isValid = () => {
        if (!sessionName.trim()) return false;
        if (isTimeBound && (!totalTime || totalTime < 1)) return false;
        if (breakType === 'regular') {
            if (!regularBreaks.breakDuration || regularBreaks.breakDuration < 1) return false;
            if (regularBreaks.numberOfBreaks < 0) return false;
        }
        if (breakType === 'custom') {
            return customBreaks.every(b => b.duration >= 1 && b.afterFocusTime >= 1);
        }
        return true;
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-10 blur-3xl"
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
                        Configure Your Session
                    </motion.h2>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Session Name */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <label className="block text-purple-200 text-sm font-medium mb-3">
                                Session Name *
                            </label>
                            <input
                                type="text"
                                value={sessionName}
                                onChange={(e) => updateField('sessionName', e.target.value)}
                                placeholder="e.g., Deep Work Session, Study Marathon"
                                className={`w-full px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all ${sessionName.trim() ? 'border-green-400/50 focus:ring-green-400' : 'border-white/20 focus:ring-purple-400'
                                    }`}
                            />
                            {!sessionName.trim() && (
                                <p className="text-red-300 text-xs mt-2">Session name is required</p>
                            )}
                        </motion.div>

                        {/* Time Settings */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-xl font-semibold text-white mb-6">⏰ Time Settings</h3>

                            {/* Time Bound Toggle */}
                            <motion.label
                                className="flex items-center gap-3 cursor-pointer mb-6"
                                whileHover={{ scale: 1.01 }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isTimeBound}
                                    onChange={(e) => updateField('isTimeBound', e.target.checked)}
                                    className="w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-400"
                                />
                                <span className="text-white font-medium">Set time limit for session</span>
                            </motion.label>

                            {isTimeBound && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Total Time */}
                                    <div>
                                        <label className="block text-purple-200 text-sm font-medium mb-2">
                                            Total Time (minutes) *
                                        </label>
                                        <input
                                            type="number"
                                            value={totalTime}
                                            onChange={(e) => handleNumberInput('totalTime', e.target.value, 1, 480)}
                                            min="1"
                                            max="480"
                                            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${totalTime >= 1 ? 'border-green-400/50 focus:ring-green-400' : 'border-red-400/50 focus:ring-red-400'
                                                }`}
                                        />
                                        <p className="text-purple-300 text-xs mt-1">Recommended: 25-120 minutes</p>
                                    </div>

                                    {/* Session vs Focus Time */}
                                    <motion.label
                                        className="flex items-center gap-3 cursor-pointer"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!isSessionTime}
                                            onChange={(e) => updateField('isSessionTime', !e.target.checked)}
                                            className="w-5 h-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-400"
                                        />
                                        <span className="text-white">Count only focus time (exclude breaks)</span>
                                    </motion.label>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Break Configuration */}
                        {isTimeBound && (
                            <motion.div
                                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-xl font-semibold text-white mb-6">☕ Break Configuration</h3>

                                {/* Break Type Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { key: 'pomodoro', label: 'Pomodoro Technique', desc: '25min focus + 5min breaks', icon: '🍅' },
                                        { key: 'regular', label: 'Regular Breaks', desc: 'Set break time & frequency', icon: '⏱️' },
                                        { key: 'custom', label: 'Custom Breaks', desc: 'Add breaks manually', icon: '🎯' }
                                    ].map((option) => (
                                        <motion.div
                                            key={option.key}
                                            onClick={() => updateField('breakType', option.key)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${breakType === option.key
                                                    ? 'border-purple-400 bg-purple-400/20 shadow-lg'
                                                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="text-2xl mb-2">{option.icon}</div>
                                            <h4 className="text-white font-medium mb-1">{option.label}</h4>
                                            <p className="text-purple-200 text-sm">{option.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Regular Breaks Configuration */}
                                {breakType === 'regular' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div>
                                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                                Break Duration (minutes) *
                                            </label>
                                            <input
                                                type="number"
                                                value={regularBreaks.breakDuration}
                                                onChange={(e) => handleRegularBreakInput('breakDuration', e.target.value, 1, 60)}
                                                min="1"
                                                max="60"
                                                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${regularBreaks.breakDuration >= 1 ? 'border-green-400/50 focus:ring-green-400' : 'border-red-400/50 focus:ring-red-400'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                                Number of Breaks *
                                            </label>
                                            <input
                                                type="number"
                                                value={regularBreaks.numberOfBreaks}
                                                onChange={(e) => handleRegularBreakInput('numberOfBreaks', e.target.value, 0, 20)}
                                                min="0"
                                                max="20"
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Custom Breaks Configuration */}
                                {breakType === 'custom' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="space-y-4 mb-6">
                                            {customBreaks.map((breakItem, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                                                >
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-purple-200 text-xs mb-1">Break Duration (min)</label>
                                                            <input
                                                                type="number"
                                                                value={breakItem.duration}
                                                                onChange={(e) => updateCustomBreak(index, 'duration', e.target.value)}
                                                                min="1"
                                                                max="60"
                                                                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 transition-all ${breakItem.duration >= 1 ? 'border-green-400/50 focus:ring-green-400' : 'border-red-400/50 focus:ring-red-400'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-purple-200 text-xs mb-1">After Focus Time (min)</label>
                                                            <input
                                                                type="number"
                                                                value={breakItem.afterFocusTime}
                                                                onChange={(e) => updateCustomBreak(index, 'afterFocusTime', e.target.value)}
                                                                min="1"
                                                                max="480"
                                                                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 transition-all ${breakItem.afterFocusTime >= 1 ? 'border-green-400/50 focus:ring-green-400' : 'border-red-400/50 focus:ring-red-400'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        onClick={() => removeCustomBreak(index)}
                                                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        ✕
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.button
                                            onClick={addCustomBreak}
                                            className="w-full py-4 border-2 border-dashed border-white/30 text-white/70 rounded-xl hover:border-white/50 hover:text-white hover:bg-white/5 transition-all font-medium"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            + Add Custom Break
                                        </motion.button>
                                    </motion.div>
                                )}

                                {/* Pomodoro Info */}
                                {breakType === 'pomodoro' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center py-6 bg-orange-500/10 border border-orange-400/30 rounded-xl"
                                    >
                                        <div className="text-4xl mb-2">🍅</div>
                                        <p className="text-orange-200 font-medium">
                                            Pomodoro technique selected: 25 minutes of focus followed by 5-minute breaks.
                                            After 4 cycles, you'll get a longer 15-30 minute break.
                                        </p>
                                    </motion.div>
                                )}
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
                                <p className="text-red-300 text-sm">Please fill all required fields correctly</p>
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
                                Next: Select Windows →
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigureStep;