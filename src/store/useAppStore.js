import { create } from 'zustand'

const useAppStore = create((set, get) => ({
    // App State
    currentPage: 'menu', // 'menu', 'home', 'session-setup', 'session', 'settings'
    user: null,
    isAuthenticated: false,

    // Session State
    session: {
        isActive: false,
        startTime: null,
        duration: 0,
        focusWindows: [],
        breakWindows: [],
        currentWindow: null,
        distractionTime: 0,
        focusTime: 0
    },

    // Multiplayer State
    multiplayer: {
        isInSession: false,
        sessionId: null,
        participants: [],
        isInBreak: false
    },

    // Actions
    setCurrentPage: (page) => set({ currentPage: page }),

    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),

    startSession: (focusWindows, breakWindows) => set((state) => ({
        session: {
            ...state.session,
            isActive: true,
            startTime: Date.now(),
            focusWindows,
            breakWindows,
            duration: 0,
            distractionTime: 0,
            focusTime: 0
        }
    })),

    stopSession: () => set((state) => ({
        session: {
            ...state.session,
            isActive: false,
            startTime: null
        }
    }))
}))

export default useAppStore