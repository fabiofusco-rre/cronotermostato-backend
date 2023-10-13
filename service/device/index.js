
const ShellyDevice = require('./shelly');

exports.getClimateDevicesInfo = (haClimateDevices) => {
  return ShellyDevice.getInfo(haClimateDevices)
}




var exemplae = {
  idDevice:{
    model:"shelly",
    name: "nome_dispositivo",
    isAvailable: true,
    stateInfo:{
      temperature: "26°C",
      currentTemperature: "22",
      batteryLevel: "80%",
      valvPosition: "90%"
    },
    entityControl:{
      temperature: "sensor.shellytrv_60a423d0ceb4_temperature"
    }
  }
}