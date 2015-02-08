// yeah, it's on the window. what are you going to do about it?
(function(window) {

window.FormHandler = function(args) {
  this.defaults = {
    activeStep: 0,
    steps: [{
      title: 'You need to add the steps, dummy!',
      bgColor: '#BADA55' 
    }] 
  };
  this.options = extend(this.defaults, args);

  this.init();
};

FormHandler.prototype = extend(FormHandler.prototype, {
  init: function() {
    var self = this;
    this.options.$body = document.querySelector('body');
    this.options.$container = document.querySelector('.container');

    PrefixedEvent(self.options.$container, 'AnimationStart', function(e) {
      console.log(e);
      self.options.processing = true;
    });
    PrefixedEvent(self.options.$container, 'AnimationEnd', function() {
      var classNameArr = self.options.$container.className.split('-');
      if (self.options.$container.className.match('slide-out')) {
        self.buildBox(self.options.activeStep, function() {
          classNameArr[1] = 'in';
          self.options.$container.className = classNameArr.join('-'); 
        });
      }
      console.log('done');

      self.options.processing = false;
    }, false);

    window.addEventListener('keyup', function(e) {
      if (e.keyCode === 37) {
        self.previous();
      } else if (e.keyCode === 39) {
        self.next();
      }
    });

    this.buildBox(self.options.activeStep);
  },

  buildInput: function($target, inputObj) {
    var attributes = Object.keys(inputObj);
    inputObj.$input = document.createElement('input');
    
    for (var i = 0; i < attributes.length; i += 1) {
      inputObj.$input[attributes[i]] = inputObj[attributes[i]];
    }

    inputObj.$input.addEventListener('keyup', function() {
      inputObj.value = inputObj.$input.value;
    });

    $target.appendChild(inputObj.$input);
  },

  // XXX break this up
  buildBox: function(step, callback) {
    var self = this;
    var step = this.options.steps[step];

    if (step.$box) {
      this.options.$activeBox.style.display = 'none';
      this.options.$activeBox = step.$box;
      this.options.$activeBox.style.display = 'block';
      this.options.$activeNotificationsPanel = step.$notificationsPanel;
      this.options.$body.style.backgroundColor = step.bgColor || '#F60';
      if (callback) {
        callback();
      }
      return;
    }

    step.$title = document.createElement('h3');
    step.$title.textContent = step.title;

    step.$box = document.createElement('article');
    step.$box.className = 'box';
    step.$box.appendChild(step.$title);

    if (step.inputs) {
      step.$form = document.createElement('form');
      step.$form.onsubmit = function(e) {
        e.preventDefault();
        return this.next();
      };
      step.$box.appendChild(step.$form);

      for (var i = 0; i < step.inputs.length; i += 1) {
        this.buildInput(step.$form, step.inputs[i]);
      }
      this.options.$activeForm = step.$form;
    } else {
      this.options.$activeForm = null;
    }

    step.$notificationsPanel = document.createElement('p');
    step.$notificationsPanel.className = 'notifications';
    PrefixedEvent(step.$notificationsPanel, 'AnimationEnd', function(e) {
      self.clearNotification();
    }, true);
    step.$box.appendChild(step.$notificationsPanel);

    this.options.$body.style.backgroundColor = step.bgColor || '#F60';
    this.options.$container.appendChild(step.$box);

    if (this.options.$activeBox) {
      this.options.$activeBox.style.display = 'none';
    }
    this.options.$activeBox = step.$box;
    this.options.$activeNotificationsPanel = step.$notificationsPanel;

    if (callback) {
      callback();
    }
  },

  sendNotification: function(msg) {
    var self = this;
    this.options.$activeNotificationsPanel.className = 'fade-in-and-out';
    this.options.$activeNotificationsPanel.textContent = msg; 
  },

  clearNotification: function() {
    this.options.$activeNotificationsPanel.className = null;
    this.options.$activeNotificationsPanel.textContent = null; 
  },

  next: function(){
    if (this.options.activeStep === this.options.steps.length - 1) {
      this.sendNotification('This is the last step.');
      return;
    } else if (this.options.processing) {
      return;
    }
    this.options.activeStep += 1; 
    this.options.$container.className = 'slide-out-next';
  },

  previous: function() {
    if (this.options.activeStep === 0) {
      this.sendNotification('You can\'t go back any further.');
      return;
    } else if (this.options.processing) {
      return;
    }
    this.options.activeStep -= 1;
    this.options.$container.className = 'slide-out-previous';
  }

});

})(window);



// TODO put these utility functions in a separate place
var pfx = ["webkit", "moz", "MS", "o", ""];
function PrefixedEvent(element, type, callback, useCapture) {
  var useCapture = useCapture || false;
  console.log(element, useCapture);
  for (var p = 0; p < pfx.length; p++) {
    if (!pfx[p]) type = type.toLowerCase();
    element.addEventListener(pfx[p]+type, callback, useCapture);
  }
}
/**
 *  Merge defaults with user options
 *  @private
 *  @param {Object} defaults Default settings
 *  @param {Object} options User options
 *  @returns {Object} Merged values of defaults and options
 */
function extend( defaults, options ) {
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
};
