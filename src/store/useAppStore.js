import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(
    persist(
        (set, get) => ({
            // App State
            currentPage: 'session-setup',
            user: null,
            isAuthenticated: false,

            // Session Configuration (from setup)
            sessionConfig: null,

            // Active Session State
            activeSession: {
                isActive: false,
                startTime: null,
                currentSegment: null,
                timeline: [],
                elapsedTime: 0,
                currentWindow: null,
                segmentProgress: 0,
                totalFocusTime: 0,
                totalBreakTime: 0,
                totalDistractionTime: 0,
                distractions: [],
            },

            // Actions (keep all your existing actions the same)
            setCurrentPage: (page) => set({ currentPage: page }),

            setUser: (user) => set({
                user,
                isAuthenticated: !!user
            }),

            saveSessionConfig: (config) => set({
                sessionConfig: config
            }),

            startSession: (config) => {
                const now = new Date();
                const timeline = config.timeline;

                set({
                    sessionConfig: config,
                    activeSession: {
                        isActive: true,
                        startTime: now.toISOString(), // Store as string for localStorage
                        currentSegment: timeline[0] || null,
                        timeline: timeline,
                        elapsedTime: 0,
                        currentWindow: null,
                        segmentProgress: 0,
                        totalFocusTime: 0,
                        totalBreakTime: 0,
                        totalDistractionTime: 0,
                        distractions: [],
                    }
                });
            },

            // ... rest of your existing actions
            updateSessionProgress: (elapsedSeconds) => {
                const state = get();
                const { activeSession } = state;

                if (!activeSession.isActive) return;

                let cumulativeTime = 0;
                let currentSegmentIndex = 0;

                for (let i = 0; i < activeSession.timeline.length; i++) {
                    const segment = activeSession.timeline[i];
                    if (elapsedSeconds < cumulativeTime + (segment.duration * 60)) {
                        currentSegmentIndex = i;
                        break;
                    }
                    cumulativeTime += segment.duration * 60;
                }

                const currentSegment = activeSession.timeline[currentSegmentIndex];
                const segmentStartTime = cumulativeTime;
                const segmentProgress = elapsedSeconds - segmentStartTime;

                set({
                    activeSession: {
                        ...activeSession,
                        elapsedTime: elapsedSeconds,
                        currentSegment,
                        segmentProgress
                    }
                });
            },

            setCurrentWindow: (windowInfo) => set((state) => ({
                activeSession: {
                    ...state.activeSession,
                    currentWindow: windowInfo
                }
            })),

            addDistraction: (windowInfo, startTime) => set((state) => ({
                activeSession: {
                    ...state.activeSession,
                    distractions: [
                        ...state.activeSession.distractions,
                        {
                            window: windowInfo,
                            startTime: startTime.toISOString(),
                            endTime: null,
                            duration: 0
                        }
                    ]
                }
            })),

            endSession: () => set((state) => ({
                activeSession: {
                    isActive: false,
                    startTime: null,
                    currentSegment: null,
                    timeline: [],
                    elapsedTime: 0,
                    currentWindow: null,
                    segmentProgress: 0,
                    totalFocusTime: 0,
                    totalBreakTime: 0,
                    totalDistractionTime: 0,
                    distractions: [],
                }
            }))
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