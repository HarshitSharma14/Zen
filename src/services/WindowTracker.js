
class WindowTracker {
    constructor() {
        this.isTracking = false;
        this.trackingInterval = null;
        this.currentWindow = null;
        this.onWindowChange = null;
    }

    start(onWindowChangeCallback) {
        if (this.isTracking) return;

        console.log('🎯 Starting window tracking...');
        this.isTracking = true;
        this.onWindowChange = onWindowChangeCallback;

        // Check current window every 2 seconds
        this.trackingInterval = setInterval(() => {
            this.checkCurrentWindow();
        }, 2000); 

        // Also check immediately
        this.checkCurrentWindow();
    }

    stop() {
        console.log('⏹️ Stopping window tracking...');
        this.isTracking = false;
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
    }

    async checkCurrentWindow() {
        try {
            // Get current active window from Electron
            const windowInfo = await window.electronAPI.getCurrentWindow();

            if (!windowInfo) return;

            // Check if window changed
            const windowIdentifier = `${windowInfo.title}-${windowInfo.owner}`;
            const previousIdentifier = this.currentWindow ?
                `${this.currentWindow.title}-${this.currentWindow.owner}` : null;

            if (windowIdentifier !== previousIdentifier) {
                console.log('🪟 Window changed:', windowInfo);
                this.currentWindow = windowInfo;

                if (this.onWindowChange) {
                    this.onWindowChange(windowInfo);
                }
            }
        } catch (error) {
            console.error('❌ Error checking current window:', error);
        }
    }
}

// Export singleton instance
export const windowTracker = new WindowTracker();
