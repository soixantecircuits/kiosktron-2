'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import {
  /* createProtocol,
  installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
const settings = require('standard-settings').getSettings()
global.settings = settings

// apply electron arguments from settings
if (settings.appendSwitch) {
  Object.keys(settings.appendSwitch).forEach((key) => {
    if (settings.appendSwitch[key] !== '') {
      app.commandLine.appendSwitch(key, settings.appendSwitch[key])
    } else {
      app.commandLine.appendSwitch(key)
    }
  })
}

if (settings.appendArgument) {
  Object.values(settings.appendArgument).forEach((value) => {
    app.commandLine.appendArgument(value)
  })
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let indexSite = 0

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow(settings.window)

  win.loadURL(global.settings.app.sites[indexSite])
  if (global.settings.app.sites.length > 1) {
    setInterval(() => {
      if (indexSite < global.settings.app.sites.length - 1) {
        indexSite++
      } else {
        indexSite = 0
      }
      win.loadURL(global.settings.app.sites[indexSite])
    }, global.settings.durations.intervalRotation)
  }

  win.on('closed', () => {
    win = null
  })

  win.on('unresponsive', () => {
    console.log('ERROR 61 - Window does not respond, let\'s quit')
    app.quit()
  })

  win.webContents.on('crashed', () => {
    console.log('ERROR 62 - Webcontent renderer crashed, let\'s quit')
    app.quit()
  })

  win.webContents.on('destroyed', () => {
    console.log('ERROR 63 - Webcontent destroyed, let\'s quit')
    app.quit()
  })
  win.webContents.session.clearCache(() => {
    console.log('cache cleared.')
  })
  // win.webContents.session.clearStorageData()
  // win.webContents.clearHistory()
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

app.on('gpu-process-crashed', () => {
  console.log('ERROR 64 - App GPU process has crashed, let\'s quit')
  app.quit()
})

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.on('uncaughtException', function (err) {
  console.log('ERROR 60 - process thrown exception, let\'s quit')
  console.log(err)
  if (global.settings.exit.onUncaughtException) {
    app.quit()
  }
})

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  if (global.settings.exit.onUnhandledRejection) {
    app.quit()
  }
})
