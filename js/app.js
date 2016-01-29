import React from 'react';
var Reflux = require('reflux');
var Store = require('./components/store');
var Actions = require('./components/actions');
import SimpleFilmStrip from './components/SimpleFilmStrip.js';
import Video from './components/Video.js';
import SVGgraph from './components/svgGraph.js';

var conf={
	"title": "Title",
	"xOffset": 0,
	"xMax": 0,
    "xMin": 0,
	"yMin": 0,
	"yMax": 8,
	"graphElId": "figure_1",
    "graph": '',
	"timeOffset": 0,
	"graphTimespan": 0,
    "video": null
};

let App = React.createClass({

    propTypes: {
        configURL: React.PropTypes.string.isRequired
    },

    mixins: [Reflux.connect(Store,'options')], //listen to the store

    getInitialState: function(){
		Actions.start();
        return({
            markerPosition: 0,
            frameNumber:0,
            data: {"dial": {"values": [], "times": []}, "fob": {"users":[], "times":[]}},
            config: conf,
            playPos: 0
           })
    },

    componentDidMount: function() {
        // prepare XHR to load data
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
        	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        		var visdata = JSON.parse(xmlhttp.responseText);
                // console.log(visdata);
                this.setState({
                    data: visdata
                  });
        	}
        }.bind(this);

        // load config via XHR
        var xmlhttp2 = new XMLHttpRequest();
        xmlhttp2.onreadystatechange = function() {
        	if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
        		var confdata = JSON.parse(xmlhttp2.responseText);
                console.log('got config data');
                this.setState({
                    config: confdata
                  });
                  console.log("requesting visualisation data " + confdata.data);
                  xmlhttp.open("GET", 'http://localhost:8080/' + confdata.data, true);
                  xmlhttp.send();
        	}
        }.bind(this);
        xmlhttp2.open("GET", 'http://localhost:8080/' + this.props.configURL, true);
        xmlhttp2.send();

      },

    videoPlayPositionCB: function(time){
        var frame = Math.floor(time*(this.state.config.videoFrameRate/this.state.config.thumbRate));
        this.setState({markerPosition: frame+1});
        this.setState({playPos: time}); //*60});

		// console.log("at frame number " + frame);
        // console.log("at thumb number " + frame);
        // plotPosition();
    },

    filmStripMouseMoveCB: function(fNumber){
        this.setState({frameNumber: fNumber});
    },

    filmStripMouseClickCB: function(fNumber){
        this.setState({frameNumber: fNumber});
        // console.log("Click frame " + fNumber);
        var mediaEl = document.getElementById('mediaEl');
        mediaEl.currentTime = fNumber/this.state.config.videoFrameRate;
    },

    graphMouseMoveCB: function(time){
        // time /= 60;
        var frame = time*this.state.config.videoFrameRate;
        frame = Math.floor(frame);
        this.setState({frameNumber: frame});
        // console.log('set scrubber to frame ' + frame);
    },

    graphMouseClickCB: function(time){
        // time /= 60;
        var frame = time*this.state.config.videoFrameRate;
        frame = Math.floor(frame);
        // console.log("graph click at " + time + ", " + frame);
        this.setState({frameNumber: frame});

        var mediaEl = document.getElementById('mediaEl');
        mediaEl.currentTime = time;
        // changing video time will cause click to be reflected
        // in thumbstrip and graph
    },

    toggleFilmStrip: function(){
        Actions.toggleOption('viewFilmStrip');
 		// Actions.toggleFob();
  	},

	render() {

		var thumbs  = [];
		for (var i = 0; i < this.state.config.numThumbs; i++){// }=this.props.thumbRate){
			var num = i;
			/*if (num < 10){ num = "00" + i;}
			else if(num < 100){ num = "0" + i;}
			thumbs.push("media/thumbs/img" + num + ".jpg");*/
			if (num < 10){ num = "000" + i;}
			else if(num < 100){ num = "00" + i;}
			else if(num < 1000){ num = "0" + i;}
			thumbs.push(this.state.config.thumbnails + "img" + num + ".jpg");
		}

    return (
        <div>
          <div className='container'>
              <div id='content'>
                  <h2 id='title' className='center'>{this.state.config.title}</h2>
                  <div id='explanation'>{this.state.config.explanation}</div>
                  <div>
                  <Video
                          position={this.state.frameNumber}
						  frameRate={this.state.config.videoFrameRate}
                          playPositionCB={this.videoPlayPositionCB}
                          vidid={'mediaEl'}
                          videoURL={this.state.config.video}
                          setTime={this.state.playPos}
                          visData={this.state.data}
						  aspect={this.state.config.aspect}
						  width={800}
						  options={this.state.options}
                      />
                    <SVGgraph
                        url={this.state.config.graph}
                        className='graph'
                        config={this.state.config}
                        marker={this.state.playPos}
                        cursor={this.state.frameNumber/this.state.config.videoFrameRate}
                        onMouseClickCB={this.graphMouseClickCB}
                        onMouseMoveCB={this.graphMouseMoveCB}
                    />
                  </div>
                  <div>
                  </div>
                  <p>
      				<input type='checkbox' checked={this.state.options.viewFilmStrip} onChange={this.toggleFilmStrip} /><label>View scrubber</label>
                </p>
                  <div>
                      <SimpleFilmStrip
                          options={this.state.options}
                          frames={thumbs}
                          from={1}
                          scrubFrame={Math.floor(this.state.frameNumber/this.state.config.thumbRate)}
                          to={thumbs.length}
                          framerate={this.state.config.videoFrameRate}
                          thumbWidth={this.state.options.frameSize}
                          thumbAspect={(16 / 9)}
                          thumbRate={this.state.config.thumbRate}
                          videoPlayingFrameNo={this.state.markerPosition}
                          onMouseClickCB={this.filmStripMouseClickCB}
                          onMouseMoveCB={this.filmStripMouseMoveCB}
                          visData={this.state.data}
                      />
                  </div>
              </div>
          </div>
        </div>

    );
  }

});


React.render(
    <App
        configURL={'media/verb.json'}
    />,
    document.body);
