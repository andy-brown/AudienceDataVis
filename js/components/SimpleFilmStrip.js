import FrameDataOverlay from './frameDataOverlay.js';
var Actions = require('./actions');

var ReactBootstrap = require('react-bootstrap');
var React = require('react');

var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;

var THUMBS_NUMTHUMBS = [10, 20, 30, 40, 80];


// Generate a film strip showing from frame 24 to frame 312 of material at framerate 25fps. Make thumb width 100 pixels, and thumb aspect ratio 16/9.

// <SimpleFilmStrip
// 	frames=["path/to/frame1.png", "path/to/frame2.png", ...]
// 	from={24}
// 	to={312}
// 	framerate={25}
// 	thumbWidth={100}
// 	thumbAspect={(16 / 9)}
// />

var SimpleFilmStrip = React.createClass({

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// React functionality

	propTypes: {
		frames: React.PropTypes.array.isRequired,
		from: React.PropTypes.number.isRequired,
		to: React.PropTypes.number.isRequired,
		thumbWidth: React.PropTypes.number.isRequired,
		thumbAspect: React.PropTypes.number.isRequired,
		framerate: React.PropTypes.number.isRequired,

		markerTracks: React.PropTypes.array,
		onMouseMoveCB: React.PropTypes.func,
		videoPlayingFrameNo: React.PropTypes.number
	},

	getInitialState: function() {
		return ({
			filmstrip:0,
			numThumbs:THUMBS_NUMTHUMBS[0],
		});
	},

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	scrubFrameStyle : {stroke:'#fff', strokeWidth:'4', opacity:'0.7', pointerEvents:'none'},

	styleSetGreen : [{stroke:'#0f0', strokeWidth:'4', opacity:'0.6', pointerEvents:'none'},//unselected
					{stroke:'#5f5', strokeWidth:'4', opacity:'0.9'},//selected
					{stroke:'#000', strokeWidth:'4', opacity:'0.0'},//invisible
					{stroke:'#5f5', strokeWidth:'4', opacity:'1.0', pointerEvents:'none'}],//drag

	styleSetOrange : [{stroke:'#fa1', strokeWidth:'4', opacity:'0.6', pointerEvents:'none'},
					{stroke:'#fd4', strokeWidth:'4', opacity:'0.9'},
					{stroke:'#000', strokeWidth:'4', opacity:'0.0'},
					{stroke:'#fd4', strokeWidth:'4', opacity:'0.9', pointerEvents:'none'}],

	getFrameNumberFromEvent: function(e) {
		var frameNumber = -1;
		try {
			var thumbIndex 		= parseFloat(e.target.attributes["data-thumb-index"].nodeValue);
			var nThumbs 		= parseFloat(e.target.attributes["data-num-thumbs"].nodeValue);
			var framesPerThumb 	= parseFloat(e.target.attributes["data-frames-per-thumb"].nodeValue);
			var firstFrameInStrip = parseFloat(e.target.attributes["data-first-frame-in-strip"].nodeValue);
			var xPosInStrip		= (thumbIndex*this.props.thumbWidth) + e.nativeEvent.offsetX;
			var stripWidth		= nThumbs * this.props.thumbWidth;
			var normalisedXPos	= xPosInStrip / stripWidth;
			frameNumber 		= firstFrameInStrip + Math.floor(normalisedXPos * (framesPerThumb * nThumbs));
		} catch (exception) {
			// console.log(exception);
			console.warn("FilmStrip getFrameNumberFromEvent failed");
		} finally {
			//console.debug("gfnfe " + frameNumber);
			return frameNumber;
		}
	},

	getMarkerTrackFromEvent: function(e) {
		var markerTrackName = e.target.attributes["data-marker-track-name"].nodeValue;

		if (this.props.markerTrack.name === markerTrackName)
			return this.props.markerTrack;

		for(var i = 0; i < this.state.shotCores.length; i++)
		{
			if (this.state.shotCores[i].name === markerTrackName)
				return this.state.shotCores[i];
		}
		return undefined;
	},


	handleMouseMove: function(e) {

		var frameNumber = this.getFrameNumberFromEvent(e);

		if(frameNumber == -1){ return; }
		// this.setState({scrubFrame:frameNumber});

		//Actions.setPlayhead({id:this.props.id, playhead:frameNumber});
		// console.log("Set frame number to ", frameNumber*this.props.thumbRate);

		if (this.props.onMouseMoveCB)
			this.props.onMouseMoveCB(frameNumber*this.props.thumbRate);
	},

	handleMouseClick: function(e) {
		var frameNumber = this.getFrameNumberFromEvent(e);

		if (this.props.onMouseClickCB)
			this.props.onMouseClickCB(frameNumber*this.props.thumbRate);
	},

	getMarkerIndexFromEvent: function(e)
	{
		var epsilon = 1; //allow 1 frame either side as picking space
		var frameNumber = this.getFrameNumberFromEvent(e);
		var markerTrack = this.getMarkerTrackFromEvent(e);
		for(var i = 0; i < markerTrack.markers.length; i++)
		{
			if (markerTrack.markers[i] >= (frameNumber-epsilon) && markerTrack.markers[i] <= (frameNumber+epsilon))
				return i;
		}
		return -1;
	},

	handleFilmstripButton: function() {
		this.state.filmstrip++;
		if (this.state.filmstrip >= THUMBS_NUMTHUMBS.length)
			this.state.filmstrip = 0;

		this.setState({filmstrip: this.state.filmstrip, numThumbs:THUMBS_NUMTHUMBS[this.state.filmstrip]});
	},

	frameNumToPx: function(startFrame, frame, framesPerThumb)
	{
		return ((frame - startFrame) / framesPerThumb) * this.props.thumbWidth;
	},

	makeArrayFilterRangeInclusive: function(startRange, endRange) {
		return function(elem) {
			return ((elem >= startRange) && (elem <= endRange));
		};
	},

	makeShotFilterRangeInclusive: function(startRange, endRange) {
		return function(elem) {
			return ((elem.start >= startRange) && (elem.start <= endRange));
		};
	},

	// get the data overlay for this range of thumbs
	// TODO: make this code generate a nice overlay, and put in a sensible place!
	makeThumbDataSVG: function(startFrame, endFrame, thumbIndex, numThumbs, framesPerThumb, thumbH, thumbW){
		startFrame *= this.props.thumbRate;
		endFrame *= this.props.thumbRate;

		var thumbNumber = Math.floor(this.props.scrubFrame/framesPerThumb);
		var vidPlayingThumbNumber = Math.floor(this.props.videoPlayingFrameNo/framesPerThumb);

		var startTime = startFrame/this.props.framerate;
		var endTime = endFrame/this.props.framerate;
		// startTime *= 60; endTime *= 60; // scale for testing

		// set opacity according to whether being viewed or not
		// more visible if scrubber over thumb or vid playing in this thumb
		var op = this.props.options.fobOpacity/10; //0.4;
		if(thumbIndex ===  thumbNumber || thumbIndex === vidPlayingThumbNumber){
			op = 0.9;
		}
		var dataFrameSVG = <g id={'svgThumb' + thumbIndex} style={{opacity:op}} >
		<FrameDataOverlay
			options={this.props.options}
			id={thumbIndex}
			data={this.props.visData}
			thumbH={thumbH}
			thumbW={this.props.thumbWidth}
			startTime={startTime}
			endTime={endTime}
			/>
		</g>;

		return dataFrameSVG;
	},

	makeThumbMarkerSVGFunction: function(startFrame, thumbIndex, markerTrack, numThumbs, framesPerThumb, thumbH, fromFrameNo){
		return function(thumbMarker) {
			var styles;
			//TODO remove this complete hack!
			/* if (/^core/i.test(markerTrack.name))
				styles = this.styleSetOrange;
			else
				styles = this.styleSetGreen; */

			var selectedMarkerFrameNumber, x;
			var style = styles[0];

			x = this.frameNumToPx(startFrame, thumbMarker, framesPerThumb);

			return(<line 	key={x}
							className="interactable"
							x1={x} y1={0} x2={x} y2={thumbH}
							style={style}
							data-thumb-index={thumbIndex}
							data-num-thumbs={numThumbs}
							data-frames-per-thumb={framesPerThumb}
							data-first-frame-in-strip={fromFrameNo}
							data-marker-frame={thumbMarker}
							data-marker-track-name={markerTrack.name}
					/>
			);
		}.bind(this);
	},

	renderFilmStrip: function(numThumbs, fromFrameNo, toFrameNo, markerTracks) //how many thumbs to draw, and frame range
	{
		var numFrames = (toFrameNo - fromFrameNo) + 1;
		var framesPerThumb = numFrames / numThumbs;

		var thumbW = this.props.thumbWidth;
		var thumbH = Math.floor(thumbW / this.props.thumbAspect);

		var thumbs = [];
		var i, x;

		//each thumbnail lives in a div, with an overlaid div for SVG items
		for(i = 0; i < numThumbs; i++)
		{
			var thumbMarkerSVG = [];
			var scrubFrameSVG = [];
			var videoPlayingAtSVG = [];

			var startFrame = fromFrameNo + Math.floor(i * framesPerThumb);
			var endFrame = fromFrameNo + (Math.floor((i+1) * framesPerThumb) - 1);

			var scrubFrameImgOffset = 0;
			var thumbMarkers;
			var markerTrackName = "None";

			if (markerTracks.length)
			{
				thumbMarkers = markerTracks.map(function(markerTrack){
					return markerTrack.markers.filter(this.makeArrayFilterRangeInclusive(startFrame, endFrame));
				}.bind(this));

				thumbMarkerSVG = thumbMarkers.map(function(thumbMarker,j){
					return thumbMarker.map(this.makeThumbMarkerSVGFunction(startFrame, i, markerTracks[j], numThumbs, framesPerThumb, thumbH, fromFrameNo));
				}.bind(this));

				//TODO - I added markerTrack names to match different Shots up with Click events.
				//Assuming here that the clickable stuff is ALWAYS in markerTracks[0] (ie shot markers and core markers)
				markerTrackName = markerTracks[0].name;
			}

			if(this.props.scrubFrame >= startFrame && this.props.scrubFrame <= endFrame)
			{
				//Playhead is within this thumb, so create scrubFrameSVG
				x = this.frameNumToPx(startFrame, this.props.scrubFrame, framesPerThumb);

				scrubFrameSVG = <line x1={x} y1={0} x2={x} y2={thumbH} style={this.styleSetGreen[0]}/>
				scrubFrameImgOffset = this.props.scrubFrame - startFrame;
			}

			// get a data overlay
			var dataFrameSVG = this.makeThumbDataSVG(startFrame, endFrame, i, numThumbs, framesPerThumb, thumbH, thumbW);

			// THIS CAN BE USED TO REFLECT videoPlayingFrameNo back...
			if(this.props.videoPlayingFrameNo > 0 && this.props.videoPlayingFrameNo >= startFrame && this.props.videoPlayingFrameNo <= endFrame)
			{
				x = this.frameNumToPx(startFrame, this.props.videoPlayingFrameNo, framesPerThumb);
				videoPlayingAtSVG = <line x1={x} y1={0} x2={x} y2={thumbH} style={this.styleSetOrange[0]}/>;
				//scrubFrameImgOffset = this.props.videoPlayingFrameNo - startFrame;
				// this.highlightDataSVG();
			}

			thumbs.push(
				<div key={i} style={{display:'inline-block',position:'relative',textAlign:'left'}}>
					{/* scale for thumbs if not one per frame */}
					<img width={thumbW} height={thumbH} src={this.props.frames[startFrame + scrubFrameImgOffset]} />
					<div style={{position:'absolute', top:'0px', left:'0px'}}>
						<svg	width={thumbW}
								height={thumbH}
								onMouseMove={this.handleMouseMove}
								onClick={this.handleMouseClick}
								data-thumb-index={i}
								data-num-thumbs={numThumbs}
								data-first-frame-in-strip={fromFrameNo}
								data-frames-per-thumb={framesPerThumb}
								data-marker-track-name={markerTrackName}>
							{videoPlayingAtSVG}
							{scrubFrameSVG}
							{thumbMarkerSVG}
							{dataFrameSVG}
						</svg>
					</div>
				</div>
			);
		}
		return thumbs;
	},

	toggleEmotions: function(opt){
        Actions.toggleOption('viewEmotions');
  		// Actions.toggleEmotions();
  	},

  	toggleFob: function(){
        Actions.toggleOption('viewFob');
 		// Actions.toggleFob();
  	},

	slideOpacity: function(){
		var op = document.getElementById('fobOpSlider').value;
		Actions.setOption({opt:'fobOpacity', val:op});
	},

	handleFrameSizeSlider: function(){
		var num = document.getElementById('frameSizeSlider').value;
		Actions.setOption({opt:'frameSize', val:parseInt(num)});
	},

	handleEmotionScaleSlider: function(){
		var num = document.getElementById('emoScalelider').value;
		Actions.setOption({opt:'scrubberEmoScale', val:parseInt(num)});
	},

	handleFobScaleSlider: function(){
		var num = document.getElementById('fobScalelider').value;
		Actions.setOption({opt:'scrubberFobScale', val:parseInt(num)});
	},

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// React functionality

	render: function() {
		if(!this.props.options['viewFilmStrip'])
			return <div></div>

		var thumbContainerStyle = {display:'flex', maxWidth:'1080px', marginBottom:'20px'};
		var thumbStyle = {padding:'10px', backgroundColor:'#dddddd', borderRadius:'5px', userSelect:'none'};

		var markerTracks = [];
		if (this.props.markerTracks)
			markerTracks = this.props.markerTracks;

		return (
			<div>
			<div style={thumbContainerStyle}>
				<div style={thumbStyle}>
					{this.renderFilmStrip(this.state.numThumbs, this.props.from, this.props.to, markerTracks)}
				</div>
				<div style={{maxHeight:'40px',minWidth:'40px'}}>
					<Button bsSize='small' onClick={this.handleFilmstripButton}>{/* <Glyphicon glyph='zoom-in' /> */}+</Button>
				</div>
			</div>
			<div style={thumbContainerStyle}>
				<div  style={thumbStyle}>
					<div>
						<p>
						<input type='checkbox' checked={this.props.options.viewEmotions} onChange={this.toggleEmotions} /><label>emotions</label>
						<span hidden={!this.props.options.viewEmotions}><label>Emotion scale:</label><input id='emoScalelider' type='range' max={this.props.thumbWidth/2} min={.1} step={.1} value={this.props.options.scrubberEmoScale} onChange={this.handleEmotionScaleSlider} /></span>
						</p>
						<p>
						<input type='checkbox' checked={this.props.options.viewFob} onChange={this.toggleFob} /><label>fob</label>
						<span hidden={!this.props.options.viewFob}><label>Fob scale:</label><input id='fobScalelider' type='range' max={this.props.thumbWidth/2} min={0.1} step={.1} value={this.props.options.scrubberFobScale} onChange={this.handleFobScaleSlider} /></span>
						</p><hr/>
						<p>
						<span hidden={!(this.props.options.viewEmotions || this.props.options.viewFob)}><label>Data opacity:</label><input id='fobOpSlider' type='range' max={10} min={0} step={0.1} value={this.props.options.fobOpacity} onChange={this.slideOpacity} /></span>
						</p>

					</div>
				</div>
			</div>

			</div>
		);
	}
});

module.exports = SimpleFilmStrip;
