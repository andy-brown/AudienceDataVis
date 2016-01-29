var Reflux = require('reflux');
var Actions = require('./actions');
var Option = require('./option.js');

var Store = Reflux.createStore({

	//listenables defines the actions the store can respond to
	listenables: [Actions],

	//options is our list of stuff that the store will manage, and the React app will render
	getInitialState: function(){
		this.options = {
			'viewEmotions': true,
			'viewFilmStrip': true,
			'viewFob': true,
			'fobOpacity': 4,
			'frameSize': 100,
			'scrubberEmoScale': 8,
			'scrubberFobScale': 4,
			'fobOverlayType': 'rain',
			'emotionWheelOverlay': true,
			'emotionSpotOverlayType': 'none',
			'wheelLifespan': 60,
		};
		this.mediaPlayPos = 0;
		this.cursorPos = 0;
		return {options: this.options, mediaPlayPos: this.mediaPlayPos, cursorPos: this.cursorPos};
	},

	onSetCursorPos: function(p){
		this.cursorPos = p;
		this.update();
	},

	onSetPlayFrameNumber: function(p){
		this.mediaPlayPos = p;
		console.log("frame " + p);
		this.update();
	},

	onStart: function(){
		this.trigger(this.options);
	},

	onToggleOption: function(e){
		console.log('toggling ' + e);
		if(this.options[e] != null){
			this.options[e] = !this.options[e];
			this.trigger(this.options);
		}
	},

	onSetOption: function(e){
		console.log('setting ' + e.opt + ' to ' + e.val);
		if(this.options[e.opt] != null){
			this.options[e.opt] = e.val;
			this.trigger(this.options);
		}
	},

	update: function(){
		console.log(this.options);
		this.trigger({
			options: this.options,
			mediaPlayPos: this.mediaPlayPos,
			cursorPos: this.cursorPos
		});
	}

});

module.exports = Store;
