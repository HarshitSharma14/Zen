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
            // console.log('📡 getCurrentWindow called');
            return ipcRenderer.invoke('get-current-window');
        },
        getNewWindowInfo: () => {
            console.log('📡 getNewWindowInfo called');
            return ipcRenderer.invoke('get-new-window-info');
        },
        selectWindowType: (type) => {
            console.log('📡 selectWindowType called with:', type);
            return ipcRenderer.invoke('select-window-type', type);
        },
        showNewWindowDialog: (windowId) => {
            console.log('📡 showNewWindowDialog called with:', windowId);
            return ipcRenderer.invoke('show-new-window-dialog', windowId);
        },
        onWindowTypeSelected: (callback) => {
            ipcRenderer.on('window-type-selected', (event, data) => callback(data));
        }
    });
    console.log('✅ electronAPI exposed successfully');
} catch (error) {
    console.error('❌ Error exposing electronAPI:', error);
} 