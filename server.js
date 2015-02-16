var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var Vacation = require('./models/Vacation.js');
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

app.get('/form', function(req, res) {
  res.render('form-form');
});

app.get('/complete', function(req, res) {
  res.render('complete');
});

app.route('/vacations')
  .get(function(req, res) {
    Vacation.find({}, function(err, v) {
      console.log('find', err, v);
      res.send(JSON.stringify(v));
    });
  })
  .post(function(req, res) {
    console.log('body', JSON.stringify(req.body));

    var user = new User({
      email: req.body.email
    });
    User.findOne({ email: user.email }, function(err, existingUser) { 
      if (existingUser) {
        req.body.createdBy = existingUser.id;
        delete req.body.email;
        var v = Vacation.create(req.body, function(err, v) {
          console.log('created u: ', v);
          res.send({ redirect: '/complete' });
        });
      } else {
        user.save(function(err, user) {
          if (err) return next(err);
          req.body.createdBy = user.id;
          delete req.body.email;
          var v = Vacation.create(req.body, function(err, v) {
            console.log('created v and u: ', v);
            res.send({ redirect: '/complete' });
          });
        });
      }
    });

  });

app.route('/users')
  .post(function(req, res) {
    console.log('body', JSON.stringify(req.body));
    var v = User.create(req.body, function(err, v) {
      console.log(err, v); 
    });
  });
