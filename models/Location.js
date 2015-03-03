var mongoose = require('mongoose');

var locationSchema = new mongoose.Schema({
  country: String,
  administrative_area_level_1: String,
  administrative_area_level_2: String,
  administrative_area_level_3: String,
  latlng: Array 
});

module.exports = mongoose.model('Location', locationSchema);
