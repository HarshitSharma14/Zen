export const WindowSelectionDialog = ({ isOpen, onClose, onSelect, type, currentFocusWindows = [], currentBreakWindows = [] }) => {
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