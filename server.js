var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var Vacation = require('./models/Vacation.js');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  console.log('connected');
});
mongoose.connect('mongodb://localhost/test');

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// server starts, running the harvester. 
server.listen(process.env.PORT || 8000); 

// only page for application renders are map template
app.get('/', function(req, res) {
  res.render('home');
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
    var v = Vacation.create(req.body, function(err, v) {
      console.log(err, v); 
    });
  });
