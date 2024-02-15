import { ElectronAPI } from '@electron-toolkit/preload'

interface ExtendedElectronAPI extends ElectronAPI {
  saveCookies: () => void
}

declare global {
  interface Window {
    electron: ExtendedElectronAPI
    api: unknown
  }
}
