// frdmHID.js - Communication with the FRDM board, USBHID
// Based on Dream Cheeky Big Red Button by Dj Walker-Morgan

var HID = require('node-hid');
var _ = require("underscore"); //Does not work in console
var FRDM_vendorId = 4660;
var FRDM_productId = 6;

// File variable to access the frmd
var frdmHIDdev;

// Protol specifications
// [b0-b2] - CmdType
var FRDM_cmdType_bit = 0;
var FRDM_cmdType_mask = 0x07;
var FRDM_cmdType_status = 0x00; // Get status
var FRDM_cmdType_set = 0x01;    // Command describes an inmediate action
var FRDM_cmdType_store = 0x02;  // Command describes an action to store
// b3 - _OFF(0)/ON(1). Motor Motor number (Not contained in command)
var FRDM_state_bit = 4;
var FRDM_state_mask = 0x01;
// b4 - SPEED. 0: Speed control disabled (Not contained in command)
var FRDM_speed_bit = 5;
var FRDM_speed_mask = 0x01;
// b5 - POSITION. 0: Position control disabled (Not contained in command)
var FRDM_position_bit = 6;
var FRDM_position_mask = 0x01;
// b6 - TIME, only for store commands. 0: time information not sent.
var FRDM_time_bit = 7;
var FRDM_time_mask = 0x01;
// b7 - UNDEFINDED

var INT16_MAX = 0x7FFF;

// Sends a desired motor state
function setMotorState(motorNo, state){
    // Call the create command with only the state and motor no
    sendCommand(createCommand(FRDM_cmdType_set, state, motorNo)); 
} 


// Sends the desired motor speed
function setMotorSpeed(motorNo, state, speed){
    // Convert speed from float to singed 16b
    speed = speed*INT16_MAX | 0;
    console.log(speed);
    // Call the create command with only the state and motor no
    sendCommand(createCommand(FRDM_cmdType_set, state, motorNo, speed)); 
}

// Sends the desire motor position. speed optional.
function setMotorPosition(motorNo, state, position, speed){
    // Call the create command with only the state and motor no
    sendCommand(createCommand(FRDM_cmdType_set, state, motorNo)); 
}

// Sends a store command. Speed and position are optional values.
function storeCommand(motorNo, state, time, speed, position){
    // Call the create command with only the state and motor no
    // Type is different from the others
    sendCommand(createCommand(FRDM_cmdType_store, state, motorNo)); 
}

// Adds the CMD type header and payload length
// Data: list of bytes to send
function createCommand(cmdType, state, motorNo, speed, position, time){    
    if  ( (cmdType === 'undefined') ||
         ( (cmdType != FRDM_cmdType_status) && 
            ( (state === 'undefined') || (motorNo === 'undefined') ) ||
         ( (cmdType != FRDM_cmdType_store) && (time === 'undefined') ) ) )        
            throw new Error('Required protocol arguments not fulfilled');
    
    var cmd_buffer = new Buffer(100); // Much larger than required, then cropped    
    cmd_buffer.fill(0);
    var lengthUsed = 0;
    var cmd_enable = 0x00; 
    cmd_enable = cmd_enable | (cmdType & FRDM_cmdType_mask);    
    // Only if argument exists (is included)
    if (state !== undefined){
        cmd_enable = cmd_enable | (FRDM_state_mask << FRDM_state_bit);    
    }
    if (motorNo !== undefined){
        // Does not have enable bit
        // Add motorNo byte  
        //cmd_buffer.writeUIntBE(0xAB, 0, 2);
        cmd_buffer.writeUIntBE(motorNo, lengthUsed, 1);
        lengthUsed++;
        //cmd_buffer = Buffer.concat([cmd_buffer, (new Buffer([motorNo]))], cmd_buffer.length+1); 
    }
    if (speed !== undefined){
        // Update enable bit to reflect this information
        cmd_enable = cmd_enable | (FRDM_speed_mask << FRDM_speed_bit); 
        cmd_buffer.writeIntBE(speed, lengthUsed, 2);
        lengthUsed = lengthUsed + 2;
        //cmd_buffer = Buffer.concat([cmd_buffer, (new Buffer([speed]))], cmd_buffer.length+2);  
    }
    if (position !== undefined) {
        cmd_enable = cmd_enable | (FRDM_position_mask << FRDM_position_bit);
        cmd_buffer.writeUIntBE(position, lengthUsed, 1);
        lengthUsed++;
        //cmd_buffer = Buffer.concat([cmd_buffer, (new Buffer([position]))], cmd_buffer.length+1); 
    }
    if (time !== undefined){
        cmd_enable = cmd_enable | (FRDM_time_mask << FRDM_time_bit);
        // TODO: check time lenght    
        // DONE: FIX second byte. 
        cmd_buffer.writeUIntBE(time, lengthUsed, 1);
        lengthUsed++;
        //cmd_buffer = Buffer.concat([cmd_buffer, (new Buffer([time]))], cmd_buffer.length+2); 
    }


    var cmd_buffer_header = new Buffer(2);
    // Add lenght
    cmd_buffer_header.writeUIntBE(lengthUsed, 1, 1);
    //cmd_buffer = Buffer.concat([(new Buffer([cmd_buffer.length])), cmd_buffer], cmd_buffer.length+1)
    // Add enable bit first
    cmd_buffer_header.writeUIntBE(cmd_enable, 0, 1);
    //cmd_buffer = Buffer.concat([(new Buffer([cmd_enable])), cmd_buffer], cmd_buffer.length+1);
    // Crop cmd_buffer to lenghtUsed and append header
    cmd_buffer = Buffer.concat( [ cmd_buffer_header, (cmd_buffer.slice(0, lengthUsed)) ], cmd_buffer_header.length+lengthUsed );

    // Note that if you want to disable auto-acknowlegment, you must also set a 
    // payload size — for some reason these are linked in the nRF24 feature set.
    if (cmd_buffer.length > 32){
        throw new Error('Command payload too long, NRF24 only supports 32 byte payload!');
    }
    

    return cmd_buffer;
}


function sendCommand(cmd){
    console.log('Sending command: ', cmd);
    frdmHIDdev.write(cmd);

}


function openHIDDevice(){
    //console.log('\r\nHID devices', HID.devices());
    // Same as HID.devices(FRDM_vendorId, FRMD_productId);
    var frdmHID = _.where( HID.devices(),  {vendorId: FRDM_vendorId,
                                             productId: FRDM_productId});
    if (!frdmHID.length){
        throw new Error('No FRDM HID board detected');
    }

    //console.log('\r\nFRMD HID boards:', frdmHID);
    if (frdmHID.length > 1){
        console.log('More than one FRDM HID boards detected, using first one');
        frdmHID = frdmHID[0];
    }

    else {
        console.log('FRMD HID board found, serial no:', frdmHID[0].serialNumber);
    }

    // Open comunication
    frdmHIDdev = new HID.HID(frdmHID[0].path);
    console.log('HID dev channel open');

    // Hook funcition to read from device
    //frdmHIDdev.read(onRead);
    frdmHIDdev.on('data', function (data) {
                        console.log("Incoming data: ", data);                
                        });

    // TODO: Implement error HID handler
    frdmHIDdev.on("error", function(err) {
                         console.log('Error in HID procolol: ', err);
                         });
    

}

function closeHIDDevice(){
    frdmHIDdev.close();
    console.log('HID dev channel closed');
}


module.exports.openHIDDevice = openHIDDevice;
module.exports.closeHIDDevice = closeHIDDevice;
module.exports.setMotorState = setMotorState;
module.exports.setMotorSpeed = setMotorSpeed;

