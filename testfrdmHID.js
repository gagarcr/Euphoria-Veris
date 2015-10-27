// Test frdmHID interface

var frdmHID = require('./frdmHID');



function stopMotors(){
    frdmHID.setMotorState(1, 0);
    console.log('Motor stop');
}


function closeHID(){
    frdmHID.closeHIDDevice();
}

function testHID(){
    try {
     
   frdmHID.openHIDDevice();
    }
    catch(err) {
        console.log("No valid HID device found, waiting..");
        setTimeout(testHID,1000);
        return;
    }


    var direction = -1;

    //frdmHID.setMotorState(4, 1); // Set motor 1 on
    var activeMotors = 0;
    var activeState = 1; 

    // NO SW CORRECTION:
    //activeMotors |= (1<<0); // -2. GRANDE. Sentido horario
    //activeMotors |= (1<<1);   // -1. Pequeña. Negativo sube
    //activeMotors |= (1<<2); // 3. Pequeña. Positivo sue.
    //activeMotors |= (1<<3); // 2. GRANDE. Positivo sube
    //activeMotors |= (1<<4); // 0. GRANDE FEA. Positivo sube
    //activeMotors |= (1<<5); // 1. Pequeña. Positivo sube

    //activeMotors |= (1<<0); // Grande.  
    //activeMotors |= (1<<1); // Pequeña. Negativo sube
    //activeMotors |= (1<<2); // Grande.
    //activeMotors |= (1<<3); // Pequeña.
    //activeMotors |= (1<<4); // Grande.
    activeMotors |= (1<<5); // Pequeña.
  
    if(1){
        // Move active down
        setTimeout( function(){ frdmHID.setMotorSpeed(activeMotors, activeState, -0.4*direction); } , 0500);
        setTimeout( function(){ frdmHID.setMotorSpeed(activeMotors, activeState, 0); } , 4000);
        setTimeout( closeHID, 5000);
    }
    else  {
        if (0){
            // Move active up
            setTimeout( function(){ frdmHID.setMotorSpeed(activeMotors, activeState, 0.75*direction); }, 0500);
            setTimeout( function(){ frdmHID.setMotorSpeed(activeMotors, activeState, 0); } , 4000); 
            setTimeout( closeHID, 11000);
        }
        // Move down sequence
        else if (1){
            setTimeout( function(){ frdmHID.setMotorSpeed(( 1<<0) |(1<<2) |(1<<4), activeState, -0.2*direction); }, 0500);                
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1) |(1<<3) |(1<<5), activeState, -0.4*direction); }, 02500);    
           
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1) | (1<<3) |(1<<5) | (1<<0) |(1<<2) |(1<<4), activeState, 0*direction); }, 7000);    

            setTimeout( closeHID, 8000);
            
        }

        // Move up sequence
        else if (0){
            // Up litte    
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1) |(1<<3) |(1<<5), activeState, 0.6*direction); }, 12000);    
           
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1) |(1<<3) |(1<<5), activeState, 0.1*direction); }, 16000);    

            setTimeout( closeHID, 17000);
            
        }
        else if (0){
            // Up biggers
           setTimeout( function(){ frdmHID.setMotorSpeed(( 1<<0) |(1<<2) |(1<<4), activeState, 0.8*direction); }, 00500);                
           setTimeout( function(){ frdmHID.setMotorSpeed((1<<0) |(1<<2) |(1<<4), activeState, 0.1*direction); }, 28000);    

           setTimeout( closeHID, 32000);
        }
        // Dance sequence 
        else {
            // Down the bigg ones to the half
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<0), activeState, -0.2*direction); }, 1000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<0), activeState, +0.2*direction); }, 7000);

            setTimeout( function(){ frdmHID.setMotorSpeed((1<<2), activeState, -0.2*direction); }, 7000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<2), activeState, +0.2*direction); }, 13000);

            setTimeout( function(){ frdmHID.setMotorSpeed((1<<4), activeState, -0.2*direction); }, 13000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<2), activeState, +0.2*direction); }, 20000);

            // Down the littel ones to the half
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1), activeState, -0.4*direction); }, 20000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1), activeState, +0.1*direction); }, 24000);

            setTimeout( function(){ frdmHID.setMotorSpeed((1<<5), activeState, -0.4*direction); }, 24000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<5), activeState, +0.1*direction); }, 28000);
            
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<3), activeState, -0.4*direction); }, 28000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<3), activeState, +0.1*direction); }, 31000);

            // Down the bigger ones to the limit
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<4) |(1<<0) |(1<<2), activeState, -0.1*direction); }, 31000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<4) |(1<<0) |(1<<2), activeState, 0*direction); }, 41000);

    
            // Steps ups little ones and down, then stop
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1), activeState, +0.55*direction); }, 40000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1), activeState, -0.1*direction); }, 46000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1), activeState, +0.1*direction); }, 50000);

            setTimeout( function(){ frdmHID.setMotorSpeed((1<<5), activeState, +0.55*direction); }, 42000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<5), activeState, -0.1*direction); }, 48000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<5), activeState, +0.1*direction); }, 52000);

            setTimeout( function(){ frdmHID.setMotorSpeed((1<<3), activeState, +0.55*direction); }, 44000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<3), activeState, -0.1*direction); }, 50000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<3), activeState, +0.1*direction); }, 54000);

            // Close the litte ones a bit
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1)|| (1<<3) || (1<<5), activeState, +0.55*direction); }, 54000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1)|| (1<<3) || (1<<5), activeState, -0.1*direction); }, 60000);
            setTimeout( function(){ frdmHID.setMotorSpeed((1<<1)|| (1<<3) || (1<<5), activeState, +0.1*direction); }, 64000);

                        
            setTimeout( closeHID, 65000);
            
        }
    }
  


    //frdmHID.setMotorSpeed(0x08, 1, 0); // Set motor 2 on 200/255 speed
    //frdmHID.setMotorSpeed(1, 4, 50); // Set motor 2 on 200/255 speed
    //frdmHID.setMotorSpeed(3, 1, 255); // Set motor 2 on 200/255 speed
    //frdmHID.setMotorSpeed(4, 0, 1); // Set motor 2 on 200/255 speed
        
    //setTimeout(stopMotors, 1000);
    //setTimeout( closeHID, 5000);
    
}

testHID();




