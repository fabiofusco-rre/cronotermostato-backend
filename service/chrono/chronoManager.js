const ChronoConfig = require("../../config/chrono.json");
const ConfigService = require("../configuration/configurationService");
const HaService = require('../../service/homeAssistant');
const DeviceService = require('../../service/device')

exports.getChronoConfig = () => {
  return ChronoConfig;
};

exports.createUserChronoConfig = async () => {
  try {
    const haClimateDevices = await HaService.getHAClimateDevices();
    const devicesInfo = DeviceService.getClimateDevicesInfo(haClimateDevices);
    return await ConfigService.updateDeviceRegistry(devicesInfo)
  } catch (error) {
    throw error;
  }
}

exports.getUserChronoConfig = async () => {
  try {
    if(!ConfigService.existsUserChronoFile()){
      await ConfigService.createUserChronoFile();
      await this.createNewZone('demo');
    }
    //await this.updateDeviceRegistry();
    return await ConfigService.getUserChronoFile();
  } catch (error) {
    console.log("ERROR - getUserChronoConfig", error)
    throw error;
  }
};

exports.updateDeviceRegistry = async () => {
  const haClimateDevices = await HaService.getHAClimateDevices();
  const devicesInfo = DeviceService.getClimateDevicesInfo(haClimateDevices);
  return await ConfigService.updateDeviceRegistry(devicesInfo)
}

exports.createNewZone = async (name) => {
  const alreadyExist = await zoneAlreadyExist(name.toLowerCase())
  if(alreadyExist){
    throw 'the zone name already exist'
  }

  const zone = {
    idZone: name.toLowerCase(),
    zoneName: name,
    workMode: createWorkMode(),
    weeklyProgramming: createWeeklyProgramming(),
    devicesAssigned: []
  }

  return await ConfigService.saveZone(zone);
};

exports.getZones = async () => {
  try {
    const userChronoConfig = await this.getUserChronoConfig();
    return userChronoConfig ? Object.keys(userChronoConfig.zone) : [];
  } catch (error) {
    throw error;
  }
};

exports.getWorkModeZone = async (idZone) => {
  try {
    if(!idZone){
      throw 'idZone is necessary';
    }
  
    let userChronoConfig = await ConfigService.getUserChronoFile();
    let zoneConfig = userChronoConfig.zone[idZone]
    if(!zoneConfig){
      throw 'zone does not exist';
    }
    return zoneConfig?.workMode;
  } catch (error) {
    throw error;
  }
}

exports.updateSetPoint = async (idZone, idWorkMode, setPoint) => {
  try {
    if(!idZone || !idWorkMode || !setPoint){
      throw 'idZone & idWorkmode & setPoint are necessary';
    }
  
    let userChronoConfig = await ConfigService.getUserChronoFile();
    let zoneConfig = userChronoConfig.zone[idZone]
    if(!zoneConfig){
      throw 'zone does not exist';
    }
  
    if(!zoneConfig.workMode[idWorkMode]){
      throw 'work mode does not exist';
    }
    if(!isValidSetPoint(idWorkMode, setPoint)){
      throw 'set point out of range';
    }

    zoneConfig.workMode[idWorkMode] = +setPoint;
    for(let[idDay, day] of Object.entries(zoneConfig.weeklyProgramming)){
      day.schedule.map((scheduleDay)=>{
        if(scheduleDay.workMode === idWorkMode){
          scheduleDay.setPoint = +setPoint;
        }
      })
    }
    return await ConfigService.updateZone(zoneConfig);
  } catch (error) {
    throw error;
  }
}

exports.updateWeeklyProgram = async (idZone, weeklyProgramming) => {
  try {
    if(!idZone || !weeklyProgramming){
      throw 'idZone is necessary';
    }
    const isValid = await isValidWeeklyProgramm(idZone, weeklyProgramming);
    if(!isValid){
      throw 'invalid weekly programming'
    }

    let userChronoConfig = await ConfigService.getUserChronoFile();
    let zoneConfig = userChronoConfig.zone[idZone]
    zoneConfig.weeklyProgramming = weeklyProgramming;

    return await ConfigService.updateZone(zoneConfig);
  }catch(error){
    throw error;
  }
}

exports.updateDailySchedule = async (idZone, idDay, schedule) => {
  try {
    if(!idZone || !idDay || !schedule){
      throw 'idZone & idDay & schedule are necessary';
    }
    const isValid = await isValidSchedule(idZone, schedule);
    if(!isValid){
      throw 'invalid daily schedule'
    }

    let userChronoConfig = await ConfigService.getUserChronoFile();
    let zoneConfig = userChronoConfig.zone[idZone]
    zoneConfig.weeklyProgramming[idDay].schedule = schedule;

    return await ConfigService.updateZone(zoneConfig);
  }catch(error){
    throw error;
  }
}

