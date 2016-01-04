var mongoose = require('mongoose');

// create table counter
var Counter = new mongoose.Schema({
	_id: String,
	seq: Number
});

module.exports = mongoose.model('Counter', Counter)