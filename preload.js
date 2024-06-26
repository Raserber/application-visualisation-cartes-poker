/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */


window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  // renderer -> Main.js
  storedData: (data) => ipcRenderer.send('request-stored-data', data),
  returnChoosenDevice: (data) => ipcRenderer.send('return-device-name', data),
  askFullscreen: () => ipcRenderer.send('ask-fullscreen'),
  
  // Main.js -> renderer
  onSerialPortData: (callback) => ipcRenderer.on('serialport-data', (_event, value) => callback(value)),
  onListDevices: (callback) => ipcRenderer.on('list-devices', (_event, value) => callback(value)),
  onStoredData: (callback) => ipcRenderer.on('stored-data', (_event, value) => callback(value))
})