// Web server

var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server); 
var frdmHID = require('./frdmHID');

// Global variables
var connectedHID = 0;
var cmdQueue = [];
var direction = -1;
var activeState = 1; 

app.use('/bower_components', express.static(__dirname + '/bower_components'));  
app.use('/material.css', express.static(__dirname + '/material.css'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

console.log('Starting server on port 8080...');
server.listen(8080); 


io.on('connection', function(client) {  
    console.log('Client connected...');
    
    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });

    client.on('messages', function(data) {
       console.log(data);
       client.broadcast.emit('broad',data);
       client.emit('broad', "Broadcast emitted");
    });

    client.on('slmouseup', function(data) {
       //registerLog(data);
       if (connectedHID) cmdQueue.push(data);
    });

    client.on('connectHID', function() {
        connectHID(); 
    } );

    client.on('disconnectHID', function() {
        closeHID(); 
    } );
});


function registerLog(data) {
    console.log(data);
    // Broadcast to all clients
    io.sockets.emit('log', data);
};


// Check for new data to send each 0.5 seg

setInterval(function() {
    if ( (connectedHID) && (cmdQueue.length > 0) ){
      var cmd = cmdQueue.pop();
      var splitvar = cmd.split(':');
      if (splitvar === undefined) return;
      if (splitvar.length < 2) return;
      var motorNo = splitvar[0];
      var value = splitvar[1]; 
      if (motorNo.slice(0,2) === 'sl'){
        var activeMotor = 0;
        for (var i=2; i < motorNo.length; i++)
          activeMotor |= 1 << motorNo[i];
        registerLog("Send command\nMotorNo:" +activeMotor + ":" + value);
        frdmHID.setMotorSpeed(activeMotor, activeState, value*direction)
        //efrdmHID.setMotorSpeed(1<<motorNo[2], activeState, value*direction);
      }
    }
}, 500);


var connectTimeout;
function connectHID(){
    try { 
      frdmHID.openHIDDevice();
    }
    catch(err) {
        registerLog("No valid HID device found, waiting..");
        connectTimeout = setTimeout(connectHID,1000);
        return;
    }
    connectedHID = 1;
    registerLog("Connected to HID device");
}


function closeHID(){
    if (connectTimeout) {
      clearTimeout(connectTimeout);
      connectTimeout = undefined;
      registerLog("Cancelled connection to HID device");
    }
    if (connectedHID) {
      frdmHID.closeHIDDevice();
      connectedHID = 0;
      registerLog("Desconnected from HID device");
    }
}


