var React = require('react');

var SpotOverlay = React.createClass({

	propTypes: {
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		data: React.PropTypes.object.isRequired,  // parallel arrays of times and colours
		playPos: React.PropTypes.number.isRequired,
		opacity: React.PropTypes.number.isRequired,
		diameter: React.PropTypes.number.isRequired,
		lifetime: React.PropTypes.number.isRequired
	},

	getInitialState: function(){
		return({
			spotPositions: {}
		})
	},

	// a spot that stays in a random position, gently getting bigger and more opaque
	getSpotPositionOpacity: function(i, delta){
		// get position
		var x = 0, y=0;
		if(this.state.spotPositions[i] != null){
			x = this.state.spotPositions[i].x;
			y = this.state.spotPositions[i].y;
			if(y > this.props.height)
				y = this.props.height
		}
		else{
			x = 20 + (Math.random() * (this.props.width - 40));
			y = 20 + (Math.random() * (this.props.height - 40));
			this.state.spotPositions[i] = {'x': x, 'y': y};
		}

		// get size and fade
		var diameter = this.props.diameter+this.props.diameter*delta;
		var opacity = this.props.opacity*((this.props.lifetime-delta)/this.props.lifetime);

		return {'x': x, 'y': y, 'o': opacity, 'r': diameter};
	},

	// a spot that falls from a random distance along the top, to the bottom
	// then gently gets bigger and fades out
	getRainPositionOpacity: function(i, delta){
		// get position
		var x = 0, y=0;
		if(this.state.spotPositions[i] != null){
			x = this.state.spotPositions[i].x;
			y = this.state.spotPositions[i].y + (2*delta/this.props.lifetime)*this.props.height;
			if(y > this.props.height)
				y = this.props.height
		}
		else{
			x = 20 + (Math.random() * (this.props.width - 40));
			y = 0;
			this.state.spotPositions[i] = {'x': x, 'y': y};
		}

		// get size and fade
		var diameter = this.props.diameter;
		var opacity = this.props.opacity
		if(delta>this.props.lifetime/2){
			var lifetime = this.props.lifetime/2;
			delta = delta-lifetime;
			opacity = opacity*(lifetime-delta)/lifetime;
			diameter = diameter+diameter*delta;
		}
		return {'x': x, 'y': y, 'o': opacity, 'r': diameter};


	},

	createSpotSVG: function(){

		var data = this.props.data;
		var times = data.times;
		var colors = data.colors;

		var spots = [];
		for (var i = 0; i < times.length; i++){
			var delta = this.props.playPos - times[i];//60;

			if(delta > 0  && delta < this.props.lifetime){
				// get position
				var pos = {'x': -10, 'y': -10, 'o': 0, 'r': 0};
				if(this.props.type === 'rain'){
					pos = this.getRainPositionOpacity(i, delta);
				}
				else if (this.props.type === 'spots'){
					pos = this.getSpotPositionOpacity(i, delta);
				}

				// create svg circle
				spots.push(
					<circle
						key={'fobspot'+i}
						cx={pos.x}
						cy={pos.y}
						r={pos.r}
						fill={colors[i]}
						fillOpacity={pos.o}
						stroke={'white'}
						strokeOpacity={pos.o}
						pointerEvents={'none'}
						/>
				);
			}
		}
		return spots;
	},


	render: function() {
		return ( <g>{ this.createSpotSVG() }</g>

		);
	}
});

module.exports = SpotOverlay;
