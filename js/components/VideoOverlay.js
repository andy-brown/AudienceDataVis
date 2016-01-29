var React = require('react');
import EmotionWheel from './EmotionWheel.js';
import SpotOverlay from './SpotOverlay.js';

var VideoOverlay = React.createClass({

	propTypes: {
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		visData: React.PropTypes.object.isRequired,
		playPos: React.PropTypes.number.isRequired
	},


	parseEmotionData: function(){
		// parse data by time
		var emoData = this.props.visData.emotions;
		var labels = ['shock', 'interest', 'amusement', 'pride', 'joy', 'contentment', 'love', 'admiration', 'relief', 'compassion', 'sadness', 'guilt', 'regret', 'disappointment', 'confusion', 'fear', 'disgust', 'contempt', 'hate', 'anger'];
		var colours = ['#fd7047', '#f78707', '#fbcc00', '#faf207', '#8bf35b', '#07f728', '#4eda71', '#1f7a36', '#0da057', '#19bca7', '#2eabe7', '#2e60e7', '#4e2ee7', '#3019a0', '#510180', '#800173', '#ce29bd', '#eb0976', '#ed3546', '#ff0000'];

		var spotData = {};
		spotData.times = [];
		spotData.colors = [];

		var emoStruct = {};
		for(var i = 0; i < labels.length; i++){
			emoStruct[labels[i]] = 0;
		}

		if(emoData){
			for (var i = 0; i < emoData.length; i++){
				spotData.times.push(emoData[i][0]);
				spotData.colors.push(colours[labels.indexOf(emoData[i][2])]);

				var delta = this.props.playPos - emoData[i][0];//60;
				if(delta > 0 && delta < this.props.options.wheelLifespan){
					// add number of strength (scaled back to 1-4)
					emoStruct[emoData[i][2]] += emoData[i][3]/100;
				}
			}
		}
		return [emoStruct, spotData];
	},

	createEmotionSpotOverlay: function(){
		if(this.props.options.emotionSpotsOverlayType === 'none'){
			return <g/>;
		}
		var emoData = this.parseEmotionData();
		var spotData = emoData[1];
		// render
		return <SpotOverlay
					playPos={this.props.playPos}
					type={this.props.options.emotionSpotOverlayType}
					data={spotData}
					height={this.props.height}
					width={this.props.width}
					opacity = {this.props.opacity}
					diameter={10}
					lifetime={5}
				/>;
	},

	createEmotionWheelOverlay: function(){
		if(!this.props.options.emotionWheelOverlay){
			return <g/>;
		}
		var emoData = this.parseEmotionData();
		var emoStruct = emoData[0];
		// render
		return 	<EmotionWheel
				data={emoStruct}
				xpos={3.5*this.props.width/4}
				ypos={this.props.height/4}
				id={'vidOverlayWheel'}
				scale={5}
				opacity={0.5}
			/>;
	},

	parseFobData: function(){
		var spotData = {};
		var data = this.props.visData;
		spotData.times = data.fob.times;
		spotData.colors = [];

		var fobUsers = data.fob.users;
		var users = data.users;

		var spots = [];
		for (var i = 0; i < spotData.times.length; i++){
			// get colour
			var color = 'blue';
			if(users[fobUsers[i]].indexOf('Love') >= 0){
				color = 'purple';
			}
			else if(users[fobUsers[i]].indexOf('Apathy') >= 0){
				color = 'yellow';
			}
			spotData.colors.push(color);
		}
		return spotData;
	},

	createFobOverlay: function(){
		if(this.props.options.fobOverlayType === 'none'){
			return <g />;
		}
		var spotData = this.parseFobData();

		return <SpotOverlay
					playPos={this.props.playPos}
					type={this.props.options.fobOverlayType}
					data={spotData}
					height={this.props.height}
					width={this.props.width}
					opacity = {this.props.opacity}
					diameter={10}
					lifetime={5}
			/>;
	},


	render: function() {
		return (
			<svg id='svgVideoOverlay' width={this.props.width} height={this.props.height}>
				{ this.createFobOverlay()}
				{ this.createEmotionWheelOverlay() }
				{ this.createEmotionSpotOverlay() }
			</svg>
		);
	}
});

module.exports = VideoOverlay;
