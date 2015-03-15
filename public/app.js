//app for controlling rpi relay
'use strict';

var timeOn=document.querySelector('#time-on'),
	timeOff=document.querySelector('#time-off'),
	timerData=document.querySelector('#timerdata');

function updateTimer(sw){
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
		{
			if (req.readyState == 4 && req.status == 200){
				timerData.innerHTML = req.responseText;
			}
		};
	req.open('GET', '/timerdata?pin='+sw);
	req.send();
}
updateTimer(1);

function setOn(sw){
	var request = new XMLHttpRequest();
	var timerVals = '';
	if(sw == 1){
		timerVals = '&timeon='+timeOn.value + '&timeoff=' + timeOff.value;
	}
	request.open('GET', '/on?pin='+sw+timerVals);
	request.send();
}

function setOff(sw){
	var request = new XMLHttpRequest();
	request.open('GET', '/off?pin='+sw);
	request.send();
}

timeOn.addEventListener('input', function(){
	setOn(1);
}, false);

timeOff.addEventListener('input', function(){
	setOn(1);
}, false);