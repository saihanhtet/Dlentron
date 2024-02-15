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
      saveCookies: () => {
        ipcRenderer.send('save-cookies')
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI
  }
  // @ts-ignore (define in dts)
  window.api = api
}

ipcRenderer.on('set-cookies', (_, cookies) => {
  localStorage.setItem('cookies', cookies)
})
