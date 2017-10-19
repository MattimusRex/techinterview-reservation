var express = require("express");
var handlebars = require("express-handlebars").create({defaultLayout:"main"});
var path = require("path");
var mysql = require("mysql");
var db = require('./config/dbconnect');
var bodyParser = require("body-parser");

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("http_port", 8081);

app.get("/", function(req, res, next) {
  res.render("seating_chart");
});

app.get("/seats", function(req, res, next) {
  db.pool.query("SELECT theater, row, seat_num FROM seat_reservation.seats", function(err, results, fields) {
    if (err) {
      next(err);
      return;
    }
    payload = {};
    payload.seats = results;
    res.send(payload);
  });
});

app.post("/seats", function(req, res, next) {
  var seats = [];
  for (var i = 0; i < req.body.seats.length; i++) {
    seats[i] = [4];
    seats[i][0] = req.body.seats[i].theater;
    seats[i][1] = req.body.seats[i].row;
    seats[i][2] = req.body.seats[i].seat_num;
    seats[i][3] = req.body.seats[i].reserved;
  }
  db.pool.query("INSERT INTO seat_reservation.seats (theater, row, seat_num, reserved) VALUES ?", [seats], function (err, result) {
    if (err) {
      next(err)
      return;
    }
    res.sendStatus(201);
  });
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});
  
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('http_port'), function(){
    console.log('Express http started on localhost:' + app.get('http_port') + '; press Ctrl-C to terminate.');
});