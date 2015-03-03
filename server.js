var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');

var lh = require('./public/js/LocationHandler')();
var util = require('util');

var mongoose = require('mongoose');
var Vacation = require('./models/Vacation.js');
var Location = require('./models/Location.js');
var User = require('./models/User.js');

var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/test';
mongoose.connect(mongoUrl);
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  console.log('connected');
});

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// server starts, running the harvester. 
server.listen(process.env.PORT || 8000); 

app.get('/', function(req, res) {
  res.render('home');
});


app.get('/faq', function(req, res) {
  res.render('faq');
});

app.get('/map', function(req, res) {
  res.render('map');
});

app.get('/form', function(req, res) {
  res.render('form-form');
});

app.get('/complete', function(req, res) {
  res.render('complete');
});


// aggregate all location data. good to use for a map, perhaps.
app.get('/dashboard', function(req, res) {
  var o = {};
  o.map = function() { emit(this.country, 1); };
  o.reduce = function(k, vals) { return vals.length; };
  Location.mapReduce(o, function(err, data, stats) {
    console.log(stats, data);
    data = data.sort(function(a, b) {
      return b.value - a.value;
    });
    res.render('dashboard', { locs: data });
  });
});

// API endpoints
app.route('/vacations')
  .get(function(req, res) {
    Vacation.find({}, function(err, v) {
      res.send(v);
    });
  })
  .post(function(req, res) {

    // XXX so complicated...
    var user = new User({
      email: req.body.email
    });
    lh.geocode(req.body.location, function(placeObj) {
      var locationObj = {};
      Object.keys(placeObj).forEach(function(key) {
        locationObj[key] = placeObj[key].long_name;
      });
      var location = new Location(locationObj);

      Location.create(location, function(err, newLocation) {
        var upsertData = user.toObject();
        delete upsertData._id;
        User.update({ email: user.email }, upsertData, { upsert: true }, function(err) { 
          delete req.body.location;
          delete req.body.email;
          req.body.createdBy = user.id;
          req.body.location = newLocation.id;
          Vacation.create(req.body, function(err, v) {
            res.send({ redirect: '/dashboard' });
          });
        });
      });
    });
  });

app.get('/vacations/summary', function(req, res) {
  var o = {};
  o.map = function() { emit(this.country, 1); };
  o.reduce = function(k, vals) { return vals.length; };
  Location.mapReduce(o, function(err, data, stats) {
    var bundle = {}
    data.forEach(function(v) {
      bundle[v._id] = v.value;
    });
    res.send(bundle);
  });
});

app.route('/users')
  .post(function(req, res) {
    var v = User.create(req.body, function(err, v) {
      console.log(err, v); 
    });
  });
