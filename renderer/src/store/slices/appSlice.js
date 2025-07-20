export const createAppSlice = (set, get) => ({
    // App State
    currentPage: 'home',
    user: null,
    isAuthenticated: false,

    // Actions
    setCurrentPage: (page) => set({ currentPage: page }),

    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),

    // Check for existing session and redirect if needed
    initializeApp: () => {
        const state = get();

        // Check if there's an active session with timeline
        if (state.activeSession &&
            state.activeSession.isActive &&
            state.activeSession.timeline &&
            state.activeSession.timeline.length > 0) {

            console.log('Found active session with timeline, redirecting to session page');
            set({ currentPage: 'session' });
        } else if (state.sessionConfig &&
            state.sessionConfig.timeline &&
            state.sessionConfig.timeline.length > 0) {

            console.log('Found session config with timeline, redirecting to session page');
            set({ currentPage: 'session' });
        } else {
            console.log('No active session found, staying on current page');
        }
    },
}); 