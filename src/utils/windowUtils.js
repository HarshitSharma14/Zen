// Updated windowUtils.js

export const categorizeWindow = (windowInfo, focusWindows = [], breakWindows = []) => {
    // ✅ APPROACH 1: Try exact ID match first (most reliable)
    const windowId = windowInfo.id;
    
    // Check focus windows by ID
    for (const focusWindow of focusWindows) {
        if (focusWindow.id === windowId) {
            return { type: 'focus', window: focusWindow };
        }
    }
    
    // Check break windows by ID
    for (const breakWindow of breakWindows) {
        if (breakWindow.id === windowId) {
            return { type: 'break', window: breakWindow };
        }
    }

    // ✅ APPROACH 2: Fallback to process/app matching (for when windows close/reopen)
    const windowOwner = windowInfo.owner?.toLowerCase() || '';
    const windowPath = windowInfo.path?.toLowerCase() || '';
    const windowProcessId = windowInfo.processId;
    
    // Check by process details for focus windows
    for (const focusWindow of focusWindows) {
        if (isProcessMatch(windowInfo, focusWindow)) {
            console.log('🔄 Window matched by process details (focus):', windowInfo.title);
            return { type: 'focus', window: focusWindow };
        }
    }
    
    // Check by process details for break windows
    for (const breakWindow of breakWindows) {
        if (isProcessMatch(windowInfo, breakWindow)) {
            console.log('🔄 Window matched by process details (break):', windowInfo.title);
            return { type: 'break', window: breakWindow };
        }
    }

    // Unknown window
    return { type: 'unknown', window: null };
};

// Helper function to match windows by process/app details
const isProcessMatch = (currentWindow, savedWindow) => {
    // Try multiple matching strategies
    
    // 1. Process ID match (if same session)
    if (currentWindow.processId && savedWindow.processId) {
        if (currentWindow.processId === savedWindow.processId) {
            return true;
        }
    }
    
    // 2. App path match (most reliable for same app)
    if (currentWindow.path && savedWindow.path) {
        if (currentWindow.path.toLowerCase() === savedWindow.path.toLowerCase()) {
            return true;
        }
    }
    
    // 3. Bundle ID match (macOS)
    if (currentWindow.bundleId && savedWindow.bundleId) {
        if (currentWindow.bundleId === savedWindow.bundleId) {
            return true;
        }
    }
    
    // 4. Owner name match (fallback, least reliable)
    if (currentWindow.owner && savedWindow.owner) {
        const currentOwner = currentWindow.owner.toLowerCase();
        const savedOwner = savedWindow.owner?.toLowerCase() || savedWindow.name?.toLowerCase();
        if (currentOwner === savedOwner) {
            return true;
        }
    }
    
    return false;
};