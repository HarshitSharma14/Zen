export const createSessionConfigSlice = (set, get) => ({
    // Session Configuration (from setup)
    sessionConfig: null,

    // Actions
    saveSessionConfig: (config) => set({
        sessionConfig: config
    }),
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
