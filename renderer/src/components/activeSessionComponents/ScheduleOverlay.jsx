export const ScheduleOverlay = ({ isOpen, onClose, timeline, currentIndex, startTime }) => {
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