
const WsHa = require('./wsHa');
const fetchApi = require("./common/fetchApi");

const mac_samir_config = {
  host: "homeassistant.local:9000",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI5Y2I1MjYwZDAwOWU0MmIxODcxYzE5YjZiNzkzNjcxMyIsImlhdCI6MTY4NDkzMTgzMywiZXhwIjoyMDAwMjkxODMzfQ.XAAQwiK2jVBUikJQlaDTmn-yx8G9FwPufAs1bdkT2pk",
};

const hub_strutture = {
  host: "192.168.6.10:8123",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3ODgxOTI5NjcwMGU0YjA5YmIzZmQ5NjA0ZDJlZmEzOCIsImlhdCI6MTY5Njg0NDQ4MSwiZXhwIjoyMDEyMjA0NDgxfQ.yklAUap5z-XY5PyfLyfFwUs1JR2XoIGZrBrIi70InK8",
};

const hub_casetta = {
  host: "192.168.6.10:8123",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkNWEyYmJkZTA2NWM0NWJlOTkxMzBmMmUzNDlmYzk2YiIsImlhdCI6MTY4NjE1MzU0OCwiZXhwIjoyMDAxNTEzNTQ4fQ.82dOyq7d9_Ojuqeq1kAw5d9q3rVV-fF8KzmF0bC6aXg"
}
let CONFIG = hub_strutture;
/* CONFIG.host = "http://supervisor/core" */
/* CONFIG.token = process.env.SUPERVISOR_TOKEN ? process.env.SUPERVISOR_TOKEN : CONFIG.token */

console.log("CONFIG HOME ASSISTANT SERVICE", CONFIG)
 
exports.getHAClimateDevices = async ()=>{
  try {
    console.log("getHAClimateDevices")
    console.log("getHAClimateDevices - getEntityRegistry")

    const entityRegistry = await getEntityRegistry();
    console.log("getHAClimateDevices - getEntityRegistry - result:", entityRegistry)
    console.log("getHAClimateDevices - getDeviceEntityInfo")
    const deviceEntityInfo = getDeviceEntityInfo(entityRegistry, 'climate.');
    console.log("getHAClimateDevices - getDeviceEntityInfo - result:", deviceEntityInfo)
    console.log("getHAClimateDevices - getDeviceState")
    const deviceState = await getDeviceState();
    console.log("getHAClimateDevices - getDeviceState - result:", deviceState)
  
    console.log("getHAClimateDevices - completeEntityWithState")
    const deviceInfo = completeEntityWithState(deviceEntityInfo, deviceState);
    console.log("getHAClimateDevices - completeEntityWithState - result:", deviceInfo)
    return deviceInfo;
  } catch (error) {
    console.log("[ERROR]getHAClimateDevices", error);
    throw error;
  }
}

const getDeviceState = async ()=>{
  try {
    const deviceState = await fetchApi.get(`http://${CONFIG.host}/api/states`, CONFIG.token);
    return deviceState;
  } catch (error) {
    throw error;
  }
}

exports.setDeviceTemperature = async (idEntity, setPoint)=>{
  const payload = {"entity_id": idEntity, "temperature": setPoint}
  try {
    const deviceState = await fetchApi.post(`http://${CONFIG.host}/api/services/climate/set_temperature`, CONFIG.token, payload);
    return deviceState;
  } catch (error) {
    throw error;
  }
}


const completeEntityWithState = (deviceEntityInfo, deviceState) => {
  const stateMapped = {};
  deviceState.map((ds)=>{stateMapped[ds.entity_id]=ds});
  
  Object.keys(deviceEntityInfo).map((idDevice)=>{
    let device = deviceEntityInfo[idDevice]
    const idsEntity = Object.keys(device.entity);
    idsEntity.map((idEntity)=>{
      device.entity[idEntity].stateInfo = stateMapped[idEntity]
    })

    deviceEntityInfo[idDevice] = device;
  })
  return deviceEntityInfo;
}


const getEntityRegistry = async() =>{
  console.log("INNER getEntityRegistry")
  console.log("INNER getEntityRegistry -  WsHa.initWS")
  const socket = await WsHa.initWS(CONFIG.host, CONFIG.token);
  console.log("INNER getEntityRegistry -  WsHa.initWS - result ", socket)
  const entityRegistry = await WsHa.getEntityRegistry(socket)
  await WsHa.closeWS(socket) 
  return entityRegistry;
}


const getDeviceEntityInfo = (entityRegistry, type) => {
  const idsDevice = getDeviceIdsByCategory(entityRegistry, type);
  const deviceEntityInfo = groupsDeviceEntities(idsDevice, entityRegistry)
  return deviceEntityInfo
}

const getDeviceIdsByCategory = (deviceList, type)=>{
  let ids = [];
  deviceList.map((device)=>{
    if(device.entity_id.startsWith(type)){
      if(device.device_id){
        ids.push(device.device_id)
      }
    }
  })
  return ids
}

const groupsDeviceEntities = (idsDevice, deviceList) => {
  let deviceInfo = {};
  deviceList.map((device)=>{
    if(idsDevice.includes(device.device_id)){
      if(!deviceInfo[device.device_id]){
        deviceInfo[device.device_id] = {}
        deviceInfo[device.device_id].entity = {};
        deviceInfo[device.device_id].platform = device.platform;
      }
      deviceInfo[device.device_id].entity[device.entity_id]={
        id: device.entity_id,
        areaId: device.area_id,
        category: device.entity_category,
        name: device.name,
        platform: device.platform
      }
    }
  })
  return deviceInfo;
}

