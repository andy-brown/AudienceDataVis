var mediaEl;    // audio/video element
var data;		// the config data
var markerLine; // the line element in the svg that marks position
var emotionLabel; // a label for hovered emotion
var segmentLabel; // a label for hovered emotion

// retrieve a GET parameter
function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	  return decodeURIComponent(name[1]);
}

// determine which event we're viewing
var configFile = get('event');
if (!configFile){
	configFile = "verb";
}
configFile = "http://localhost:8080/media/" + configFile + ".json";


// get config file, then set up
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		var data = JSON.parse(xmlhttp.responseText);
		loadConfig(data);
	}
};
xmlhttp.open("GET", configFile, true);
xmlhttp.send();


// set up the page - create audio or video element
// load graph
function loadConfig(config){
	data = config;
	// load graph and media
	var svgElement = document.getElementById('svgGraph');

	// title
	document.getElementById('title').textContent = data.title;
	document.getElementById('explanation').innerHTML = data.explanation;

	// when svg loaded, add event listeners
	svgElement.addEventListener('load', function()
	{
		start();
	});
}


// create the marker line
// add click event listener to svg
function start(){

	// add a line to show position (time) on graph
	// addPositionLine();
	if(data.emotions === "true"){
		addEmotionLabel();
	}

	var svg = document.getElementById("svgGraph");
	var svgDoc = svg.contentDocument;
	var fig = svgDoc.getElementById(data.graphElId);

	if(data.annotations){
		for (var i = 0; i < data.annotations.length; i++){
			var note = data.annotations[i];
			annotateSegment(note.start, note.end, note.label, note.color);
		}
    }

}


// add emotion labelling
function addEmotionLabel(){
	var svg = document.getElementById("svgGraph");
	var svgDoc = svg.contentDocument;
	emotionLabel = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
	emotionLabel.setAttribute('x', data.xMax-80);
	emotionLabel.setAttribute('y', data.yMin+20);
	emotionLabel.textContent = '';
	// emotionLabel.setAttribute('',);
	var fig = svgDoc.getElementById(data.graphElId);
	fig.appendChild(emotionLabel);

	// handle hovers - display emotion label if hovering over colour
	fig.addEventListener('mouseover', function(event)
	{
		var emotion = getEmotion(event.srcElement.style.fill);
		if(emotion != null){
			// console.log(emotion);
			emotionLabel.textContent = emotion;
			emotionLabel.setAttribute('x', event.clientX+5);
			emotionLabel.setAttribute('y', event.clientY-5);
		}
		else{
			emotionLabel.textContent = '';
		}
	});

}


// get the emotion a colour corresponds to
// accepts rgb(x,y,x) string
function getEmotion(rgbFill){
	if(rgbFill === 'none' || rgbFill === null || rgbFill === ''){
		return null;
	}
	var colours = ['fd7047', 'f78707', 'ff0000', 'ed3546', 'fbcc00', 'faf207', '8bf35b', '07f728', 'eb0976', 'ce29bd', '800173', '510180', '3019a0', '0da057', '1f7a36', '4eda71', '2e60e7', '4e2ee7', '19bca7', '2eabe7'];
	var labels = ['shock', 'interest', 'anger', 'hate', 'amusement', 'pride', 'joy', 'contentment', 'contempt', 'disgust', 'fear', 'confusion', 'disappointment', 'relief', 'admiration', 'love', 'guilt', 'regret', 'compassion', 'sadness'];
	var hexFill = rgbToHex(rgbFill);
	// console.log(hexFill);
	for (var i = 0; i < colours.length; i++){
		if (colours[i] === hexFill){
			return labels[i];
		}
	}
	return null;
}


function annotateSegment(start, end, label, color){
	var svg = document.getElementById("svgGraph");
	var svgDoc = svg.contentDocument;
	var fig = svgDoc.getElementById(data.graphElId);

	if (segmentLabel == null){
		segmentLabel = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
		segmentLabel.setAttribute('x', data.xMax-80);
		segmentLabel.setAttribute('y', data.yMin+20);
		segmentLabel.textContent = '';
		fig.appendChild(segmentLabel);
	}
	var startX = getPixelForTime(start);
	var endX = getPixelForTime(end);
	var seg = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
	seg.setAttribute('x', startX);
	seg.setAttribute('width', endX-startX);
	seg.setAttribute('y', data.yMin);
	seg.setAttribute('height', data.yMax-data.yMin);
	seg.setAttribute('style', "fill:" + color + ";fill-opacity:0.1;stroke:gray;stroke-width:0.5;");

	fig.appendChild(seg);
	seg.addEventListener('mousemove', function(event)
	{
		// console.log(emotion);
		if(segmentLabel.textContent !== label){
			segmentLabel.textContent += label;
		}
		segmentLabel.setAttribute('x', event.clientX+5);
		segmentLabel.setAttribute('y', event.clientY-5);
	});
	seg.addEventListener('mouseout', function(event)
	{
		segmentLabel.textContent = '';
	});
}


// get the xPixel of the given time on the SVG graph
function getPixelForTime(time){
	var positionOnGraph = (((time-data.timeOffset)/data.graphTimespan)*(data.xMax-data.xOffset))+data.xOffset;
	if(positionOnGraph < data.xOffset){
		positionOnGraph = data.xOffset;
	}
	if(positionOnGraph > data.xMax){
		positionOnGraph = data.xMax;
	}
	return positionOnGraph;
}


// converts rgb(x,y,z) string to hex number
function rgbToHex(rgb) {
	// console.log(rgb);
	var a = rgb.split("(")[1].split(")")[0];
	a = a.split(",");
	var b = a.map(function(x){             //For each array element
		x = parseInt(x).toString(16);      //Convert to a base16 string
		return (x.length==1) ? "0"+x : x;  //Add zero if we get only one character
	})
	b = b.join("");
	return b;
}
