var express = require('express');
var app = express();
var server = require('http').Server(app);

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

// server starts, running the harvester. 
server.listen(process.env.PORT || 8000); 

// only page for application renders are map template
app.get('/', function(req, res) {
  res.render('home');
});
