import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
const kill = require('tree-kill')

let BACKEND_PROCESS: ChildProcessWithoutNullStreams

const isDevelopmentEnv = () => {
  return process.env.NODE_ENV === 'development'
}

const appPath = app.getAppPath()
const userDataPath = app.getPath('userData')
const spawnDjango = () => {
  const djangoArgs = isDevelopmentEnv()
    ? ['python\\Backend\\manage.py', 'runserver', '--noreload']
    : ['Backend.exe', 'runserver', '--noreload']
  console.log(djangoArgs)

  const spawnOptions = {
    cwd: isDevelopmentEnv() ? appPath : userDataPath,
    shell: true
  }

  return spawn('python', djangoArgs, spawnOptions)
}

const startBackendServer = () => {
  BACKEND_PROCESS = spawnDjango()
  BACKEND_PROCESS.stdout.on('data', (data) => {
    console.log(`stdout:\n${data}`)
  })

  BACKEND_PROCESS.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  BACKEND_PROCESS.on('error', (error) => {
    console.error(`error: ${error.message}`)
  })

  BACKEND_PROCESS.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })

  return BACKEND_PROCESS
}

function createWindow(): void {
  // start the backend
  startBackendServer()
  // show the port running on
  console.log('Spawn on port: ', BACKEND_PROCESS.pid)
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      nodeIntegration: true,
      allowRunningInsecureContent: true
    },
    center: true
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ipcMain.on('save-cookies', (_) => {
    mainWindow.webContents.session.cookies
      .get({})
      .then((cookies) => {
        const serializedCookies = JSON.stringify(cookies)
        mainWindow.webContents.send('set-cookies', serializedCookies)
      })
      .catch((error) => {
        console.error('Error getting cookies:', error)
      })
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async () => {
  console.log('Ending our backend server.')
  kill(BACKEND_PROCESS.pid)
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  console.log('Ending our backend server darwin.')
  kill(BACKEND_PROCESS.pid)
})
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
