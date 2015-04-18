var notifier = require('usb-webmail-notifier');
var WebSocket = require('ws');
var http = require('http');

requestRedditPage();

var orangeInterval;
var orangeInterval2;
function makeOrange() {
	orangeInterval = setInterval(function(val){
		notifier.color('RED');
		orangeInterval2 = setTimeout(function(){
			notifier.color('YELLOW');
		},1);
	},2);
}


function requestRedditPage(){
	var options = {
		hostname:"www.reddit.com",
		path:"/r/thebutton"
	}

	var req = http.request(options, function(res) {
	    var output = '';
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
	        output += chunk;
	    });
	    res.on('end', function() {
	    	// find websocket in source
	        var url = getSocketURL(output);
	        if(url) {
	        	// open the websocket
	        	listenToWebsocket(url);
	        }
	    });
	});

	req.end();
}


function whatColourAmI(s){
	s = parseInt(s);
	if (s >=0 && s <= 11 ){
		return 'RED';
	} else if (s >=12 && s <= 21 ) {
		return 'ORANGE';
	} else if (s >=22 && s <= 31 ) {
		return 'YELLOW';
	} else if (s >=32 && s <= 41 ) {
		return 'GREEN';
	} else if (s >=42 && s <= 51 ) {
		return 'BLUE';
	} else if (s >=52 && s <= 60 ) {
		return 'PURPLE';
	} else {
		return 'OFF'
	}
}

function getSocketURL(content) {
	var index = content.indexOf("wss://wss.redditmedia.com/thebutton");
	if(index!==-1){
		var newContent = content.substr(index);
		var endIndex = newContent.indexOf('"');
		if(endIndex!==-1){
			return newContent.substr(0,endIndex);
		}
	}
}
var currentColour;
function listenToWebsocket(url) {
	var ws = new WebSocket(url);

	ws.on('message', function(data, flags) {
		// parse response
		var data = JSON.parse(data);
		// get colour
		var colour = whatColourAmI(data.payload.seconds_left);
		if(currentColour===colour){
			return;
		}
		currentColour = colour;
		setColour(colour);
		
	});
}

function setColour(colour) {
	console.log(colour);
	// stop orange making
	if(orangeInterval){
		clearInterval(orangeInterval);
		clearInterval(orangeInterval2);
	}
	// set colour
	if(colour == 'ORANGE'){
		makeOrange();
	} else {
		notifier.color(colour);
	}
}



