var Reflux = require('reflux');

// Actions supported by the store

var Actions = Reflux.createActions([
	"toggleOption",
	"setOption",
	"start",
	"setPlayFrameNumber",
	"setCursorPos"
]);

module.exports = Actions;
