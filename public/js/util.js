// yeah, it's on the window. what are you going to do about it?
(function(window) {

  window.util = {
    pfx: ["webkit", "moz", "MS", "o", ""],

    /**
     *  Merge defaults with user options
     *  @private
     *  @param {Object} defaults Default settings
     *  @param {Object} options User options
     *  @returns {Object} Merged values of defaults and options
     */
    extend: function( defaults, options ) {
      var extended = {};
      var prop;
      for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
          extended[prop] = defaults[prop];
        }
      }
      for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
          extended[prop] = options[prop];
        }
      }
      return extended;
    },

    get: function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = function() {
        if (xhr.status === 200 && xhr.readyState === 4) {
          console.log('xhr: ', xhr);
          if (callback) {
            callback(xhr);
          }
        }
      };
      xhr.send();
    },

    post: function(url, json, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
      xhr.onreadystatechange = function() {
        if (xhr.status === 200 && xhr.readyState === 4) {
          console.log('xhr: ', xhr);
          if (callback) {
            callback(xhr);
          }
        }
      };
      xhr.send(JSON.stringify(json));
    },

    PrefixedEvent: function(element, type, callback, useCapture) {
      useCapture = useCapture || false;
      for (var p = 0; p < this.pfx.length; p++) {
        if (!this.pfx[p]) type = type.toLowerCase();
        element.addEventListener(this.pfx[p]+type, callback, useCapture);
      }
    },


  };

  window.api = {

    // XXX more questionable content
    getLocations: function() {
      util.get('/vacations', function(xhr) {
        var json = JSON.parse(xhr.responseText);
        var locations = json.map(function(l) { return l.location; });
      });
    }

  };

})(window);
