import { app, BrowserWindow, ipcMain, desktopCapturer, screen } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import activeWin from 'active-win'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const preloadPath = path.join(__dirname, 'preload.cjs');
console.log('Preload path:', preloadPath);
console.log('Preload exists:', fs.existsSync(preloadPath));

let mainWindow
let dialogWindow = null
let overlayWindow = null
let pendingWindowInfo = null
let openDialogWindowIds = [] // Track which window IDs have open dialogs

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  const isDev = !app.isPackaged

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'))
  }
}

function createOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.close()
  }

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'))

  overlayWindow.on('closed', () => {
    overlayWindow = null
  })
}

function createDialogWindow(windowId) {
  // Check if dialog is already open for this window ID
  if (openDialogWindowIds.includes(windowId)) {
    console.log(`Dialog already open for window ID: ${windowId}`)
    // Bring existing dialog to front and make it active
    if (dialogWindow && !dialogWindow.isDestroyed()) {
      dialogWindow.show()
      dialogWindow.focus()
      dialogWindow.setAlwaysOnTop(true)
      console.log(`Brought existing dialog to front for window ID: ${windowId}`)
    }
    return
  }

  if (dialogWindow) {
    dialogWindow.close()
  }

  // Create overlay to block background interaction
  createOverlayWindow()

  // Add window ID to open dialogs array
  openDialogWindowIds.push(windowId)
  pendingWindowInfo = windowId

  dialogWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: 'Window Selection Dialog',
    frame: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    modal: false, // Reverted to false to allow interaction with background windows
    focusable: true,
    show: false, // Don't show immediately
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  const isDev = !app.isPackaged

  if (isDev) {
    dialogWindow.loadFile(path.join(__dirname, '../renderer/newWindowDialog.html'))
  } else {
    dialogWindow.loadFile(path.join(__dirname, '../renderer/newWindowDialog.html'))
  }

  // Position the dialog in the top-right corner
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  dialogWindow.setPosition(width - 420, 20)

  // Force focus and bring to front
  dialogWindow.focus()
  dialogWindow.show()
  dialogWindow.setAlwaysOnTop(true)

  // Prevent closing with escape key or other methods
  dialogWindow.on('close', (event) => {
    if (pendingWindowInfo) {
      event.preventDefault()
    }
  })

  dialogWindow.on('closed', () => {
    // Remove window ID from open dialogs array when dialog is closed
    if (pendingWindowInfo && openDialogWindowIds.includes(pendingWindowInfo)) {
      const index = openDialogWindowIds.indexOf(pendingWindowInfo)
      if (index > -1) {
        openDialogWindowIds.splice(index, 1)
        console.log(`Removed window ID ${pendingWindowInfo} from open dialogs`)
      }
    }
    dialogWindow = null
  })

  // Ensure dialog gets focus when shown
  dialogWindow.on('show', () => {
    dialogWindow.focus()
  })

  // Handle when dialog loses focus - bring it back
  dialogWindow.on('blur', () => {
    if (pendingWindowInfo) {
      dialogWindow.focus()
    }
  })
}

// Alternative: Native-style modal for Windows
function createNativeModalDialog(windowId) {
  if (dialogWindow) {
    dialogWindow.close()
  }

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  dialogWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: 'Window Selection Dialog',
    frame: false, // No frame for native look
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    modal: false,
    focusable: true,
    show: false,
    x: Math.floor((width - 400) / 2),
    y: Math.floor((height - 600) / 2),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  })

  // For Windows, set window style to be more modal-like
  if (process.platform === 'win32') {
    dialogWindow.setAlwaysOnTop(true, 'screen-saver')
  }

  const isDev = !app.isPackaged
  if (isDev) {
    dialogWindow.loadFile(path.join(__dirname, '../renderer/newWindowDialog.html'))
  } else {
    dialogWindow.loadFile(path.join(__dirname, '../renderer/newWindowDialog.html'))
  }

  // Force focus and bring to front
  dialogWindow.focus()
  dialogWindow.show()
  dialogWindow.setAlwaysOnTop(true)

  // Prevent closing with escape key or other methods
  dialogWindow.on('close', (event) => {
    if (pendingWindowInfo) {
      event.preventDefault()
    }
  })

  dialogWindow.on('closed', () => {
    // Remove window ID from open dialogs array when dialog is closed
    if (pendingWindowInfo && openDialogWindowIds.includes(pendingWindowInfo)) {
      const index = openDialogWindowIds.indexOf(pendingWindowInfo)
      if (index > -1) {
        openDialogWindowIds.splice(index, 1)
        console.log(`Removed window ID ${pendingWindowInfo} from open dialogs`)
      }
    }
    dialogWindow = null
  })

  // Ensure dialog gets focus when shown
  dialogWindow.on('show', () => {
    dialogWindow.focus()
  })

  // Handle when dialog loses focus - bring it back
  dialogWindow.on('blur', () => {
    if (pendingWindowInfo) {
      dialogWindow.focus()
    }
  })
}

