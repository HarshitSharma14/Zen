import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useAppStore from "../../store/useAppStore";

export const WindowSelectionDialog = ({ isOpen, onClose, type }) => {
    const [windows, setWindows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWindows, setSelectedWindows] = useState([]);
    const { updateSessionConfig, sessionConfig } = useAppStore();

    const selectedOtherTypeWindows = type === 'focus' ? sessionConfig.breakWindows : sessionConfig.focusWindows;

    const fetchWindows = async () => {
        setLoading(true);
        try {
            const availableWindows = await window.electronAPI.getAvailableWindows();
            setWindows(availableWindows);
        } catch (error) {
            console.error('Error fetching windows:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchWindows();
            setSelectedWindows(type === 'focus' ? sessionConfig.focusWindows : sessionConfig.breakWindows);
        }
    }, [isOpen, type, sessionConfig]);

    const closeDialogBox = () => {
        setSelectedWindows([]);
        onClose();
    };

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
        console.log('Saving selected windows:', selectedWindows);
        // Fix: Pass object instead of function
        updateSessionConfig(
            type === 'focus' ? {
                focusWindows: selectedWindows.map(window => ({ id: window.id, name: window.name, appIcon: window.appIcon }))
            } : {
                breakWindows: selectedWindows.map(window => ({ id: window.id, name: window.name, appIcon: window.appIcon }))
            }
        );
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
                            Configure {type === 'focus' ? 'Focus' : 'Break'} Windows
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
                                        whileHover={{ scale: isSelectedOtherType ? 1 : 1.02 }}
                                        whileTap={{ scale: isSelectedOtherType ? 1 : 0.98 }}
                                        layout
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                            {window.thumbnail ? (
                                                <img
                                                    src={window.thumbnail}
                                                    alt={window.name}
                                                    className="w-full h-full object-cover"
                                                    style={{ imageRendering: 'crisp-edges' }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                                    <span className="text-4xl">🖼️</span>
                                                </div>
                                            )}

                                            {/* App Icon */}
                                            {window.appIcon && (
                                                <div className="absolute top-2 left-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                                                    <img src={window.appIcon} className="w-6 h-6" alt="App icon" />
                                                </div>
                                            )}

                                            {/* Selection overlay */}
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

                                            {/* Lock overlay for unavailable windows */}
                                            {isSelectedOtherType && (
                                                <motion.div
                                                    className="absolute inset-0 flex items-center justify-center bg-gray-900/90"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <motion.div
                                                        className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 text-white text-xl font-bold"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    >
                                                        🔐
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Window name */}
                                        <div className="p-3">
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
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${type === 'focus'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Update {type === 'focus' ? 'Focus' : 'Break'} Windows
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};