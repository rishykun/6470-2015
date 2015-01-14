var mongoose = require('mongoose');

module.exports = mongoose.model ('User', {
	username: String,
	passport: String,
	email: String,
	gender: String,
	address: String
});