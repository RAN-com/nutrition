import { ElectronAPI } from '@electron-toolkit/preload'

interface El extends ElectronAPI {
  updateAvailable(): void
  updateDownloaded(): void
  updateResponse(message: string): void
  generatePdf(id: string, fileName?: string): void
}

export interface IElectronAPI {
  log: (level: 'info' | 'warn' | 'error', message: string) => void
}

declare global {
  interface Window {
    electron: El
    api: unknown & IElectronAPI
  }
}
