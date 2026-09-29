import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// -------------------------------------------------------------
// 1. Intercept all console methods & forward to Main Process
// -------------------------------------------------------------
const consoleLevels = ['log', 'info', 'warn', 'error', 'debug'] as const

consoleLevels.forEach((level) => {
  const original = console[level]

  console[level] = (...args: unknown[]) => {
    // Keep standard browser DevTools output
    original.apply(console, args)

    // Send to main process log file
    try {
      ipcRenderer.send('renderer-console-log', {
        level,
        args: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
      })
    } catch {
      // Prevent error on window unload
    }
  }
})

// -------------------------------------------------------------
// 2. Custom APIs for renderer
// -------------------------------------------------------------
const api = {
  log: (level: 'info' | 'warn' | 'error', message: string) => {
    ipcRenderer.send('log-message', { level, message })
  }
}

// -------------------------------------------------------------
// 3. Context Bridge Exposure
// -------------------------------------------------------------
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      updateAvailable: () => ipcRenderer.send('updateAvailable'),
      updateDownloaded: () => ipcRenderer.send('updateDownloaded'),
      updateResponse: (message: string) => ipcRenderer.send('updateResponse', message),
      generatePdf: (message: string, fileName?: string) =>
        ipcRenderer.send('generatePdf', message, fileName)
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI,
    updateAvailable: () => ipcRenderer.send('updateAvailable'),
    updateDownloaded: () => ipcRenderer.send('updateDownloaded'),
    updateResponse: (message: string) => ipcRenderer.send('updateResponse', message),
    generatePdf: (message: string, fileName?: string) =>
      ipcRenderer.send('generatePdf', message, fileName)
  }
  // @ts-ignore (define in dts)
  window.api = api
}
