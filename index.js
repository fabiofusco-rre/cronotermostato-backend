const { setDeviceTemperature } = require("./service/homeAssistant");
const Chrono = require('./config/chrono.json');
//const env = require("./config/env");
//console.log(`NODE_ENV=${JSON.stringify(env)}`);


console.log(`La tua porta è ${JSON.stringify(process.env, null, 2)}`); // undefined

console.log("TOKEN HOME ASSISTANT ", process.env.SUPERVISOR_TOKEN)






require("./routes");

var CronJob = require("cron").CronJob;
try {
  var job = new CronJob(
    "*/10 * * * * *",
    function () {
      //console.log("Here I am, every 10 seconds!");

      startSettings()
    },
    function () {
      /* This function is executed when the job stops */
      console.log("The End!");
    },
    true /* Start the job right now */,
    "Europe/Rome" /* Time zone of this job. */ //Potrei prenderlo dalla conf!
  );
} catch (error) {
  console.log(" ERRORRR");
}


const startSettings = async()=>{
  try {
    const dayNumber = new Date().getDay();
    const hour = new Date().getHours();
    const day = Object.keys(Chrono.days)[dayNumber - 1];

    let UserChrono = require('./config/userChronoConfig.json');
    delete require.cache[require.resolve('./config/userChronoConfig.json')];
    UserChrono = require('./config/userChronoConfig.json');


    Object.values(UserChrono.zone).map(async(configZone)=>{
      const devicesAssigned = configZone?.devicesAssigned;
      if(devicesAssigned.length > 0){
        const schedule = configZone?.weeklyProgramming[day]?.schedule;
        let setPoint = null;
        schedule.map((i)=>{
          if(i.hour == hour){
            setPoint = i.setPoint;
          }
        })

        const devicesToSet = devicesAssigned.map((idDevice)=>{
          return UserChrono.deviceRegistry[idDevice]
        })
        for(let i = 0; i < devicesToSet.length; i++){
          const deviceInfo = devicesToSet[i];
          const idEntity = deviceInfo?.entityControl?.temperature;

          if(deviceInfo.isAvailable && idEntity){
            console.log("DEVICE IS AVIABLE TO SET", deviceInfo.idDevice, deviceInfo.name, setPoint, idEntity)
            try {
              await setDeviceTemperature(idEntity, setPoint)
            } catch (error) {
              console.log("ERROR CALL SET TEMPERATURA", error)
            }
          }else{

            console.log("DEVICE *IS NOT* AVIABLE TO SET", deviceInfo.idDevice, deviceInfo.name, setPoint, idEntity)
          }
        }
      }else{
        //console.log("NESSUN DISPOSITIVO DA CONFIGURARE")
      }
    })
    new Date()
  } catch (error) {
    console.log("ERROR", error)
  }
}