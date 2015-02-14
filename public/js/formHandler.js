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

    // set listener for animation starts across the page. 
    PrefixedEvent(self.options.$container, 'AnimationStart', function(e) {
      console.log('PROCESSING: ', e);
      self.options.processing = true;
    });

    // catch all animation events. special case for the container. a little messy.
    PrefixedEvent(self.options.$container, 'AnimationEnd', function(e) {
      var classNameArr = self.options.$container.className.split('-');
      if (self.options.$container.className.match('slide-out')) {
        self.buildBox(self.options.activeStep, function() {
          classNameArr[1] = 'in';
          self.options.$container.className = classNameArr.join('-'); 
        });
      }

      console.log('PROCESSING END: ', e);
      self.options.processing = false;
    }, false);

    // allow left and right navigation
    window.addEventListener('keyup', function(e) {
      e.stopPropagation();

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
    $target = $target || this.options.$activeNotificationsPanel;
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

  // XXX this needs work
  flashArrows: function() {
    var rClasses = document.querySelector('.right.arrow').className;
    var lClasses = document.querySelector('.left.arrow').className;

    document.querySelector('.right.arrow').className += ' fade-in-and-out';
    document.querySelector('.left.arrow').className += ' fade-in-and-out';
    setTimeout(function() {
      document.querySelector('.right.arrow').className = rClasses;
      document.querySelector('.left.arrow').className = lClasses;
    }, 5000);
  },

  // updates state for the form-form
  changeBox: function(step) {
      if (this.options.$activeBox) {
        this.options.$activeBox.style.display = 'none';
      }
      this.options.$activeBox = step.$box;
      this.options.$activeBox.style.display = 'block';
      this.options.$activeForm = step.$form;
      if (this.options.$activeForm) {
        this.options.$activeForm.querySelector('input').focus();
      }
      this.options.$activeNotificationsPanel = step.$notificationsPanel;
      if (step.showData) {
        this.buildData(step.$notificationsPanel);
      }
      this.options.$body.style.backgroundColor = step.bgColor || '#F60';
  },

  // builds a box, or changes to a previously created box, if it exists 
  buildBox: function(step, callback) {
    var self = this;
    step = this.options.steps[step];

    // if the box exists, change it and perform the callback
    if (step.$box) {
      this.changeBox(step);
      if (callback) {
        callback();
      }
      return;
    }

    // set up the box that will contain everything
    step.$box = document.createElement('article');
    step.$box.className = 'box';

    // set up the header text
    step.$title = document.createElement('h3');
    step.$title.textContent = step.title;
    step.$box.appendChild(step.$title);

    // set up the description text 
    step.$description = document.createElement('p');
    step.$description.textContent = step.description;
    step.$box.appendChild(step.$description);

    // build the form, if any inputs are configured 
    if (step.inputs) {
      // set up the form
      step.$form = document.createElement('form');
      step.$box.appendChild(step.$form);

      // set up custom validation events
      step.$form.addEventListener('keyup', function() {
        // if there was a timeout event, clear it to allow for continued feedback
        if (step.keyTimeout) {
          clearInterval(step.keyTimeout);
        }
        
        // if valid, wait 500ms, then enable and change text. otherwise, disable.
        if(step.$form.checkValidity()) {
          step.keyTimeout = setTimeout(function() {
            step.$formSubmit.textContent = 'NEXT';
            step.$formSubmit.disabled = false;
          }, 500);
        } else {
          step.$formSubmit.textContent = 'PLEASE FILL IN THE FORM';
          step.$formSubmit.disabled = true;
        }
      });

      // allow normal submitting, but block if form is invalid
      step.$form.onsubmit = function(e) {
        e.preventDefault();
        if (step.$form.querySelector('input').validity) {
          return self.next();
        }
      };

      // create the actual input elements
      for (var i = 0; i < step.inputs.length; i += 1) {
        this.buildInput(step.$form, step.inputs[i]);
      }
      
      // set up form submit button
      step.$formSubmit = document.createElement('button');
      step.$form.appendChild(step.$formSubmit);
      step.$formSubmit.textContent = 'PLEASE FILL IN THE FORM';
      step.$formSubmit.disabled = true;
    }

    // set up notifications panel
    step.$notificationsPanel = document.createElement('div');
    step.$notificationsPanel.className = 'notifications';
    step.$box.appendChild(step.$notificationsPanel);

    // add listener for animations on the notifications panel
    PrefixedEvent(step.$notificationsPanel, 'AnimationEnd', function(e) {
      self.clearNotification();
    }, true);

    // finally, append the box with everything into the main container
    this.options.$container.appendChild(step.$box);

    // call change box to sync active elements
    this.changeBox(step);
    if (callback) {
      callback();
    }
  },

  // send a temporary notification
  sendNotification: function(msg) {
    var $msg = document.createElement('p');
    $msg.textContent = msg;
    $msg.className = 'fade-in-and-out';

    this.options.$activeNotificationsPanel.appendChild($msg);
  },

  // remove notifications
  clearNotification: function() {
    this.options.$activeNotificationsPanel.querySelector('.fade-in-and-out').remove();
  },

  // move to the next step
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

  // go back a step
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

  // set up an object for easy printing of all the data
  getFormData: function() {
    var formData = {};
    this.options.steps.forEach(function(step) {
      if (step.inputs && step.inputs.length) {
        step.inputs.forEach(function(input) {
          if (input.value && input.placeholder) {
            formData[input.placeholder] = input.fn_print();
          }
        });
      }
    });
    return formData;
  },

  // get data specifically for updating the db
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

  // post some json to a given url. this really doesn't belong in the form handler XXX 
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
  useCapture = useCapture || false;
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
}
