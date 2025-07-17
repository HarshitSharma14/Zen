
// 3. WINDOW CATEGORIZATION HELPER (add to src/utils/windowUtils.js)

export const categorizeWindow = (windowInfo, focusWindows = [], breakWindows = []) => {
    const windowTitle = windowInfo.title?.toLowerCase() || '';
    const windowOwner = windowInfo.owner?.toLowerCase() || '';
    const windowText = `${windowTitle} ${windowOwner}`;

    // Check if it's a known focus window
    for (const focusWindow of focusWindows) {
        const focusName = focusWindow.name?.toLowerCase() || '';
        if (windowText.includes(focusName) || focusName.includes(windowTitle)) {
            return { type: 'focus', window: focusWindow };
        }
    }

    // Check if it's a known break window
    for (const breakWindow of breakWindows) {
        const breakName = breakWindow.name?.toLowerCase() || '';
        if (windowText.includes(breakName) || breakName.includes(windowTitle)) {
            return { type: 'break', window: breakWindow };
        }
    }

    // Unknown window
    return { type: 'unknown', window: null };
};
