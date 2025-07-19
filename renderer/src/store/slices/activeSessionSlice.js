export const createActiveSessionSlice = (set, get) => ({
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

    // Actions
    startSession: (config) => {
        const now = new Date();
        const timeline = config.timeline;

        set((state) => ({
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
        }));
    },

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
}); 