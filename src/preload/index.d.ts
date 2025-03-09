import { ElectronAPI } from '@electron-toolkit/preload'

interface El extends ElectronAPI {
  updateAvailable(): void
  updateDownloaded(): void
  updateResponse(message: string): void
  generatePdf(id: string, fileName?: string): void
}

declare global {
  interface Window {
    electron: El
    api: unknown
  }
}
