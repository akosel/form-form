## Live Demo

http://calm-dusk-1024.herokuapp.com/form

## What is this?
Pretty vanilla JS forms library I have been working on. I have built this in the context of a fake web application where you fill in some travel data, just because that requires a few types of inputs. The idea was to make generating forms easier for the developer and filling out forms easier on the user. 

## How do I use it?
The meat of form-form is in `public/js/formHandler.js`. You can initialize form-form like so:

    var formSteps = [{
          title: 'Location. Location. Location.',
          description: 'Where do you want to go?',
          //bgColor: '#e67e22',
          validButtonText: 'NEXT: COSTS',
          formElements: [
            {
              tagName: 'input',
              modelName: 'vacation',
              attributes: {
                placeholder: 'e.g. Timbuktu or Thailand',
                type: 'text',
                name: 'location',
                required: true,
                places: true,
                autofocus: true
              },
              fn_print: function() {
                return 'Location: ' + this.attributes.value;
              },
              fn_dbFormat: function() {
                return this.attributes.value;
              }
            }
          ]
        }, 
        {
          title: 'Timing is everything',
          description: 'Roughly speaking, when do you want to go and for how long?',
          //bgColor: '#1C6B7C',
          validButtonText: 'NEXT: REVIEW',
          formElements: [
            {
              tagName: 'input',
              modelName: 'vacation',
              attributes: {
                type: 'date',
                min: [(new Date()).getFullYear(), ("0" + (new Date()).getMonth()).slice(-2), ("0" + (new Date()).getDate()).slice(-2)].join('-'),
                max: '2100-01-01',
                required: true,
                name: 'date',
                autofocus: true,
              },
              fn_print: function() {
                var date = new Date(this.attributes.value);
                return 'Around: ' + date.toLocaleDateString();
              },
              fn_dbFormat: function() {
                var date = new Date(this.attributes.value);
                return date;
              }
            },
            {
              tagName: 'select',
              modelName: 'vacation',
              attributes: {
                value: 'A week',
                name: 'duration'
              },
              options: [
                'A week',
                'Two Weeks',
                'Three Weeks',
                'A month',
                'A long, long time'
              ],
              fn_print: function() {
                return 'Duration: ' + this.attributes.value;
              },
              fn_dbFormat: function() {
                return this.attributes.value;
              }
            }
          ]
        }, {
          title: 'This is it.',
          description: 'Ok, after you review everything, enter your email below.',
          validButtonText: 'ALL DONE',
          showData: true,
          //bgColor: '#125E3B',
          formElements: [
            {
              tagName: 'input',
              modelName: 'vacation',
              attributes: {
                placeholder: 'What is your email?',
                name: 'email',
                required: true,
                type: 'email',
                autofocus: true
              },
              fn_print: function() {
                return this.attributes.value;
              },
              fn_dbFormat: function() {
                return this.attributes.value;
              }
            }
          ]
    }];
    var form = new FormHandler({
      activeStep: 0,
      steps: formSteps
    });
    
This generates the HTML necessary to build the form. The example above is the code used to generate the live demo. That creates a series of slides. However, you could also initialize a single step form-form by passing in an array with one object. Within the formElements portion of any object, you can specify as many inputs as you would like. This makes it easy to break up form entry into multiple steps, or to leave everything on one page. 
