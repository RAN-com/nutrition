import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  dialog,
  screen,
  clipboard,
  Notification
} from 'electron'
import fs from 'fs'
import os from 'os'

import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'

let workerWindow: BrowserWindow | undefined
function createPdf() {
  workerWindow = new BrowserWindow({
    show: false,
    focusable: false,
    movable: true
  })
}

function createWindow({ width, height }: { width: number; height: number }): void {
  const mainWindow = new BrowserWindow({
    resizable: true,
    minWidth: 900,
    minHeight: 600,
    maxHeight: height,
    maxWidth: width,
    autoHideMenuBar: true,
    backgroundMaterial: 'mica',
    darkTheme: true,
    focusable: true,
    fullscreen: false,
    fullscreenable: true,
    movable: true,
    roundedCorners: true,
    title: 'Nutrition',
    show: true,
    titleBarStyle: 'default',
    titleBarOverlay: {
      color: 'blue',
      height: 40,
      symbolColor: 'white'
    },
    icon: join(__dirname, '../../resources/icon.png'),
    // ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      devTools: is.dev,
      // devTools: process.env.NODE_ENV === "developm",
      contextIsolation: false
    }
  })

  mainWindow.setMenu(null)
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
    const size = mainWindow.getSize()
    console.log(`Window resized to: ${size[0]} x ${size[1]}`)
    const data = {
      width: size[0],
      height: size[1]
    }

    mainWindow.webContents.send('sizeChanged', JSON.stringify(data))
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev) {
    process.env.APPIMAGE = join(
      __dirname,
      'out',
      `Nutrition Setup ${app.getVersion()}_linux.AppImage`
    )
  }
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('resize', () => {
    const size = mainWindow.getSize()
    console.log(`Window resized to: ${size[0]} x ${size[1]}`)
    const data = {
      width: size[0],
      height: size[1]
    }

    mainWindow.webContents.send('sizeChanged', JSON.stringify(data))
  })

  ipcMain.on('openUrl', (_event, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.on('generatePdf', (_event, div, fileName: string) => {
    createPdf()
    workerWindow?.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(div)}`)
    console.log('started to generate pdf')
    workerWindow?.webContents.on('did-finish-load', () => {
      dialog
        .showSaveDialog({
          filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
          defaultPath: join(app.getPath('documents'), `${fileName || 'nutrition'}.pdf`) // Default save location and filename
        })
        .then((result) => {
          if (!result.canceled && result.filePath) {
            workerWindow?.webContents
              .printToPDF({
                printBackground: true,
                landscape: false,
                pageSize: 'A4'
              })
              .then((data) => {
                const fs = require('fs')
                fs.writeFile(result.filePath, data, (error) => {
                  if (error) {
                    mainWindow.webContents.send('pdfGeneratedError', error)
                    console.error(`PDF save failed: ${error}`)
                  } else {
                    mainWindow.webContents.send('pdfGeneratedSuccess', result.filePath)
                    console.log(`PDF saved to ${result.filePath}`)
                  }
                  workerWindow?.close()
                })
              })
          } else {
            workerWindow?.close()
          }
        })
    })
  })

  // when worker window is ready
  ipcMain.on('readyToPrintPDF', (event) => {
    const pdfPath = join(os.tmpdir(), 'print.pdf')
    // Use default printing options
    console.log('Hoiii, downloading pdf')
    workerWindow?.webContents
      .printToPDF({
        pageSize: 'A4',
        printBackground: true,
        landscape: false
      })
      .then((data) => {
        fs.writeFile(pdfPath, data, function (error) {
          if (error) {
            throw error
          }
          shell?.openPath(pdfPath)
          event.sender.send('wrote-pdf', pdfPath)
        })
      })
      .catch((error) => {
        throw error
      })
  })

  ipcMain.on('updateResponse', (_event, message) => {
    console.log('Response from Renderer:', message)
    // You can take some action based on the response from the renderer
    // For example, trigger the update installation process
    if (message === 'install_now') {
      autoUpdater.quitAndInstall()
      return
    }

    if (message === 'quit_app') {
      mainWindow.close()
      return
    }

    if (message === 'minimize_app') {
      if (mainWindow.minimizable) {
        mainWindow.minimize()
      } else {
        new Notification({
          title: '',
          body: 'Cannot able to execute the action. Try again',
          closeButtonText: 'Close',
          timeoutType: 'default',
          urgency: 'low',
          icon: '../../resources/icon.png'
        }).show()
      }
    }

    if (message === 'no_internet') {
      new Notification({
        title: 'No Internet',
        body: 'Reopen when internet is connected'
      }).show()
      return
    }

    if (message.includes('copy_text#')) {
      const txt = message?.split('copy_text#')[1]
      if (txt && txt.length >= 1) {
        clipboard.writeText(txt as string)
        new Notification({
          title: 'Copied to clipboard'
        }).show()
      }
    }
  })
  autoUpdater.autoDownload = false // Disable auto-download

  // Checking for updates
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
    mainWindow.webContents.send('update-check', 'Checking for updates...')
  })

  // When an update is available, notify the renderer
  autoUpdater.on('update-available', () => {
    console.log('Update available')
    mainWindow.webContents.send('updateAvailable', true)
  })

  // When an update is downloaded, wait for user confirmation
  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded. Waiting for user confirmation.')
    mainWindow.webContents.send('updateDownloaded', true)
  })

  // Error handling
  autoUpdater.on('error', (error) => {
    console.error('Update error:', error)
    dialog.showErrorBox('Update Error', `Error: ${error.message || error}`)
  })

  // Start checking for updates
  console.log('App version:', app.getVersion())
  autoUpdater.checkForUpdates()

  console.log('App version:', app.getVersion())
  autoUpdater.checkForUpdatesAndNotify()
}

app.whenReady().then(() => {
  const display = screen.getPrimaryDisplay()
  const { height, width } = display.workAreaSize
  console.log(display.size, display.bounds, display.workArea, display.workAreaSize)
  electronApp.setAppUserModelId('com.ran.nutrition')

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
