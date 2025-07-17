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

                // UPDATED TRACKING PROPERTIES (removed unknownWindows)
                windowHistory: [], // Track all window changes with timestamps
                currentWindowInfo: null, // Current active window details
                focusViolations: [], // Times when user was on break windows during focus
                breakViolations: [], // Times when user was on focus windows during break
                wastedTime: 0, // Total time wasted (on break windows during focus)
                currentViolation: null, // Active violation being tracked
            },

            // ✅ UPDATED: Store complete window metadata
            updateCurrentWindow: (windowInfo) => set((state) => {
                const now = new Date();
                const currentSegment = state.activeSession.currentSegment;

                // Store complete window metadata in history
                const newHistoryEntry = {
                    timestamp: now.toISOString(),
                    window: {
                        id: windowInfo.id,                    // ✅ Persistent ID
                        title: windowInfo.title,
                        owner: windowInfo.owner,
                        processId: windowInfo.processId,      // ✅ Process info
                        bundleId: windowInfo.bundleId,        // ✅ Bundle ID (macOS)
                        path: windowInfo.path                 // ✅ App path
                    },
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

            // ✅ REMOVED: addUnknownWindow function (no longer needed)

            // ✅ UPDATED: Store complete window metadata when categorizing
            categorizeWindow: (windowId, category, windowInfo) => set((state) => {
                // Store complete window metadata
                const windowData = {
                    id: windowInfo.id,
                    name: windowInfo.title,          // Keep 'name' for backwards compatibility
                    title: windowInfo.title,
                    owner: windowInfo.owner,
                    processId: windowInfo.processId,
                    bundleId: windowInfo.bundleId,
                    path: windowInfo.path
                };

                const updatedConfig = { ...state.sessionConfig };
                if (category === 'focus') {
                    updatedConfig.focusWindows = [...(updatedConfig.focusWindows || []), windowData];
                } else {
                    updatedConfig.breakWindows = [...(updatedConfig.breakWindows || []), windowData];
                }

                return {
                    sessionConfig: updatedConfig
                    // ✅ REMOVED: unknownWindows cleanup (no longer needed)
                };
            }),

            startViolation: (violationType, windowInfo) => set((state) => ({
                activeSession: {
                    ...state.activeSession,
                    currentViolation: {
                        type: violationType, // 'focus' or 'break'
                        startTime: new Date().toISOString(),
                        window: {
                            id: windowInfo.id,
                            title: windowInfo.title,
                            owner: windowInfo.owner,
                            processId: windowInfo.processId,
                            bundleId: windowInfo.bundleId,
                            path: windowInfo.path
                        },
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

            // Actions (keep all your existing actions)
            setCurrentPage: (page) => set({ currentPage: page }),

            setUser: (user) => set({
                user,
                isAuthenticated: !!user
            }),

            saveSessionConfig: (config) => set({
                sessionConfig: config
            }),

            // ✅ UPDATED: Fixed startSession to work with new structure
            startSession: (config) => set((state) => {
                const now = new Date();
                const timeline = config?.timeline || state.sessionConfig?.timeline || [];

                return {
                    sessionConfig: config || state.sessionConfig,
                    activeSession: {
                        isActive: true,
                        startTime: now.toISOString(),
                        currentSegment: timeline[0] || null,
                        timeline: timeline,
                        elapsedTime: 0,
                        currentWindow: null,
                        segmentProgress: 0,
                        totalFocusTime: 0,
                        totalBreakTime: 0,
                        totalDistractionTime: 0,
                        distractions: [],
                        
                        // ✅ Initialize new tracking properties
                        windowHistory: [],
                        currentWindowInfo: null,
                        focusViolations: [],
                        breakViolations: [],
                        wastedTime: 0,
                        currentViolation: null,
                    }
                };
            }),

            // ✅ UPDATED: Better session progress tracking
            updateSessionProgress: (elapsedSeconds) => set((state) => {
                const { activeSession } = state;

                if (!activeSession.isActive) return state;

                let cumulativeTime = 0;
                let currentSegmentIndex = 0;

                // Find current segment
                for (let i = 0; i < activeSession.timeline.length; i++) {
                    const segment = activeSession.timeline[i];
                    if (elapsedSeconds < cumulativeTime + (segment.duration * 60)) {
                        currentSegmentIndex = i;
                        break;
                    }
                    cumulativeTime += segment.duration * 60;
                    currentSegmentIndex = i + 1; // Move to next if this segment is complete
                }

                const currentSegment = activeSession.timeline[currentSegmentIndex] || null;
                const segmentStartTime = cumulativeTime;
                const segmentProgress = currentSegment 
                    ? ((elapsedSeconds - segmentStartTime) / (currentSegment.duration * 60)) * 100
                    : 100;

                // Calculate total focus and break time
                let totalFocusTime = 0;
                let totalBreakTime = 0;

                for (let i = 0; i < currentSegmentIndex; i++) {
                    const segment = activeSession.timeline[i];
                    if (segment.type === 'focus') {
                        totalFocusTime += segment.duration * 60;
                    } else {
                        totalBreakTime += segment.duration * 60;
                    }
                }

                // Add current segment progress
                if (currentSegment) {
                    const segmentElapsed = elapsedSeconds - segmentStartTime;
                    if (currentSegment.type === 'focus') {
                        totalFocusTime += segmentElapsed;
                    } else {
                        totalBreakTime += segmentElapsed;
                    }
                }

                return {
                    activeSession: {
                        ...activeSession,
                        elapsedTime: elapsedSeconds,
                        currentSegment,
                        segmentProgress: Math.min(100, Math.max(0, segmentProgress)),
                        totalFocusTime,
                        totalBreakTime
                    }
                };
            }),

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
                    ...state.activeSession,
                    isActive: false,
                    currentSegment: null,
                    currentViolation: null
                }
            }))
        }),
        {
            name: 'focus-tracker-storage',
            partialize: (state) => ({
                sessionConfig: state.sessionConfig,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // Don't persist activeSession - start fresh each time
                // Don't persist currentPage - always start at session-setup
            }),
        }
    )
)

export default useAppStore;