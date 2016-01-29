import VideoOverlay from './VideoOverlay.js';
var React = require('react');
var Actions = require('./actions');

var Video = React.createClass({
	// setInterval(plotPosition, 1000),

	propTypes: {
		vidid: React.PropTypes.string.isRequired,
	},

	getInitialState: function(){
        return({
            started:false,
			playTime: 0
        })
    },

	playPositionChanged: function() {
		var mediaEl = document.getElementById(this.props.vidid);
		if(mediaEl){
			var time = mediaEl.currentTime;
			if(time != this.state.playTime){
				this.setState({playTime: time});
				var frame = Math.floor(time*this.props.frameRate);
				// console.log("video time = " + time);
				// Actions.setPlayFrameNumber(frame);
				if (this.props.playPositionCB)
					this.props.playPositionCB(time);
			}
		}
	},

	componentDidMount: function(){
		setInterval(this.playPositionChanged, 50);
	},

	selectFobVis: function(){
		var vis = 'none';
		if(document.getElementById('rainFob').checked){
			vis = 'rain';
		}
		else if(document.getElementById('spotFob').checked){
			vis = 'spots';
		}
		Actions.setOption({opt:'fobOverlayType', val:vis});
	},

	selectEmoVis: function(){
		var vis = 'none';
		if(document.getElementById('rainEmoSpot').checked){
			vis = 'rain';
		}
		else if(document.getElementById('spotEmoSpot').checked){
			vis = 'spots';
		}
		Actions.setOption({opt:'emotionSpotOverlayType', val:vis});
	},

	toggleEmotionWheel: function(){
		Actions.toggleOption('emotionWheelOverlay');
	},

	renderVideo: function(src){
		var code = [];
		code.push(
			<p>Hello this</p>
		);
		return code;
	},

	render: function() {
		var vHeight = this.props.width/this.props.aspect;
		var margin = (1080-this.props.width)/2;

		var thumbContainerStyle = {display:'flex', maxWidth:'1080px', marginBottom:'20px', marginLeft:margin};
		var thumbStyle = {padding:'10px', backgroundColor:'#dddddd', borderRadius:'5px', userSelect:'none'};

		return (
			<div>
				<div style={thumbContainerStyle}>
					<div style={thumbStyle}>
						<p>Fob overlay:
							<input type='radio' name='foboverlay' checked={this.props.options.fobOverlayType === 'none'} id='noFob' onChange={this.selectFobVis } >None</input>
							<input type='radio' name='foboverlay' checked={this.props.options.fobOverlayType === 'rain'} id='rainFob' onChange={this.selectFobVis } >Rain</input>
							<input type='radio' name='foboverlay' checked={this.props.options.fobOverlayType === 'spots'} id='spotFob' onChange={this.selectFobVis } >Spots</input>
						</p>
						<p>Emotions overlay:
							<input type='checkbox' checked={this.props.options.emotionWheelOverlay} onChange={this.toggleEmotionWheel } >Wheel</input>
							<input type='radio' name='emoSpotoverlay' checked={this.props.options.emotionSpotOverlayType === 'none'} id='noEmoSpots' onChange={this.selectEmoVis } >None</input>
							<input type='radio' name='emoSpotoverlay' checked={this.props.options.emotionSpotOverlayType === 'rain'} id='rainEmoSpot' onChange={this.selectEmoVis } >Rain</input>
							<input type='radio' name='emoSpotoverlay' checked={this.props.options.emotionSpotOverlayType === 'spots'} id='spotEmoSpot' onChange={this.selectEmoVis } >Spots</input>
						</p>
					</div>
				</div>
				<div style={{marginLeft:margin,position:'relative',height:vHeight}}>
					<video
						id={this.props.vidid}
						className='player'
						src={this.props.videoURL}
						controls
						width={this.props.width}
					/>
					<div style={{width:this.props.width, height:vHeight, position:'absolute', x:'0px',y:'0px',pointerEvents:'none'}} >
						<VideoOverlay
							width={this.props.width}
							height={vHeight}
							playPos={this.state.playTime}
							visData={this.props.visData}
							opacity={0.5}
							options={this.props.options}
						/>
					</div>
				</div>
			</div>
    );
  }
});

module.exports = Video;
