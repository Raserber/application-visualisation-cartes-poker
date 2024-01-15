var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public')); //__dir and not _dir
app.listen(8000);
console.log('✅ Server web (8000)');

// -------------------------------------------

const WebSocket = require('ws');
var wss

try {
  wss = new WebSocket.Server({ port: 7071 });
  console.log("✅ Websocket (7071)")
}
catch {
  console.log("🟥 Websocket (7071)")
}

const clients = new Map();

wss.on('connection', (ws) => {
    const id = uuidv4();
    const metadata = { id };

    clients.set(ws, metadata);
})

wss.on("close", () => {
    clients.delete(ws);
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const serialPort = new SerialPort({ 
    path: 'COM5',
    baudRate: 9600 ,
})

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }))

parser.on('data', data =>{
  [...clients.keys()].forEach((client) => {
    client.send(data);
  });
  console.log(data)
});

console.log('✅ Serial Port (COM5)')