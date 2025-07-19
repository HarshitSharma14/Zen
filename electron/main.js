import { app, BrowserWindow, ipcMain, desktopCapturer } from 'electron'
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
        id: source.id,
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
    // console.log('Current window:', currentWindow)
    return currentWindow ? currentWindow.id : null
  } catch (error) {
    console.error('Error getting current window:', error)
    return null
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