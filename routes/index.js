
var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const fetch = require("node-fetch");
var W3CWebSocket = require("websocket").w3cwebsocket;

const homeassistant = require('./homeAssistant')
const chrono = require('./chrono');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/static", express.static('./routes/web/static/'));


app.get('/web', function(req, res){
  res.sendFile(__dirname + '/web/index.html');
});

app.use("/ha", homeassistant);
app.use("/chrono", chrono);



var server = app.listen(9081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Apiserver listening at http://%s:%s", host, port);
});