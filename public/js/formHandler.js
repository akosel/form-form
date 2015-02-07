var pfx = ["webkit", "moz", "MS", "o", ""];

var app = {
  activeStep: 0,
  steps: [
    {
      title: 'Step One',
      inputs: [
        {
          placeholder: 'Where do you want to go?',
          type: 'text',
          required: true
        }
      ]
    },
    {
      title: 'Step Two',
      inputs: [
        {
          placeholder: 'How much do you want to spend?',
          type: 'number'
        }

      ]
    }
  ]
};

function buildInput($target, inputObj) {
  var attributes = Object.keys(inputObj);
  inputObj.$input = document.createElement('input');
  
  for (var i = 0; i < attributes.length; i += 1) {
    inputObj.$input[attributes[i]] = inputObj[attributes[i]];
  }

  inputObj.$input.addEventListener('keyup', function() {
    inputObj.value = inputObj.$input.value;
  });

  $target.appendChild(inputObj.$input);
}

function buildBox(step, callback) {
  var step = app.steps[step];

  step.$box = document.createElement('article');
  step.$box.className = 'box';
  step.$title = document.createElement('h3');
  step.$title.textContent = step.title;
  step.$box.appendChild(step.$title);
  step.$form = document.createElement('form');
  step.$form.onsubmit = function(e) {
    e.preventDefault();
    return next();
  };
  step.$box.appendChild(step.$form);

  for (var i = 0; i < step.inputs.length; i += 1) {
    buildInput(step.$form, step.inputs[i]);
  }

  app.$container.appendChild(step.$box);

  if (app.$activeBox) {
    app.$activeBox.style.display = 'none';
  }
  app.$activeForm = step.$form;
  app.$activeBox = step.$box;

  if (callback) {
    callback();
  }
}

function init() {
  app.$container = document.querySelector('.container');

  PrefixedEvent(app.$container, 'AnimationEnd', function() {
    var classNameArr = app.$container.className.split('-');
    console.log(classNameArr);
    if (app.$container.className.match('slide-out')) {
      buildBox(app.activeStep, function() {
        classNameArr[1] = 'in';
        app.$container.className = classNameArr.join('-'); 
      });
    }
  }, false);

  window.addEventListener('keyup', function(e) {
    console.log(e);
    if (e.keyCode === 37) {
      previous();
    } else if (e.keyCode === 39) {
      next();
    }
  });

  buildBox(app.activeStep);
}

function next() {
  console.log('next');
  if (app.activeStep === app.steps.length - 1) {
    // TODO send a message or something
    return;
  }
  app.activeStep += 1; 
  app.$container.className = 'slide-out-next';
}

function previous() {
  if (app.activeStep === 0) {
    // TODO send a message or something
    return;
  }
  app.activeStep -= 1;
  app.$container.className = 'slide-out-previous';
}

function PrefixedEvent(element, type, callback) {
  for (var p = 0; p < pfx.length; p++) {
    if (!pfx[p]) type = type.toLowerCase();
    element.addEventListener(pfx[p]+type, callback, false);
  }
}

init();
