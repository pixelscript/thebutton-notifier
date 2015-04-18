var notifier = require('usb-webmail-notifier');
var WebSocket = require('ws');
var http = require('http');

requestRedditPage();

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

function listenToWebsocket(url) {
	var ws = new WebSocket(url);

	ws.on('message', function(data, flags) {
		// parse response
		var data = JSON.parse(data);
		// set colour
		notifier.color(whatColourAmI(data.payload.seconds_left));
	});
}



