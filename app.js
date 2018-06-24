var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var data = fs.readFileSync('gotFood.json');
gotFood = JSON.parse(data);
var dash_button = require('node-dash-button');
var dash = dash_button("MAC_ADDRESS", null, null, 'all');
var schedule = require('node-schedule');


var j = schedule.scheduleJob('0 3 * * *', function(){
  gotFood.breakfast = false;
  gotFood.dinner = false;
  var data = JSON.stringify(gotFood, null, 2);
  fs.writeFile('gotFood.json', data, (err) => {
    if (err) throw err;
    console.log('Next day started. The file has been reseted!');
  })
  io.emit('status', gotFood)
});


app.use(express.static('public'));
http.listen(8000, function () {
  console.log('Example app listening on port 8000!');
});


io.on('connection', function(socket){
  console.log('A user connected ');
  var data = JSON.stringify(gotFood)
  io.emit('status', gotFood);
  socket.on('disconnect', function(){
    console.log('A user disconnected');
  });
  socket.on('reset', function () {
    gotFood.breakfast = false;
    gotFood.dinner = false;
    var data = JSON.stringify(gotFood, null, 2);
    fs.writeFile('gotFood.json', data, (err) => {
      if (err) throw err;
      console.log('The file has been reseted!');
    })
    io.emit('status', gotFood)
  })
});


dash.on("detected", function (){
  var date = new Date;
  date = date.getHours();
  console.log("Dash button found");
  console.log(date);
  if(date <= 15){
    gotFood.breakfast = true;
    var data = JSON.stringify(gotFood, null, 2);
    fs.writeFile('gotFood.json', data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    console.log(date);
    console.log('New Breakfast Value: ' + gotFood.breakfast);
    io.emit('status', gotFood)
  }
  else if(date => 16){
    gotFood.dinner = true;
    var data = JSON.stringify(gotFood, null, 2);
    fs.writeFile('gotFood.json', data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    console.log(date);
    console.log('New Dinner Value: ' + gotFood.dinner);
    io.emit('status', gotFood)
  }
});
