'use strict';

/*global console*/


var wpi = require('wiring-pi'),
	express = require('express'),
	app = express(),
	path = require('path'),
	pins ={};

wpi.setup('wpi');

function Pin(pinNo, type /*, pwm*/){

	var pin = {
		type: type,
		pinNo: Number(pinNo),
		on: false,
		timer: {
			use: false,
			on:1000,
			off:1000,
			controller:null,
			restart: function(arg){
				//console.log('restarting timer on ' + pin.pinNo);
				pin.timer.stop();
				wpi.digitalWrite(pin.pinNo,pin.on?0:1);
				pin.timer.controller = setTimeout(function(){
					pin.on = (arg !== undefined)?arg:!pin.on;
					//console.log(pin.pinNo + ' ' + pin.on? pin.timer.on : pin.timer.off);
					wpi.digitalWrite(pin.pinNo,pin.on?0:1);
					pin.timer.restart();
				}, pin.on? pin.timer.on : pin.timer.off);
			},
			stop:function(){
				if(pin.timer.controller){
					clearTimeout(pin.timer.controller);
					pin.timer.controller = null;
				}
			}
		},
		write: function(v){
			if(pin.type === wpi.OUTPUT){
				pin.on = v?true:false;
				wpi.digitalWrite(pin.pinNo,v);
			}
		}
	};

	wpi.pinMode(pinNo, type);
	if(pin.type === wpi.SOFT_PWM_OUTPUT && arguments[2]){
		wpi.softPwmCreate(pin.pinNo, 0, arguments[2]);
	}
	pins[pinNo] = pin;

	return pin;
}

new Pin(0, wpi.OUTPUT);
new Pin(1, wpi.OUTPUT);
pins[1].timer.use = true;
pins[1].timer.restart();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/on', function(req, res){

	if(req.query.pin){
		var pinNo = Number(req.query.pin);
		pins[pinNo].on=true;

		if(!pins[pinNo].timer.use){
			pins[pinNo].write(pinNo,0);
			console.log('pin ' + pinNo + ' on');
			res.end();
		}
		else if(pins[pinNo].timer.use && (req.query.timeon || req.query.timeoff)){

			pins[pinNo].timer.on  = req.query.timeon ? Number(req.query.timeon) : pins[pinNo].timer.on;
			pins[pinNo].timer.off  = req.query.timeoff ? Number(req.query.timeoff) : pins[pinNo].timer.off;

			console.log(pinNo + ' on for ' + pins[pinNo].timer.on);
			console.log(pinNo + ' off for ' + pins[pinNo].timer.off);
			pins[pinNo].timer.restart();
			res.send(pins[pinNo].timer.on + 'ms on, ' + pins[pinNo].timer.off + 'ms off');
		}
	}
});

app.get('/off', function(req, res){

	if(req.query.pin){
		var pinNo = Number(req.query.pin);
		pins[pinNo].write(1);

		if(!pins[pinNo].timer.use){
			console.log('pin '+pinNo + ' off');
		}
		else if(pins[pinNo].timer.use){
			pins[pinNo].timer.stop();
			console.log('pin '+pinNo + ' timer stopped');
		}
	}

	res.end();
});

app.get('/timerdata', function(req, res){

	if(req.query.pin){
		var pinNo = Number(req.query.pin);
		res.send(pins[pinNo].timer.on + 'ms on, ' + pins[pinNo].timer.off + 'ms off');
	}

});

var server = app.listen(3000, function(){
	console.log('running on port 3000');

});
