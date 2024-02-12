const { contextBridge, ipcRenderer } = window.require('electron')
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      saveToken: (authToken) => {
        ipcRenderer.send('save-auth-token', authToken)
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI,
    saveToken: (authToken) => {
      ipcRenderer.send('save-auth-token', authToken)
    }
  }
  // @ts-ignore (define in dts)
  window.api = api
}
