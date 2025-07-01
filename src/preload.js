// Simple version to test if preload loads at all
console.log('🚀 Preload script is running!');

const { contextBridge, ipcRenderer } = require('electron');

console.log('📦 Electron modules loaded');

try {
    contextBridge.exposeInMainWorld('electronAPI', {
        getAvailableWindows: () => {
            console.log('📡 getAvailableWindows called');
            return ipcRenderer.invoke('get-available-windows');
        },
        getCurrentWindow: () => {
            console.log('📡 getCurrentWindow called');
            return ipcRenderer.invoke('get-current-window');
        }
    });
    console.log('✅ electronAPI exposed successfully');
} catch (error) {
    console.error('❌ Error exposing electronAPI:', error);
}