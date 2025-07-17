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

                // NEW TRACKING PROPERTIES
                windowHistory: [], // Track all window changes with timestamps
                currentWindowInfo: null, // Current active window details
                unknownWindows: [], // Windows that need categorization
                focusViolations: [], // Times when user was on break windows during focus
                breakViolations: [], // Times when user was on focus windows during break
                wastedTime: 0, // Total time wasted (on break windows during focus)
                currentViolation: null, // Active violation being tracked
            },

            updateCurrentWindow: (windowInfo) => set((state) => {
                const now = new Date();
                const currentSegment = state.activeSession.currentSegment;

                // Log window change in history
                const newHistoryEntry = {
                    timestamp: now.toISOString(),
                    window: windowInfo,
                    segmentType: currentSegment?.type || 'unknown',
                    segmentIndex: state.activeSession.timeline.findIndex(s => s === currentSegment)
                };

                return {
                    activeSession: {
                        ...state.activeSession,
                        currentWindowInfo: windowInfo,
                        windowHistory: [...state.activeSession.windowHistory, newHistoryEntry]
                    }
                };
            }),

            addUnknownWindow: (windowInfo) => set((state) => ({
                activeSession: {
                    ...state.activeSession,
                    unknownWindows: [...state.activeSession.unknownWindows, windowInfo]
                }
            })),

            categorizeWindow: (windowId, category, windowInfo) => set((state) => {
                // Add to appropriate category in session config
                const updatedConfig = { ...state.sessionConfig };
                if (category === 'focus') {
                    updatedConfig.focusWindows = [...(updatedConfig.focusWindows || []), windowInfo];
                } else {
                    updatedConfig.breakWindows = [...(updatedConfig.breakWindows || []), windowInfo];
                }

                return {
                    sessionConfig: updatedConfig,
                    activeSession: {
                        ...state.activeSession,
                        unknownWindows: state.activeSession.unknownWindows.filter(w => w.id !== windowId)
                    }
                };
            }),

            startViolation: (violationType, windowInfo) => set((state) => ({
                activeSession: {
                    ...state.activeSession,
                    currentViolation: {
                        type: violationType, // 'focus' or 'break'
                        startTime: new Date().toISOString(),
                        window: windowInfo,
                        segmentType: state.activeSession.currentSegment?.type
                    }
                }
            })),

            endViolation: () => set((state) => {
                if (!state.activeSession.currentViolation) return state;

                const violation = state.activeSession.currentViolation;
                const endTime = new Date();
                const startTime = new Date(violation.startTime);
                const duration = Math.floor((endTime - startTime) / 1000); // seconds

                const completedViolation = {
                    ...violation,
                    endTime: endTime.toISOString(),
                    duration
                };

                const newState = {
                    activeSession: {
                        ...state.activeSession,
                        currentViolation: null
                    }
                };

                // Add to appropriate violation list
                if (violation.type === 'focus') {
                    newState.activeSession.focusViolations = [
                        ...state.activeSession.focusViolations,
                        completedViolation
                    ];
                    newState.activeSession.wastedTime = state.activeSession.wastedTime + duration;
                } else {
                    newState.activeSession.breakViolations = [
                        ...state.activeSession.breakViolations,
                        completedViolation
                    ];
                }

                return newState;
            }),



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