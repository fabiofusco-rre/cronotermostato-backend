/**
 * 
 * @param {*} sensors Elenco dei sensori da contattare
 * @param {*} temperature Temperatura da impostare sui sensori
 */
/*
export async function postSetTemperature(sensors, temperature) {
    console.log('Sono nella post')
    // default url:/api/services/climate/set_temperature";
    const urlAPIConfig = localStorage.getItem("urlAPIServiceClimatePOST") || process.env.REACT_APP_HA_API_SET_TEMPERATURE
  
    const returnPool = await Promise.all(
      sensors.map(async (sensor) => {
        const data = {"entity_id": sensor, "temperature": temperature}
        const response = await fetch(urlAPIConfig, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return await response.json();
      })
    );
        
    console.log(returnPool); 
};*/

var CronJob = require('cron').CronJob;
var job = new CronJob('0 */30 * * * *', function() {
    console.log('Ecco il job ogni 30 minuti')

    //Per ogni zona: 
    // - legge i sensori associati
    // - legge le temperarure per ogni mezz'ora
    //Per ogni sensore:
    // - applica la temperatura della mezz'ora attuale
    //... DA FINALIZZARE col richiamo di postSetTemperature

  }, function () {
    /* This function is executed when the job stops */
    console.log('Finito')
  },
  true, /* Start the job right now */
  'Europe/Rome' /* Time zone of this job. */ //Potrei prenderlo dalla conf!
);
