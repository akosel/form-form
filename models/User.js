var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: String,
  vacations: [{ ref: 'Vacation', type: mongoose.Schema.ObjectId }]
});

module.exports = mongoose.model('User', userSchema);
