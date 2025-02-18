import { app, shell, BrowserWindow, ipcMain, dialog, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

function createWindow({ width, height }: { width: number; height: number }): void {
  const mainWindow = new BrowserWindow({
    width,
    height,
    resizable: false,
    maximizable: true,
    minimizable: true,
    minHeight: height,
    minWidth: width,
    autoHideMenuBar: true,
    backgroundMaterial: 'mica',
    darkTheme: false,
    focusable: true,
    fullscreen: false,
    fullscreenable: true,
    simpleFullscreen: true,
    movable: true,
    roundedCorners: true,
    title: 'Herbal Life',
    show: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: is.dev
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
    mainWindow.webContents.send('update-check', 'Checking for updates...')
  })

  autoUpdater.on('update-available', () => {
    console.log('Update available')
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Downloading now...'
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No update available')
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'No Update Available',
      message: 'Your application is up-to-date.'
    })
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded')
    const result = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Install and Restart', 'Later'],
      defaultId: 0,
      title: 'Update Ready',
      message: 'An update has been downloaded. Would you like to install it now?'
    })

    if (result === 0) {
      autoUpdater.quitAndInstall()
    }
  })

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error)
    dialog.showErrorBox('Update Error', `Error: ${error.message || error}`)
  })

  console.log('App version:', app.getVersion())
  autoUpdater.checkForUpdatesAndNotify()
}

app.whenReady().then(() => {
  const display = screen.getPrimaryDisplay()
  const { height, width } = display.workAreaSize
  electronApp.setAppUserModelId('com.ran.herballife')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow({ height, width })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow({ height, width })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
