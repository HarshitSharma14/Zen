import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
    createAppSlice,
    createSessionConfigSlice,
    createActiveSessionSlice
} from './slices'

const useAppStore = create(
    persist(
        (set, get) => ({
            ...createAppSlice(set, get),
            ...createSessionConfigSlice(set, get),
            ...createActiveSessionSlice(set, get),
        }),
        {
            name: 'focus-tracker-storage', // localStorage key
            partialize: (state) => ({
                // Only persist these parts of the state
                sessionConfig: state.sessionConfig,
                activeSession: state.activeSession,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
            // Don't persist currentPage - always start fresh
        }
    )
)

export default useAppStore