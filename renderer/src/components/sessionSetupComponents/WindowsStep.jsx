
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WindowSelectionDialog = ({ isOpen, onClose, onSelect, type, selectedTypeWindows, selectedOtherTypeWindows }) => {
    const [windows, setWindows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWindows, setSelectedWindows] = useState([]);

    const fetchWindows = async () => {
        setLoading(true);
        try {

            const availableWindows = await window.electronAPI.getAvailableWindows();
            console.log(availableWindows)// Call Electron API to get available windows
            setWindows(availableWindows);
        } catch (error) {
            console.error('Error fetching windows:', error);
            // Fallback to mock data for development
            setWindows([
                { id: 1, name: 'VS Code - Project', thumbnail: '/api/placeholder/300/200' },
                { id: 2, name: 'Chrome - Documentation', thumbnail: '/api/placeholder/300/200' },
                { id: 3, name: 'Chrome - YouTube', thumbnail: '/api/placeholder/300/200' },
                { id: 4, name: 'Spotify - Music', thumbnail: '/api/placeholder/300/200' },
            ]);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchWindows();
            setSelectedWindows(selectedTypeWindows);
            // console.log(selectedTypeWindows)
            // console.log(selectedOtherTypeWindows)
            // console.log(selectedWindows)
        }
    }, [isOpen]);

    const closeDialogBox = () => {
        setSelectedWindows([]);
        onClose();
    }

    const toggleWindow = (window) => {
        const isSelectedOtherType = selectedOtherTypeWindows.some(w => w.id === window.id);
        if (isSelectedOtherType) {
            return;
        }
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
        closeDialogBox();
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
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">
                            Select {type === 'focus' ? 'Focus' : 'Break'} Windows
                        </h3>
                        <button
                            onClick={closeDialogBox}
                            className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-white/70 text-sm mt-2">
                        Choose windows for your {type === 'focus' ? 'productive work' : 'break activities'}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <motion.div
                                    className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <p className="text-white/70">Loading windows...</p>
                            </div>
                        </div>
                    ) : windows.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">🪟</div>
                            <p className="text-white/70">No windows available</p>
                            <p className="text-white/50 text-sm mt-2">Try opening some applications first</p>
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
                                        className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${isSelectedOtherType ? ('border-gray-600 bg-gray-600/20')
                                            : isSelected ? (type === 'focus'
                                                ? 'border-green-400 bg-green-400/20'
                                                : 'border-orange-400 bg-orange-400/20') : ('border-white/20 bg-white/5 hover:border-white/40')
                                            } `}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        layout
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                            {window.thumbnail ? (
                                                <img
                                                    src={window.thumbnail}
                                                    alt={window.name}
                                                    className="w-full h-full object-cover"
                                                    style={{ imageRendering: 'crisp-edges' }} // Sharper rendering
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                                    <span className="text-4xl">🖼️</span>
                                                </div>
                                            )}

                                            {/* Selection overlay */}
                                            {isSelected && (
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

                                            {isSelectedOtherType && (
                                                <motion.div
                                                    className={`absolute inset-0 flex items-center justify-center  bg-gray-900/90 `}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <motion.div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 text-white text-xl font-bold`}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    >
                                                        🔐
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </div>
                                        {/* {console.log(window)} */}

                                        {/* Window name */}
                                        <div className="p-3">
                                            {window.appIcon ? (<div className="absolute top-2 left-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                                                <img src={window.appIcon} className="w-6 h-6" alt="App icon" />
                                            </div>) : (<></>)}

                                            <p className="text-white font-medium text-sm truncate">
                                                {window.name}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between items-center">
                    <p className="text-white/60 text-sm">
                        {selectedWindows.length} window{selectedWindows.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={closeDialogBox}
                            className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <motion.button
                            onClick={handleConfirm}
                            // disabled={selectedWindows.length === 0}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${type === 'focus'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Confirm Selection
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};



const WindowsStep = ({ sessionData, setSessionData, onNext, onPrev }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState('focus'); // 'focus' or 'break'


    const openWindowSelection = (type) => {
        setDialogType(type);
        setShowDialog(true);
    };

    const handleWindowSelection = (windows) => {
        if (dialogType === 'focus') {
            setSessionData(prev => ({ ...prev, focusWindows: windows }));
        } else {
            setSessionData(prev => ({ ...prev, breakWindows: windows }));
        }
    };

    // Validation - both focus and break windows should be selected
    const isValid = () => {
        // return sessionData.focusWindows.length > 0;
        return true
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
                                    onClick={() => openWindowSelection('focus')}
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
                                            <span className="text-2xl">💻</span>
                                            <div className="flex-1">
                                                <span className="text-white font-medium block">{window.name}</span>
                                                <span className="text-green-200 text-sm">Selected for focus</span>
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
                                    onClick={() => openWindowSelection('break')}
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
                                            <span className="text-2xl">☕</span>
                                            <div className="flex-1">
                                                <span className="text-white font-medium block">{window.name}</span>
                                                <span className="text-orange-200 text-sm">Selected for breaks</span>
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

            {/* Window Selection Dialog */}
            <AnimatePresence>
                <WindowSelectionDialog
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    onSelect={handleWindowSelection}
                    type={dialogType}
                    selectedTypeWindows={sessionData[dialogType === 'focus' ? 'focusWindows' : 'breakWindows']}
                    selectedOtherTypeWindows={sessionData[dialogType === 'focus' ? 'breakWindows' : 'focusWindows']}
                />
            </AnimatePresence>
        </div>
    );
};

export default WindowsStep;