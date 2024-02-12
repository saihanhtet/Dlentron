import { ElectronAPI } from '@electron-toolkit/preload'

interface ExtendedElectronAPI extends ElectronAPI {
  saveToken: (authToken: any) => void
}

declare global {
  interface Window {
    electron: ExtendedElectronAPI
    api: unknown
  }
}
