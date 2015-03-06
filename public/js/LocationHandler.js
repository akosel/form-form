var gm = require('googlemaps');
var util = require('util');

module.exports = function() {
  return {
    geocode: function(place, callback) {
      var myPlace = [];
      gm.geocode(place, function(err, data) {

        var address_components = data.results[0].address_components;

        var wanted = ['country', 'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3'];
        var placeObj = {};
        var latlng = data.results[0].geometry.location;
        placeObj.latlng = [latlng.lat, latlng.lng];
        var sample = address_components.filter(function(item, i) {
          var types = address_components[i].types;
          var isWanted = wanted.some(function(w) {
            if (types.indexOf(w) > -1) {
              placeObj[w] = address_components[i];
              return true;  
            }
          });
          if (isWanted) {
            return true;
          }
        });

        if (callback) {
          console.log(placeObj);
          callback(placeObj);
        }
      });
    }
  };
};
