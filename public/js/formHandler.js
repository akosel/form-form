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
    this.options.$main      = document.createElement('main');
    this.options.$container = document.createElement('section');
    this.options.$body      = document.querySelector('body');
    this.options.$bar       = document.querySelector('.progress-bar');
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

      // kind of a catch all to avoid double submissions or other weird stuff
      if (self.submitted) {
        return;
      }

      if (e.keyCode === 37) {
        self.previous();
      } else if (e.keyCode === 39) {
        self.next();
      }
    });

    document.addEventListener('touchstart', handleTouchStart, false);        
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;                                                        
    var yDown = null;                                                        

    function handleTouchStart(evt) {                                         
      xDown = evt.touches[0].clientX;                                      
      yDown = evt.touches[0].clientY;                                      
    }                                                

    function handleTouchMove(evt) {
      if ( ! xDown || ! yDown ) {
        return;
      }

      var xUp = evt.touches[0].clientX;                                    
      var yUp = evt.touches[0].clientY;

      var xDiff = xDown - xUp;
      var yDiff = yDown - yUp;

      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
          /* left swipe */ 
          self.next();
        } else {
          /* right swipe */
          self.previous();
        }                       
      } else {
        if ( yDiff > 0 ) {
          /* up swipe */ 
        } else { 
          /* down swipe */
        }                                                                 
      }
      /* reset values */
      xDown = null;
      yDown = null;                                             
    }

    this.buildBox(self.options.activeStep);
  },

  // set up a progress bar
  updateProgressBar: function() {
    var denom = this.options.steps.length,
        num   = this.options.activeStep + 1;

    this.options.$bar.style.width = (num / denom) * 100 + '%';
  },

  buildInput: function($target, inputObj) {
    var attributes = Object.keys(inputObj.attributes);
    inputObj.$input = document.createElement('input');
    
    for (var i = 0; i < attributes.length; i += 1) {
      if (attributes[i] === 'places') {
        var autocomplete = new google.maps.places.Autocomplete(inputObj.$input, { types: ['geocode'] });
      } else if (attributes[i].match('fn')) {
        continue; 
      } else {
        inputObj.$input[attributes[i]] = inputObj.attributes[attributes[i]];
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

  buildSelect: function($target, selectObj) {
    var attributes = Object.keys(selectObj.attributes);

    selectObj.$select = document.createElement('select'); 
    selectObj.$select.className = 'custom-dropdown__select custom-dropdown__select--white';

    // to override browser dropdown style
    var $span = document.createElement('span');
    $span.className = 'custom-dropdown custom-dropdown--white';
    $span.appendChild(selectObj.$select);

    for (var i = 0; i < attributes.length; i += 1) {
      selectObj.$select[attributes[i]] = selectObj.attributes[attributes[i]];
    }
    selectObj.$select.addEventListener('onchange', function() {
      selectObj.value = inputObj.$select.value;
    });

    var $newOpt;
    for (i = 0; i < selectObj.options.length; i += 1) {
      $newOpt = document.createElement('option');
      $newOpt.textContent = selectObj.options[i];
      selectObj.$select.appendChild($newOpt);
    }

    $target.appendChild($span);
  },

  buildData: function($target) {
    $target = $target || this.options.$activeNotificationsPanel;
    var formData = this.getFormData();
    formData.reverse();
    $target.innerHTML = null;

    while (formData.length) {
      var $data = document.createElement('p');
      $data.textContent = formData.pop();
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
      if (step.showData) {
        this.buildData(step.$notificationsPanel);
      }
      this.options.$activeNotificationsPanel = step.$notificationsPanel;
      this.options.$body.style.backgroundColor = step.bgColor;
      this.updateProgressBar();
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

    if (step.description) {
      // set up the description text 
      step.$description = document.createElement('p');
      step.$description.textContent = step.description;
      step.$box.appendChild(step.$description);
    }

    // build the form, if any inputs are configured 
    if (step.formElements) {
      // set up the form
      step.$form = document.createElement('form');
      step.$box.appendChild(step.$form);

      // set up custom validation events
      step.$form.addEventListener('keyup', function() {
        // if there was a timeout event, clear it to allow for continued feedback
        if (step.keyTimeout) {
          clearInterval(step.keyTimeout);
        }

        // kind of a catch all to avoid double submissions or other weird stuff
        if (self.submitted) {
          return;
        }
        
        // if valid, wait 500ms, then enable and change text. otherwise, disable.
        if(step.$form.checkValidity()) {
          step.keyTimeout = setTimeout(function() {
            step.$formSubmit.textContent = step.validButtonText;
            step.$formSubmit.disabled = false;
          }, 250);
        } else {
          step.$formSubmit.textContent = 'PLEASE FILL IN THE FORM';
          step.$formSubmit.disabled = true;
        }
      });

      // allow normal submitting, but block if form is invalid
      step.$form.onsubmit = function(e) {
        e.preventDefault();
        if (self.submitted) {
          return;
        }
        if (step.$form.querySelector('input').validity) {
          return self.next();
        }
      };

      // create the actual input elements
      for (var i = 0; i < step.formElements.length; i += 1) {
        if (step.formElements[i].tagName === 'select') {
          this.buildSelect(step.$form, step.formElements[i]);
        } else {
          this.buildInput(step.$form, step.formElements[i]);
        }
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
  next: function() {
    if (this.options.$activeForm && !this.options.$activeForm.checkValidity()) {
      this.sendNotification('Whoops, looks like you still need to fill in a field!');
      return;
    } else if (this.options.processing) {
      return;
    } else if (this.options.activeStep === this.options.steps.length - 1) {
      this.submitted = true;
      this.post('/vacations', this.getPostData('vacation'), function(xhr) { var data = JSON.parse(xhr.responseText); window.location = data.redirect; });
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
    var formData = [];
    this.options.steps.forEach(function(step) {
      if (step.formElements && step.formElements.length) {
        step.formElements.forEach(function(input) {
          if (input.fn_print) {
            formData.push(input.fn_print());
          }
        });
      }
    });
    return formData;
  },

  // get data specifically for updating the db
  getPostData: function(model) {
    var formData = {};
    this.options.steps.forEach(function(step) {
      if (step.formElements && step.formElements.length) {
        step.formElements.forEach(function(input) {
          if (input.modelName === model) {
            formData[input.attributes.name] = input.fn_dbFormat();
          }
        });
      }
    });
    return formData;
  },

  // post some json to a given url. this really doesn't belong in the form handler XXX 
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
  }

});

})(window);

// TODO put these utility functions in a separate place
var pfx = ["webkit", "moz", "MS", "o", ""];
function PrefixedEvent(element, type, callback, useCapture) {
  useCapture = useCapture || false;
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
