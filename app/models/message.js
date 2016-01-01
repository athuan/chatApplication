var mongoose = require('mongoose');

// create table message
var Message = new mongoose.Schema({
	user_id: String,
	content: String,
	create_at: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Message', Message)