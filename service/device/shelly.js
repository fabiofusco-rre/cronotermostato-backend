
const PLATFORM = 'shelly';

var exemplae = {
  idDevice:{
    platform:"shelly",
    name: "nome_dispositivo",
    isAvailable: true,
    stateInfo:{
      climate: "heat",
      temperature: "26°C",
      currentTemperature: "22",
      batteryLevel: "80%",
      valvePosition: "90%"
    },
    entityControl:{
      temperature: "sensor.shellytrv_60a423d0ceb4_temperature"
    }
  }
}
exports.getInfo = (haClimateDevices) => {
  let deviceInfo = {};
  Object.keys(haClimateDevices).map((idDevice)=>{
    let haDevice = haClimateDevices[idDevice];
    if(haDevice.platform === PLATFORM){
      const generalInfo = getGeneralInfo(haDevice.entity);
      const batteryInfo = getBatteryInfo(haDevice.entity);
      const valeInfo = getValvePosition(haDevice.entity);

      deviceInfo[idDevice] = {
        idDevice: idDevice || null,
        platform: PLATFORM || null,
        name: generalInfo.name || null,
        isAvailable: generalInfo.isAvailable,
        stateInfo:{
          climate: generalInfo.climateState || null,
          temperature: generalInfo.temperature || null,
          currentTemperature: generalInfo.currentTemperature || null,
          batteryLevel: batteryInfo.batteryLevel || null,
          valeInfo: valeInfo.valvePosition || null
        },
        entityControl:{
          temperature: generalInfo.entityControl || null,
          valve: valeInfo.entityControl || null
        }
      }
    }
  });
  return deviceInfo;
}


const getGeneralInfo = (deviceEntities)=>{
  const generalInfo = {}
  for (const [entityId, entityObj] of Object.entries(deviceEntities)) {
    if(entityId.startsWith('climate.')){
      generalInfo.entityControl = entityObj.id;
      generalInfo.isAvailable = checkIsDeviceAvailable(entityObj);
      generalInfo.climateState = entityObj?.stateInfo?.state;
      generalInfo.name = entityObj?.stateInfo?.attributes.friendly_name;
      generalInfo.temperature = entityObj?.stateInfo?.attributes.temperature;
      generalInfo.currentTemperature = entityObj?.stateInfo?.attributes.current_temperature;
      break;
    }
  }
  return generalInfo;
}

const checkIsDeviceAvailable = (entityObj)=>{
  return !!entityObj?.stateInfo &&
    !!entityObj?.stateInfo?.state &&
    entityObj?.stateInfo?.state !== 'unavailable' &&
    !!entityObj?.stateInfo?.attributes.temperature &&
    entityObj?.stateInfo?.attributes.temperature !== 'unavailable'
}

const getBatteryInfo = (deviceEntities)=>{
  const batteryInfo = {}
  for (const [entityId, entityObj] of Object.entries(deviceEntities)) {
    if(entityId.endsWith('_battery')){
      batteryInfo.batteryLevel = entityObj?.stateInfo?.state;
      break;
    }
  }
  return batteryInfo;
}

const getValvePosition = (deviceEntities)=>{
  const valeInfo = {}
  for (const [entityId, entityObj] of Object.entries(deviceEntities)) {
    if(entityId.endsWith('_valve_position')){
      valeInfo.entityControl = entityObj.id;
      valeInfo.valvePosition = entityObj?.stateInfo?.state;
      break;
    }
  }
  return valeInfo;
}