var gm = require('googlemaps');
var util = require('util');

var getComponents = function(place) {
  return function() {
    var myPlace = [];
    gm.geocode(place, function(err, data){
        console.log('loaded');

        var address_components = data.results[0].address_components;

        for (var i = 0; i < address_components.length; i += 1) {
          if (address_components[i].types.indexOf('country') > -1 || address_components[i].types.indexOf('administrative_area_level_1') > -1) {
            console.log(address_components[i]);
            myPlace.push(address_components[i]);
          }
        }
    console.log('my place', myPlace);
    return myPlace;
    });
  }
};

module.exports = getComponents;
