export const createAppSlice = (set, get) => ({
    // App State
    currentPage: 'session-setup',
    user: null,
    isAuthenticated: false,

    // Actions
    setCurrentPage: (page) => set({ currentPage: page }),

    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),
}); 