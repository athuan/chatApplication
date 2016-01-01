var mongoose = require('mongoose');

// create table message
var Online = new mongoose.Schema({
	username: String,
	isOnline: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model('Online', Online)