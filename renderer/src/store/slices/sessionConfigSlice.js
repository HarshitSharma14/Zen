export const createSessionConfigSlice = (set, get) => ({
    // Session Configuration (from setup)
    sessionConfig: null,

    // Actions
    saveSessionConfig: (config) => set({
        sessionConfig: config
    }),

    updateSessionConfig: (updates) => set((state) => ({
        sessionConfig: state.sessionConfig ? { ...state.sessionConfig, ...updates } : updates
    })),
});

// {
//     sessionName: 'test',
//     totalTime: 60,
//     isTimeBound: true,
//     isSessionTime: true,
//     breakType: 'regular',
//     regularBreaks: {
//         breakDuration: 5,
//         breakAfterFocusTime: 3
//     },
//     customBreaks: [],
//     focusWindows: [],
//     breakWindows: [],
//     timeline: [],
//     startTime: new Date()
// }
