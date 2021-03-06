//####################################################################### 
// 
// ██████╗ ███████╗████████╗██████╗  ██████╗ ██╗  ██╗██╗   ██╗███████╗
// ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██║  ██║██║   ██║██╔════╝
// ██████╔╝█████╗     ██║   ██████╔╝██║   ██║███████║██║   ██║█████╗
// ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║██╔══██║██║   ██║██╔══╝
// ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████╗
// ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
//
// Implementation:  [@yannis_kolovos](http://twitter.com/yannis_kolovos)
// Logo: BashaChris [@BashaChris](http://twitter.com/BashaChris)
//#######################################################################
		
'use strict';

var frequencyArray,internalIpAddress,apiBaseUrl,username,bridge_status,audioContent,path,paths,visualizer,mask,audioStream,analyser = null;
var deviceType     = {devicetype: "RetroHue#WebClient"};
var controls       = ['saturation', 'brightness', 'sensitivity', 'transitiontime'];
var bridge_status  = 'Philips Hue Bridge: Not Connected';
var transitiontime = 1;
var sensitivity    = 80;
var saturation     = 250;
var brightness     = 250;
var activeRequest  = false;
var selectedLamps  = [];
var lamps          = {};
var hueCollection  = 65000;
var enabled        = true;
var bridges        = [];
var selectedBridge = 0;



var	setUpRetroHue = function () {
	
	if ('https:' == location.protocol) alert('Running on a demo mode!\n Please install the Chrome extension to manage Philips Hue Lamps');
	
	$.getJSON("https://www.meethue.com/api/nupnp", function(data) {
		if (data instanceof Array  && data.length > 0) { 
			bridges = data
			internalIpAddress = bridges[selectedBridge].internalipaddress;	 
		}
		else { 
			alert("We can't find Philips Bridge"); 
		}

	}).done(function() {
		if (bridges.length > 0) {
			authorizeUser();
			apiBaseUrl = `http://${internalIpAddress}/api/${username}`;
		
			if (username !== undefined) {
				selectLights();
			}
		}
		
		
		$('svg').fadeIn( "slow");
	});

	
	$.each(controls, function(i, control) {
		initializeControl(control);
	});
}


var	getBridge = function() {
	return bridges[selectedBridge]
}



var	setUpSelectors = function () {
	paths          = document.getElementsByTagName('path');
	visualizer     = document.getElementById('visualizer');
	mask           = visualizer.getElementById('mask');
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
}


var authorizeUser = function () {
	if (localStorage.getItem('username') !== null) {
		username = localStorage.getItem('username');
		return true
	}

	$.ajax({
		url:  `http://${internalIpAddress}/api`,
		type: 'POST',
		data: JSON.stringify(deviceType)
	}).done(function(response) {

		if (response instanceof Array && response[0].error) { 
			alert('Click the button on your Philips Hue Bridge and refresh this page');
		}

		if (response instanceof Array && response[0].success) { 
			username = response[0].success.username
			localStorage.setItem('username', username);
		}
	});
}

var selectLights = function () {
	$.ajax({
		url:  `${apiBaseUrl}/lights`,
		type: 'GET'
	}).done(function(data) {
		if (data instanceof Object) {
			lamps = data;
			
			var ids = Object.keys(data);
			alert([
				`We found ${ids.length} lamps in your network ${internalIpAddress}.`, 
				`Please select the lamps you want to use!`,
				`Note: We will turn on the lamp for you if its closed`]
				.join('\n'));
			
			$.each(ids, function(index, id) {
				if (confirm("Do you want to use: " + data[id].name + " (" + data[id].modelid+" - "+data[id].type+")")) {
					// open the light if its closed
					if (!data[id].state.on) setLightState(id, {on: true})
						selectedLamps.push(id);
				}
			});
		}
		
		
		bridge_status = `Connected to ${getBridge().id} at ${getBridge().internalipaddress}, using ${selectedLamps.length} lambs`;
		$('.status').html(`Philips Hue Bridge: ${bridge_status}`);
		
	});
}


var initializeControl = function (at) {
	var selector = $(`.${at}`);

	$(document).on('input', selector, function(e) {
		window[at] = parseInt(selector.val());
		localStorage.setItem(at, window[at]);
	});

	if (localStorage.getItem(at)){
		selector.val(localStorage.getItem(at)).trigger('input');
	}
};	

var setLightState = function(lightId, lightState) {
	if (activeRequest || !enabled || selectedLamps.length == 0 || !username) return;

	var apiUrl = `${apiBaseUrl}/lights/${lightId}/state`;
	activeRequest = true

	$.when( 
		$.ajax({
			url:  apiUrl,
			type: 'PUT',
			data: JSON.stringify(lightState)
		})).done(function() { 
			activeRequest = false 
		});
	};

	// adapted from https://codepen.io/zapplebee/pen/gbNbZE
		var soundAllowed = function (stream) {
			//Audio stops listening in FF without // window.persistAudioStream = stream;
			//https://bugzilla.mozilla.org/show_bug.cgi?id=965483
			//https://support.mozilla.org/en-US/questions/984179
			audioContent.resume();
			window.persistAudioStream = stream;
			audioStream = audioContent.createMediaStreamSource( stream );
			analyser = audioContent.createAnalyser();
			audioStream.connect(analyser);
			analyser.fftSize = 1024;

			frequencyArray = new Uint8Array(analyser.frequencyBinCount);
			visualizer.setAttribute('viewBox', '0 0 255 255');

			//Through the frequencyArray has a length longer than 255, there seems to be no
			//significant data after this point. Not worth visualizing.
			for (var i = 0 ; i < 255; i++) {
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttribute('stroke-dasharray', '4,1');
				mask.appendChild(path);
			}
			
			setUpRetroHue();			
			doDraw();
	};



	var doDraw = function () {
		requestAnimationFrame(doDraw);
		analyser.getByteFrequencyData(frequencyArray);
		var adjustedLength;
		var fixedadjustedLength;
		for (var i = 0 ; i < 255; i++) {
		
			adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
			fixedadjustedLength = Math.floor(((sensitivity / 255 ) * adjustedLength ));
			
			paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + fixedadjustedLength);
			
			// document.title = `${adjustedLength} > ${sensitivity} : ${(255 - sensitivity)}`
			if (adjustedLength > (255 - sensitivity)) {
				var id  = selectedLamps[Math.floor(Math.random() * selectedLamps.length)];
				
				setLightState(id, { 
					hue: Math.round(Math.random() * hueCollection), 
					transitiontime: transitiontime,
					sat: saturation,
					bri: brightness
				})
			}
		}
	};
	
	var soundNotAllowed = function (error) {
		console.log(error);
	}
	

	$(function() { 
		$( "#start" ).one( "click", function() {
			$('#start').hide();
			audioContent = new AudioContext();
			setUpSelectors();
			$('#footer').fadeIn("slow");
			$('#logo').fadeIn("slow", function() {
				navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);				
			});
		});
	});