exports.updateZoneDevices = async (mapZoneDevices) => {
  try {
    if(!mapZoneDevices){
      throw 'mapZoneDevices is necessary';
    }
  
    let userChronoConfig = await ConfigService.getUserChronoFile();

    for(const [idZone, idDevices] of Object.entries(mapZoneDevices)){
      let zoneConfig = userChronoConfig.zone[idZone]
      if(!zoneConfig){
        throw 'zone does not exist';
      }
      zoneConfig.devicesAssigned = idDevices;
    }
    
    return await ConfigService.updateUserChronoFile(userChronoConfig);
  } catch (error) {
    throw error;
  }
}

/* exports.updateZoneDevices = async (idZone, idDevices) => {
  try {
    if(!idZone || !idDevices || idDevices.length <= 0){
      throw 'idZone & idDevices are necessary';
    }
  
    let userChronoConfig = await ConfigService.getUserChronoFile();
    let zoneConfig = userChronoConfig.zone[idZone]
    if(!zoneConfig){
      throw 'zone does not exist';
    }
    
    let deviceRegistryIds = Object.keys(userChronoConfig.deviceRegistry);
    for(let i = 0; i < idDevices.length; i++){
      const idDevice = idDevices[i];
      if(!deviceRegistryIds.includes(idDevice)){
        throw `id device ${idDevice} not exist`;
      }
    }

    zoneConfig.devicesAssigned = idDevices;
    return await ConfigService.updateZone(zoneConfig);
  } catch (error) {
    throw error;
  }
} */




const isValidWeeklyProgramm = async (idZone, weeklyProgramming)=>{
  let isValid = true;
  for(const [idDay, dayConfig] of Object.entries(ChronoConfig.days)){
    if(!weeklyProgramming[idDay] || !weeklyProgramming[idDay].schedule){
      isValid = false;
      break;
    }
    isValid = isValidSchedule(idZone, weeklyProgramming[idDay].schedule);
    if(!isValid){
      break;
    }
  }
  return isValid;
}

const isValidSchedule = async (idZone, scheduleConfig)=>{
  const workModeZone = await this.getWorkModeZone(idZone);
  let isValid = true;
  for(let i = 0 ; i < scheduleConfig; i++){
    const schedule = scheduleConfig[i];
    const hour = ChronoConfig.hours[i];
    const workModeConfig = ChronoConfig.workMode;

    if(schedule.hour !== hour || !workModeConfig[schedule.workMode] || workModeZone[schedule.workMode] !== schedule.setPoint ){
      isValid = true;
      break;
    }
  }
  return isValid;
}

const isValidSetPoint = (idWorkMode, setPoint) => {
  const workModeConfig = ChronoConfig.workMode[idWorkMode]
  if(!workModeConfig){
    throw 'work mode config does not exist';
  }
  
  if(isNaN(setPoint)){
    throw 'set point is not a number';
  }
  return  setPoint >= workModeConfig.min &&  setPoint <= workModeConfig.max;
}


const zoneAlreadyExist = async (idZone) => {
  const zones = await this.getZones();
  return zones.includes(idZone)
}

const createWorkMode = () => {
  const workMode_config = ChronoConfig.workMode;
  let workMode = {};
  for (const [key, value] of Object.entries(workMode_config)) {
    workMode[value.id] = value.defaultValue;
  }
  return workMode;
};

const createWeeklyProgramming = () => {
  const workMode = ChronoConfig.workMode[ChronoConfig.defaultWorkMode];
  const days_config = ChronoConfig.days;
  const hours_config = ChronoConfig.hours;

  const weeklyProgramming = {};
  const schedule = createSchedule(hours_config, workMode);
  for (const [idDay, dayConfig] of Object.entries(days_config)) {
    weeklyProgramming[idDay] = {
      idDay: idDay,
      dayName: dayConfig.name,
      dayShortName: dayConfig.shortName,
      schedule: schedule,
    };
  }
  return weeklyProgramming;
};

const createSchedule = (hours_config, workMode) => {
  const schedule = [];
  hours_config.map((hour, idx) => {
    schedule[idx] = {
      hour: hour,
      workMode: workMode.id,
      setPoint: workMode.defaultValue,
    };
  });
  return schedule;
};