// IPC Handlers - these respond to React's requests
ipcMain.handle('get-available-windows', async () => {
  try {
    console.log('Getting available windows...')

    // Get all available windows with thumbnails
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 800, height: 600 },
      fetchWindowIcons: true // Also get app icons for better visuals
    })


    // Filter out our own app and system windows
    const windows = sources
      .filter(source => {
        const name = source.name.toLowerCase()
        return !name.includes('focus tracker') &&
          !name.includes('desktop') &&
          source.name !== '' // Filter empty names
      })
      .map(source => ({
        id: extractWindowId(source.id),
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(), // Convert to base64
        appIcon: source.appIcon ? source.appIcon.toDataURL() : null // ✅ This will now work
      }))

    console.log(`Found ${windows.length} windows`)
    return windows

  } catch (error) {
    console.error('Error getting windows:', error)
    return []
  }
})

ipcMain.handle('get-current-window', async () => {
  try {
    const currentWindow = await activeWin()

    if (!currentWindow || !currentWindow.owner || !currentWindow.owner.name) return null

    const systemApps = [
      'explorer.exe', 'windowserver', 'gnome-shell',
      'desktop_window', 'taskmgr.exe', 'systemsettings.exe', 'zen', 'zen.exe',
      'windows explorer', 'searchhost.exe'
    ]

    const myAppNames = ['focus tracker', 'electron'] // Adjust for your app

    const ownerName = currentWindow.owner.name.toLowerCase()

    if (systemApps.includes(ownerName) || myAppNames.includes(ownerName)) {
      return null
    }

    // Filter out our own dialog window and main window
    if (currentWindow && currentWindow.id) {
      const windowName = (currentWindow.title || '').toLowerCase()
      const isOurDialog = windowName.includes('new window classification')

      if (isOurDialog) {
        return null // Don't return our own windows
      }

      const result = { id: currentWindow.id, name: currentWindow.title || 'Unknown Window' }
      return currentWindow
    }

    return null
  } catch (error) {
    console.error('Error getting current window:', error)
    return null
  }
})

function extractWindowId(sourceId) {
  const match = sourceId.match(/^window:(\d+):/);
  return match ? parseInt(match[1], 10) : null;
}

// New window dialog handlers
ipcMain.handle('get-new-window-info', async () => {
  if (!pendingWindowInfo) return null

  console.log('in herre')
  console.log(pendingWindowInfo)

  // re-fetch the list of windows
  const sources = await desktopCapturer.getSources({
    types: ['window'],
    thumbnailSize: { width: 800, height: 600 },
    fetchWindowIcons: true
  })

  // find the one with your ID

  const matchingSource = sources.find((src) => {
    const srcId = extractWindowId(src.id);
    return srcId === pendingWindowInfo;
  });

  console.log(matchingSource)

  console.log(pendingWindowInfo)
  const win = matchingSource
  win.id = pendingWindowInfo
  if (!win) return null


  pendingWindowInfo = {
    id: win.id,
    name: win.name,
    thumbnailDataURL: win.thumbnail.toDataURL(),
    appIconDataURL: win.appIcon?.toDataURL() || null
  }

  // build a serializable info object
  return {
    id: win.id,
    name: win.name,
    thumbnailDataURL: win.thumbnail.toDataURL(),
    appIconDataURL: win.appIcon?.toDataURL() || null
  }
})

ipcMain.handle('select-window-type', async (event, type) => {
  try {
    if (pendingWindowInfo) {
      // Send the selection back to the main window
      mainWindow.webContents.send('window-type-selected', {
        windowInfo: pendingWindowInfo,
        type: type
      })

      // Remove window ID from open dialogs array
      const index = openDialogWindowIds.indexOf(pendingWindowInfo)
      if (index > -1) {
        openDialogWindowIds.splice(index, 1)
        console.log(`Removed window ID ${pendingWindowInfo} from open dialogs after selection`)
      }

      // Close the dialog window
      if (dialogWindow) {
        dialogWindow.close()
        dialogWindow = null
      }

      // Close the overlay window
      if (overlayWindow) {
        overlayWindow.close()
        overlayWindow = null
      }

      pendingWindowInfo = null
    }
    return { success: true }
  } catch (error) {
    console.error('Error selecting window type:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('show-new-window-dialog', async (event, window) => {
  try {
    console.log('Showing new window dialog for window:', window.id)
    console.log('Currently open dialog window IDs:', openDialogWindowIds)
    createDialogWindow(window.id)
    return { success: true }
  } catch (error) {
    console.error('Error showing dialog:', error)
    return { success: false, error: error.message }
  }
})

// App lifecycle
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})