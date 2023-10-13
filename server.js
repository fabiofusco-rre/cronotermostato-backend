var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const fetch = require("node-fetch");
var W3CWebSocket = require("websocket").w3cwebsocket;

var app = express();
app.use(cors());
app.use(bodyParser.json());

console.log("INIZIALIZZATO");

app.get("/config", function (req, res) {
  console.log("QUESTE SONO LE MIE INFORMAZIONI ");
  res.end("CONFIGURAZIONE DEVICE:{}");
});

app.get("/time", function (req, res) {
  webSocket().then((ris) => {
    console.log("hola", ris);
    res.end(ris);
  });
});

app.post("/config", function (req, res) {
  // Request content
  const data = JSON.stringify(req.body);
  console.log("INFO DATA ", data);
  res.end("GRAZIE");
});

const mac_samir_config = {
  host: "homeassistant.local:9000",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI5Y2I1MjYwZDAwOWU0MmIxODcxYzE5YjZiNzkzNjcxMyIsImlhdCI6MTY4NDkzMTgzMywiZXhwIjoyMDAwMjkxODMzfQ.XAAQwiK2jVBUikJQlaDTmn-yx8G9FwPufAs1bdkT2pk",
};

const hub_strutture = {
  host: "192.168.6.10:8123",
  token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkMGI2YTg1ODkxNmU0MDc2YTM3NjVmMjI0NTcwZmRmMiIsImlhdCI6MTY4NDkzMDkzNiwiZXhwIjoyMDAwMjkwOTM2fQ.NgXw-whDeEmSnKHFd7ALmPdQFtutzDLOVAbbfmRIqHE",
};
const CONFIG = hub_strutture;
app.get("/ha/states", async function (request, response) {
  try {
    const res = await fetch(`http://${CONFIG.host}/api/states`, {
      method: "GET",
      headers: {
        //'Accept': 'application/json',
        "Content-Type": "application/json",
        Authorization: "Bearer " + CONFIG.token,
      },
    });

    const data = await res.json();
    response.end(JSON.stringify(data));
  } catch (err) {
    console.log(err.message); //can be console.error
  }
});
app.get("/ha/config", async function (request, response) {
  try {
    //const res = await fetch(`${CONFIG.host}/api/hassio/addons`,
    const res = await fetch(`${CONFIG.host}/api/hassio/services`, {
      method: "GET",
      headers: {
        //'Accept': 'application/json',
        "Content-Type": "application/json",
        Authorization: "Bearer " + CONFIG.token,
      },
    });
    console.log("res", res);

    const data = await res.json();
    response.end(JSON.stringify(data));
  } catch (err) {
    console.log(err.message); //can be console.error
  }
});

var server = app.listen(9081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Apiserver listening at http://%s:%s", host, port);
  webSocket();
  //K console.log(__dirname)
});

console.log("fine");

const webSocket = () => {
  return new Promise((resolve, reject) => {
    const socket = new W3CWebSocket(`ws://${CONFIG.host}/api/websocket`);
    console.log("APRO WEB SOCKET");
    socket.onopen = function (event) {
      console.log("MANDO AUTENTICAZIONE");
      socket.send(
        JSON.stringify({
          type: "auth",
          access_token: CONFIG.token,
        })
      );
      console.log("SONO QUI");
    };
    // UTILI
    //https://community.home-assistant.io/t/how-to-get-list-of-areas-through-websocket-api-or-hass-object/426485/2

    //https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/#full-example

    //socket.send(JSON.stringify({ type: 'config/area_registry/list', id: 4 }))

    //socket.send(JSON.stringify({ type: 'config/device_registry/list', id: 3 }))

    socket.onmessage = function (e) {
      if (typeof e.data === "string") {
        //console.log("Received: '" + e.data + "'");
        console.log(JSON.parse(e.data).id);
        if (JSON.parse(e.data).type === "auth_ok") {
          console.log("SONO AUTENTICATO");
          socket.send(
            JSON.stringify(
              { type: "config/entity_registry/list", id: 3 },
              null,
              2
            )
          );
        }
        if (JSON.parse(e.data).id === 3) {
          socket.close();
          resolve(e.data);
        }
      }
    };

    socket.onclose = function (e){
      console.log("WEBSOCKET CLOSE ", e)
    }
  });
};

// after you get the auth_ok message, send this websocket:
/*  */
