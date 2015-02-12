// yeah, it's on the window. what are you going to do about it?
(function(window) {

window.FormHandler = function(args) {
  this.defaults = {
    activeStep: 0,
    steps: [{
      title: 'You should initialize this with some steps'
    }] 
  };
  this.options = extend(this.defaults, args);

  this.init();
};

FormHandler.prototype = extend(FormHandler.prototype, {
  init: function() {
    var self = this;
    this.options.$main = document.createElement('main');
    this.options.$container = document.createElement('section');
    this.options.$body = document.querySelector('body');
    this.options.$main.appendChild(this.options.$container);
    this.options.$body.appendChild(this.options.$main);

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
      if (attributes[i] === 'places') {
        var autocomplete = new google.maps.places.Autocomplete(inputObj.$input, { types: ['geocode'] });
      } else if (attributes[i].match('fn')) {
        continue; 
      } else {
        inputObj.$input[attributes[i]] = inputObj[attributes[i]];
      }
    }

    inputObj.$input.addEventListener('keyup', function() {
      inputObj.value = inputObj.$input.value;
    });
    inputObj.$input.addEventListener('focusout', function() {
      inputObj.value = inputObj.$input.value;
    });

    $target.appendChild(inputObj.$input);
  },

  buildData: function($target) {
    var $target = $target || this.options.$activeNotificationsPanel;
    var formData = this.getFormData();
    var dataObjKeys = Object.keys(this.getFormData()).reverse();
    $target.innerHTML = null;

    while (dataObjKeys.length) {
      var $data = document.createElement('p');
      var key = dataObjKeys.pop();
      $data.textContent = [key, formData[key]].join(' ');
      $target.appendChild($data);
    }
  },

  changeBox: function(step) {
      if (this.options.$activeBox) {
        this.options.$activeBox.style.display = 'none';
      }
      this.options.$activeBox = step.$box;
      this.options.$activeBox.style.display = 'block';
      this.options.$activeForm = step.$form;
      this.options.$activeNotificationsPanel = step.$notificationsPanel;
      if (step.showData) {
        this.buildData(step.$notificationsPanel);
      }
      this.options.$body.style.backgroundColor = step.bgColor || '#F60';
  },

  buildBox: function(step, callback) {
    var self = this;
    var step = this.options.steps[step];

    if (step.$box) {
      this.changeBox(step);
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
      step.$form.addEventListener('keyup', function() {
        if(step.$form.checkValidity()) {
          setTimeout(function() {
            step.$formSubmit.textContent = 'NEXT';
            step.$formSubmit.disabled = false;
          }, 1000);
        } else {
          step.$formSubmit.textContent = 'PLEASE FILL IN THE FORM';
          step.$formSubmit.disabled = true;
        }
      });
      step.$form.onsubmit = function(e) {
        e.preventDefault();
        if (step.$form.querySelector('input').validity) {
          return self.next();
        }
      };
      step.$box.appendChild(step.$form);

      for (var i = 0; i < step.inputs.length; i += 1) {
        this.buildInput(step.$form, step.inputs[i]);
      }
      step.$formSubmit = document.createElement('button');
      step.$formSubmit.textContent = 'PLEASE FILL IN THE FORM';
      step.$formSubmit.disabled = true;
      step.$form.appendChild(step.$formSubmit);
    }

    step.$notificationsPanel = document.createElement('div');
    step.$notificationsPanel.className = 'notifications';
    PrefixedEvent(step.$notificationsPanel, 'AnimationEnd', function(e) {
      self.clearNotification();
    }, true);
    step.$box.appendChild(step.$notificationsPanel);

    this.options.$container.appendChild(step.$box);

    this.changeBox(step);
    if (callback) {
      callback();
    }
  },

  sendNotification: function(msg) {
    var $msg = document.createElement('p');
    $msg.textContent = msg;
    $msg.className = 'fade-in-and-out';

    this.options.$activeNotificationsPanel.appendChild($msg);
  },

  clearNotification: function() {
    this.options.$activeNotificationsPanel.querySelector('.fade-in-and-out').remove();
  },

  next: function(){
    if (this.options.activeStep === this.options.steps.length - 1) {
      this.sendNotification('You may go no further.');
      this.post('/vacations', JSON.stringify(this.getPostData()));
      return;
    } else if (this.options.processing) {
      return;
    } else if (this.options.$activeForm && !this.options.$activeForm.checkValidity()) {
      this.sendNotification('Whoops, looks like you still need to fill in a field!');
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
  },

  getFormData: function() {
    var formData = {};
    this.options.steps.forEach(function(step) {
      if (step.inputs && step.inputs.length) {
        step.inputs.forEach(function(input) {
          formData[input.placeholder] = input.fn_print();
        });
      }
    });
    return formData;
  },

  getPostData: function() {
    var formData = {};
    this.options.steps.forEach(function(step) {
      if (step.inputs && step.inputs.length) {
        step.inputs.forEach(function(input) {
          formData[input.name] = input.fn_dbFormat();
        });
      }
    });
    return formData;
  },

  post: function(url, json) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xhr.send(json);
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
