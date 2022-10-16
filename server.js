var express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
const cors = require('cors');
var bodyParser = require("body-parser");

var app = express();
app.use(cors())
app.use(bodyParser.json());

var fs = require("fs");

const TOKEN = process.env.SUPERVISOR_TOKEN

/**
 * Read conf from json file
 *
 */
app.get('/config', function (req, res) {
  console.log('Reading configuration...')
  console.log('token', TOKEN)
  fs.readFile( __dirname + "/" + "appConfig.json", 'utf8', function (err, data) {
    if (err) {
      //throw err;
      console.log(err)
    } else{
      console.log('fs.readFile ok!')
    }
    //console.log( data );
    res.end( data );
  });
})

/**
 * Save conf on json file
 *
 */
app.post('/config', function (req, res) {
  // Request content
  const data = JSON.stringify(req.body)  
  //console.log(req.body);
  console.log('Writing conf file...')
  fs.writeFile( __dirname + "/" + "appConfig.json", data, (err) => {
    if (err) throw err;
    console.log('fs.writeFile ok!');
    res.end( data );
  });
})

app.get('/ha/states', async function (request, response) {
  try {
    const res = await fetch('http://supervisor/core/api/states',
      {
        method: 'GET',
        headers: {
          //'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+TOKEN
        },
      });
    const headerDate = res.headers && res.headers.get('date') ? res.headers.get('date') : 'no response date';
    console.log('Status Code:', res.status);
    console.log('Date in Response header:', headerDate);

    const data = await res.json();
    /*for(d of data) {
      console.log(d);
    }*/
    //console.log(data)
    response.end(JSON.stringify(data))
  } catch (err) {
    console.log(err.message); //can be console.error
  }
})

//TO REMOVE
app.get('/ha/states2', async function (req, res) {
  console.log('sono in api/states')
  const url = 'http://supervisor/core/api/states'//'http://supervisor/core/api/config'
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': url, //'http://localhost:7123/api/states', //'http://localhost:7123/api/states'
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+TOKEN
    }
  };
  request(options, function (error, response) {
    if (error) {
      //throw new Error(error);
      console.log(error)
    } else {
      console.log(response.body);
    }
  });

})

/**
 *
 * @param {*} sensors Sensors list to call
 * @param {*} temperature Temperature to set on the sensors
 */
 app.post('/setTemperature', async function (req, res) {
    //const data = JSON.stringify(req.body)
    const data = req.body
    let sensors = data.sensors
    let temperature = data.temperature
    let token = data.token
    
    console.log('/setTemperature:', data, sensors)

    /*
    const url = 'http://supervisor/core/api/services/climate/set_temperature'

    if (sensors && sensors.length > 0) {
      const returnPool = await Promise.all(
        sensors.map(async (sensor) => {
          const data = {"entity_id": sensor, "temperature": temperature}
          const response = await fetch(url, {
            headers: {
              'Authorization': 'Bearer '+ TOKEN,
              //'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
          });
          return await response.json();
        })
      );
      console.log(returnPool);
    }*/
    await callSetTemperature(sensors, temperature)

    res.end(JSON.stringify({msg: 'ok'}))
    console.log(req.body);
})

/**
 * Execute server
 */
var server = app.listen(9081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Apiserver listening at http://%s:%s", host, port)
   console.log(__dirname)
})

async function callSetTemperature(sensors, temperature){
  const url = 'http://supervisor/core/api/services/climate/set_temperature'

  if (sensors && sensors.length > 0) {
    const returnPool = await Promise.all(
      sensors.map(async (sensor) => {
        const data = {"entity_id": sensor, "temperature": temperature}
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer '+ TOKEN,
            //'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(data)
        }).catch((err) => {console.log('ERROR:', err.message)});        
        if(response) return await response.json();
      })
    );
    console.log(returnPool);
  }
}

function processData(data) {
  //Foreach zones: 
  // - read sensors
  // - read temperature
  //Foreach sensors:
  // - Set temperature  

  //console.log(data.zones)

  const daysOfWeek = {
    0: 'dom',
    1: 'lun',
    2: 'mar',
    3: 'mer',
    4: 'gio',
    5: 'ven',
    6: 'sab'
  }

  const now = new Date()
  const d = daysOfWeek[now.getDay()]
  const h = ''+now.getHours() 
  const m = now.getMinutes() > 29 ? '30' : '00'
  const hhmm = (h.length === 1 ? '0' : '') + h + ':' + m
  console.log('Current time:', now)
  console.log('Current time:', hhmm)

  let sensors = []

  for (const zone of data.zones) {
    console.log('zone', zone.label)
    for (const sensor of zone.climateSensors) {
      sensors.push(sensor)
    }

    callSetTemperature(sensors, zone.setpointDefault[zone.weekSetpointTimeslice[d][hhmm]].value)
  }
}

var CronJob = require('cron').CronJob;
var job = new CronJob('* */30 * * * *', function() {
    console.log('Here I am, each 30 minutes!')

    fs.readFile( __dirname + "/" + "appConfig.json", 'utf8', function (err, data) {
      if (err) {
        //throw err;
        console.log(err)
      } else{
        console.log('Conf ok!')
        //console.log(data)
      }
      //console.log( data );
      processData( JSON.parse(data) );
    });

    

  }, function () {
    /* This function is executed when the job stops */
    console.log('The End!')
  },
  true, /* Start the job right now */
  'Europe/Rome' /* Time zone of this job. */ //Potrei prenderlo dalla conf!
);