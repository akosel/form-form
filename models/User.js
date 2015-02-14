var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: String
});

module.exports = mongoose.model('User', userSchema);
