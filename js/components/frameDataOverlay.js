import EmotionWheel from './EmotionWheel.js';
var React = require('react');

var FrameDataOverlay = React.createClass({

	/*

	TODO: scaling - this is static now

	*/

	// generate some svg that displays the fob data for this segment
	generateFobSVG: function(data, thumbH, thumbW){
		if(!this.props.options['viewFob'])
			return <g/>;

		// fob
		var barWidth = 10;
		var fobData = data.fob.times;
		var lovecount = 0, apathycount = 0, othercount = 0;
		var scale= this.props.options.scrubberFobScale;
		for (var i = 0; i < fobData.length; i++){
			if (fobData[i] >= this.props.startTime && fobData[i] < this.props.endTime){
				if(data.users[data.fob.users[i]].indexOf('Love') == 0){
					lovecount += 1;
				}
				else if(data.users[data.fob.users[i]].indexOf('Apathy') == 0){
					apathycount += 1;
				}
			}
		}

		// a pair or coloured vertical bars on bottom R
		var loveOverlayStyle = {visibility:'visible', stroke:'white', strokeWidth:1,fill:'purple',pointerEvents:'none'};
		var apathyOverlayStyle = {visibility:'visible', stroke:'black', strokeWidth:1,fill:'yellow',pointerEvents:'none'};
		return <g>
		<rect x={thumbW-1-2*barWidth} y={thumbH-scale*lovecount} width={barWidth} height={scale*lovecount} style={loveOverlayStyle}/>
		<rect x={thumbW-barWidth} y={thumbH-scale*apathycount} width={barWidth} height={scale*apathycount} style={apathyOverlayStyle}/>
		</g>;
	},


  	// generate some svg that displays the emotion data for this segment
	generateEmotionSVG: function(){
		if(!this.props.options['viewEmotions'])
			return <g/>;

		// emotions
		var emoData = this.props.data.emotions;
		var labels = ['shock', 'interest', 'amusement', 'pride', 'joy', 'contentment', 'love', 'admiration', 'relief', 'compassion', 'sadness', 'guilt', 'regret', 'disappointment', 'confusion', 'fear', 'disgust', 'contempt', 'hate', 'anger'];

		var emoStruct = {};
		for(var i = 0; i < labels.length; i++){
			emoStruct[labels[i]] = 0;
		}

		if(emoData){
			for (var i = 0; i < emoData.length; i++){
				if(emoData[i][0] >= this.props.startTime && emoData[i][0] < this.props.endTime){
					emoStruct[emoData[i][2]] += 1;
				}
			}
		}

		return <EmotionWheel
					data={emoStruct}
					xpos={this.props.thumbW/2}
					ypos={this.props.thumbH/2}
					id={this.props.id}
					scale={this.props.options.scrubberEmoScale}
				/>

	},


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// React functionality

	render: function() {
		return <g>
			{ this.generateFobSVG(this.props.data, this.props.thumbH, this.props.thumbW) }
			{ this.generateEmotionSVG() }
		</g>;
	}
});

module.exports = FrameDataOverlay;
