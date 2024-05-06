// Modules to control application life and create native browser window
const { app, BrowserWindow, autoUpdater, dialog, ipcMain } = require("electron");
const path = require("node:path")

const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const os = require('os');
const storage = require('electron-json-storage');

var port, deviceName = null
var serialPort, parser

storage.has('data', function(error, hasKey) {
  if (error) throw error;

  if (!hasKey) {
    storage.set("data", {
      cards: {
        
      }
    })
  }
});

if (require("electron-squirrel-startup")) app.quit();
var mainWindow
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1900,
    height: 1060,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon/icon.png")
  })

  // and load the index.html of the app.
  mainWindow.loadFile("public/index.html")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on("activate", function () {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on('request-stored-data', (event, data) => {
     
    if (data != "requestData" && data != undefined) {

      storage.set("data", data)
    }

    setTimeout(() => { mainWindow.webContents.send('stored-data', storage.getSync("data") || {"cards": {}}) }, 100)
  })
  
  ipcMain.on('return-device-name', (event, data) => {

    port = data
  })
  

  async function sendListSerialPorts() {

    await SerialPort.list().then((ports, err) => {
      mainWindow.webContents.send('list-devices', ports);
    })
  }

  
  async function connectToSerial() {
  
    try {
      serialPort = new SerialPort({ 
        path: port.path,
        baudRate: 9600 ,
      })  
    }
    catch {
      console.log("no connected")
      sendListSerialPorts()
      port = null
      setTimeout(connectToSerial, 2000)
    }
  
    serialPort.on("close", s => { sendListSerialPorts(); port = null; setTimeout(connectToSerial, 2000) })

    serialPort.on("error", s => { sendListSerialPorts(); port = null; setTimeout(connectToSerial, 2000) })
    
    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }))
  
    parser.on('data', data =>{
      console.log(data)
      mainWindow.webContents.send('serialport-data', data)
    });
  }
  
  connectToSerial()
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

autoUpdater.setFeedURL({
  url: "https://github.com/Raserber/application-visualisation-cartes-poker/releases/latest/download",
  headers: {
    "Cache-Control": "no-cache"
  }
})

autoUpdater.checkForUpdates()
setInterval(() => {

  autoUpdater.checkForUpdates()
}, 15000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : nomrelease,
    détail:
      "Une nouvelle version a été téléchargée. Redémarrez l'application pour appliquer les mises à jour."
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application')
  console.error(message)
})