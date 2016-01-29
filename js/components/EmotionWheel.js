var React = require('react');
var EmotionWheel = React.createClass({

	// converts polar coordinates to cartesian ones
	polarToCartesian: function(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = angleInDegrees * Math.PI / 180.0;
		var x = centerX + radius * Math.cos(angleInRadians);
		var y = centerY + radius * Math.sin(angleInRadians);
		return [x,y];
	},

	// generates an svg cake slice
	// assumes 20 slices per cake - index defines which (0 at 12 o'clock)
	generateArc: function(centerX, centerY, radius, index, style){
		var startArc = index*(360/20)-90;
		var endArc = (index+1)*(360/20)-90;
		var st = this.polarToCartesian(centerX, centerY, radius, startArc);
		var en = this.polarToCartesian(centerX, centerY, radius, endArc);
		var d = [
			"M", centerX, centerY, "L", st[0], st[1], "A", radius, radius, 0, 0, 1, en[0], en[1], "Z"// , en[0], en[1], centerX, centerY
		].join(" ");

		return <path key={this.props.id+'-arc-'+index} d={d} style={style}/>;
	},

	// generate some svg that displays the emotion data for this segment
 	generateEmotionSVG: function(data, thumbH, thumbW, scale){

 		var scale = this.props.scale;

 		var labels = ['shock', 'interest', 'amusement', 'pride', 'joy', 'contentment', 'love', 'admiration', 'relief', 'compassion', 'sadness', 'guilt', 'regret', 'disappointment', 'confusion', 'fear', 'disgust', 'contempt', 'hate', 'anger'];
		var colours = ['#fd7047', '#f78707', '#fbcc00', '#faf207', '#8bf35b', '#07f728', '#4eda71', '#1f7a36', '#0da057', '#19bca7', '#2eabe7', '#2e60e7', '#4e2ee7', '#3019a0', '#510180', '#800173', '#ce29bd', '#eb0976', '#ed3546', '#ff0000'];

 		// an array of cake slices centered on middle-L of area
 		var svg=[];
 		for(var i = 0; i < labels.length; i++){
 			var emoSty = {visibility:'visible', stroke:'white', strokeWidth:1,fill:colours[i],pointerEvents:'none'};
 			var h = this.props.data[labels[i]]*scale;
 			svg.push(this.generateArc(this.props.xpos, this.props.ypos, h, i, emoSty)); //<rect x={5*i} y={0} width={5} height={h} style={emoSty} />);
 		}

 		return svg;
 	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// React functionality

	render: function() {
		return <g style={{opacity:this.props.opacity}}>
			{ this.generateEmotionSVG() }
		</g>;
	}
});

module.exports = EmotionWheel;
