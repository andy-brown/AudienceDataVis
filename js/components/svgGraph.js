var React = require('react');

var SVGgraph = React.createClass({
	// setInterval(plotPosition, 1000),

	propTypes: {
		url: React.PropTypes.string.isRequired
	},

	getInitialState: function(){
		return({
			markerPosition: 0,
			cursorPosition: 0,
			cursorLine: null,
			markerLine: null,
			segmentLabel: null,
			emotionLabel: null
		})
	},

	// callback to let parent know where we have clicked (sends time in s)
	handleMouseClick: function(e){
		var xClick = e.clientX - this.props.config.xOffset;
		var proportion = xClick/(this.props.config.xMax-this.props.config.xOffset);
		var time = (proportion * this.props.config.graphTimespan) + this.props.config.timeOffset;
        // time = time/60;
		// console.log('click at t=' + time);

		if (this.props.onMouseClickCB)
			this.props.onMouseClickCB(time);

	},

	// callback to let parent know where we are moving over graph (sends time in s)
	handleMouseMove: function(e){
		var xClick = e.clientX - this.props.config.xOffset;
		var proportion = xClick/(this.props.config.xMax-this.props.config.xOffset);
		var time = (proportion * this.props.config.graphTimespan) + this.props.config.timeOffset;

		if (this.props.onMouseMoveCB)
		 	this.props.onMouseMoveCB(time);
	},

	// get the xPixel of the given time on the SVG graph
	getPixelForTime: function (time){
		var positionOnGraph = (((time-this.props.config.timeOffset)/this.props.config.graphTimespan)*(this.props.config.xMax-this.props.config.xOffset))+this.props.config.xOffset;
		if(positionOnGraph < this.props.config.xOffset){
			positionOnGraph = this.props.config.xOffset;
		}
		if(positionOnGraph > this.props.config.xMax){
			positionOnGraph = this.props.config.xMax;
		}
		return positionOnGraph;
	},

	// re-draw marker lines in correct places
	componentDidUpdate: function(){
		if(this.state.markerLine === null)
			return;
		var markerX = this.getPixelForTime(this.props.marker);
		this.state.markerLine.setAttribute('x1', markerX);
		this.state.markerLine.setAttribute('x2', markerX);
		this.state.markerLine.setAttribute('y1', this.props.config.yMin);
		this.state.markerLine.setAttribute('y2', this.props.config.yMax);

		var cursorX = this.getPixelForTime(this.props.cursor);
		this.state.cursorLine.setAttribute('x1', cursorX);
		this.state.cursorLine.setAttribute('x2', cursorX);
		this.state.cursorLine.setAttribute('y1', this.props.config.yMin);
		this.state.cursorLine.setAttribute('y2', this.props.config.yMax);
	},

 	componentWillUpdate: function(){
		var svgElement = document.getElementById("svgGraph");
		svgElement.addEventListener('load', function()
		{
			this.addPositionLine(svgElement);
			// this.addAnnotations(svgElement);
			this.addEmotionLabel(svgElement);

		}.bind(this));
	},

	// process the annotations
	addAnnotations: function(svg){
		console.log('annotating ' + this.props.config.annotations.length);
		// console.log(this.props.config);
		if(this.props.config.annotations){
			for (var i = 0; i < this.props.config.annotations.length; i++){
				var note = this.props.config.annotations[i];
				this.annotateSegment(svg, note.start, note.end, note.label, note.color);
			}
	    }
	},

	addEmotionLabel: function(svg){
		var svgDoc = svg.contentDocument;
		this.state.emotionLabel = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
		this.state.emotionLabel.setAttribute('x', this.props.config.xMax-80);
		this.state.emotionLabel.setAttribute('y', this.props.config.yMin+20);
		this.state.emotionLabel.textContent = '';
		// emotionLabel.setAttribute('',);
		var fig = svgDoc.getElementById(this.props.config.graphElId);
		fig.appendChild(this.state.emotionLabel);

		// handle hovers - display emotion label if hovering over colour
		fig.addEventListener('mouseover', function(event)
		{
			var emotion = this.getEmotion(event.srcElement.style.fill);
			if(emotion != null){
				// console.log(emotion);
				this.state.emotionLabel.textContent = emotion;
				this.state.emotionLabel.setAttribute('x', event.clientX+5);
				this.state.emotionLabel.setAttribute('y', event.clientY+5);
			}
			else{
				this.state.emotionLabel.textContent = '';
			}
		}.bind(this));
	},

	// get the emotion a colour corresponds to
	// accepts rgb(x,y,x) string
	getEmotion: function(rgbFill){
		if(rgbFill.indexOf('(') == -1 || rgbFill === null){
			return null;
		}
		var colours = ['fd7047', 'f78707', 'ff0000', 'ed3546', 'fbcc00', 'faf207', '8bf35b', '07f728', 'eb0976', 'ce29bd', '800173', '510180', '3019a0', '0da057', '1f7a36', '4eda71', '2e60e7', '4e2ee7', '19bca7', '2eabe7'];
		var labels = ['shock', 'interest', 'anger', 'hate', 'amusement', 'pride', 'joy', 'contentment', 'contempt', 'disgust', 'fear', 'confusion', 'disappointment', 'relief', 'admiration', 'love', 'guilt', 'regret', 'compassion', 'sadness'];
		var hexFill = this.rgbToHex(rgbFill);
		// console.log(hexFill);
		for (var i = 0; i < colours.length; i++){
			if (colours[i] === hexFill){
				return labels[i];
			}
		}
		return null;
	},

	// converts rgb(x,y,z) string to hex number
	rgbToHex: function(rgb) {
		var a = rgb.split("(")[1].split(")")[0];
		a = a.split(",");
		var b = a.map(function(x){             //For each array element
			x = parseInt(x).toString(16);      //Convert to a base16 string
			return (x.length==1) ? "0"+x : x;  //Add zero if we get only one character
		})
		b = b.join("");
		return b;
	},

	// add some annotating SVG to the graph
	annotateSegment: function(svg, start, end, label, color){
		var svgDoc = svg.contentDocument;
		var fig = svgDoc.getElementById(this.props.config.graphElId);

		if (this.state.segmentLabel == null){
			this.state.segmentLabel = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'text');
			this.state.segmentLabel.setAttribute('x', this.props.config.xMax-80);
			this.state.segmentLabel.setAttribute('y', this.props.config.yMin+20);
			this.state.segmentLabel.textContent = '';
			fig.appendChild(this.state.segmentLabel);
		}
		var startX = this.getPixelForTime(start);
		var endX = this.getPixelForTime(end);
		var seg = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
		seg.setAttribute('x', startX);
		seg.setAttribute('width', endX-startX);
		seg.setAttribute('y', this.props.config.yMin);
		seg.setAttribute('height', this.props.config.yMax-this.props.config.yMin);
		seg.setAttribute('style', "fill:" + color + ";fill-opacity:0.1;stroke:gray;stroke-width:0.5;");

		fig.appendChild(seg);
		seg.addEventListener('mousemove', function(event)
		{
			// console.log(emotion);
			if(this.state.segmentLabel.textContent !== label){
				this.state.segmentLabel.textContent += label;
			}
			this.state.segmentLabel.setAttribute('x', event.clientX+5);
			this.state.segmentLabel.setAttribute('y', event.clientY-5);
		}.bind(this));
		seg.addEventListener('mouseout', function(event)
		{
			this.state.segmentLabel.textContent = '';
		}.bind(this));
	},

	// add lines to SVG to indicate cursor position and video position (marker)
	addPositionLine: function(svg){
		var svgDoc = svg.contentDocument;
		var cursorX = this.getPixelForTime(0);
		this.state.markerLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'line');
		this.state.markerLine.setAttribute('x1', cursorX);
		this.state.markerLine.setAttribute('y1', 0);
		this.state.markerLine.setAttribute('x2', cursorX);
		this.state.markerLine.setAttribute('y2', 0);
		this.state.markerLine.setAttribute('stroke', 'orange');
		this.state.markerLine.setAttribute('stroke-width', 3);
		this.state.markerLine.setAttribute('pointer-events', 'none');
		var svg = document.getElementById("svgGraph");
		var svgDoc = svg.contentDocument;
		var fig = svgDoc.getElementById(this.props.config.graphElId);
		fig.appendChild(this.state.markerLine);

		this.state.cursorLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'line');
		this.state.cursorLine.setAttribute('x1', cursorX);
		this.state.cursorLine.setAttribute('y1', 0);
		this.state.cursorLine.setAttribute('x2', cursorX);
		this.state.cursorLine.setAttribute('y2', 0);
		this.state.cursorLine.setAttribute('stroke', 'green');
		this.state.cursorLine.setAttribute('stroke-width', 3);
		this.state.cursorLine.setAttribute('pointer-events', 'none');
		fig.appendChild(this.state.cursorLine);

		fig.addEventListener('click', this.handleMouseClick);
		fig.addEventListener('mousemove', this.handleMouseMove);
	},

	render: function() {
      return (
  		<div>
  		<object
			id='svgGraph'
			width='1080px'
			type='image/svg+xml'
			data={this.props.url}
 		>
		</object>
  	  </div>
      );
    }
  });

  module.exports = SVGgraph;
