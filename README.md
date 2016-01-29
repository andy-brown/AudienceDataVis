# Visualisation tools

## Introduction

This is some basic code hacked together to test some ideas for visualising audience engagement data.  The demo has some data for emotions and love/apathy button presses over the course of an hour and displays an SVG graph of the button presses.  There is a video element to play the content, which can have overlays of the button presses and/or the emotion data.  There is also a set of thumbnails that can be used to navigate/overview the main video.

This implementation does not include the content - a video/audio file is expected in media/TheVerb/video.mp4.

It is based on React

## Installation
````
> npm install
````

## Running
````
> npm start
````
Then visit http://localhost:8080/

## Organisation

The main code is in js/app.js - this points to a config file, currently media/verb.js.  The config file defines the location of the media (video/audio file), the graph, the engagement data, plus a few parameters (such as ID of the graph element in the SVG, and the position of its boundaries, so the position markers can be overlaid in the correct place).

## Before running
You will need to:
* add a video file.  If it's not named video.mp4 and in media/TheVerb/, edit the "video" line in media/verb.json.  To match the sample data, it should be (approx) 56 minutes long.
* Add some thumbnails for the video file - it expects 1 per second, but you can change this in the code.  These go in media/thumbs/.
