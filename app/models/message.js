var mongoose = require('mongoose');

// create table message
var Message = new mongoose.Schema({
	_id: Number,
	user_id: Number,
	content: String,
	create_at: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Message', Message)