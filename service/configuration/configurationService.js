const Chrono = require('../../config/chrono.json');
var fs = require("fs");

const PATH_USER_CHRONO_CONFIG = `${Chrono.userConfigFile.pathDir}/${Chrono.userConfigFile.fileName}`;


exports.existsUserChronoFile = ()=>{
  return fs.existsSync(PATH_USER_CHRONO_CONFIG);
}

exports.createUserChronoFile = ()=>{
  const template = JSON.stringify(Chrono.userConfigFile.template, null, 2)
  return new Promise((resolve, reject)=>{
    fs.writeFile(PATH_USER_CHRONO_CONFIG, template, (err) => {
      if (err) reject(err);
      resolve(JSON.parse(template));
    });
  })
}

exports.updateUserChronoFile = (userChronoConfig) =>{
  const template = JSON.stringify(userChronoConfig, null, 2)
  return new Promise((resolve, reject)=>{
    fs.writeFile(PATH_USER_CHRONO_CONFIG, template, (err) => {
      if (err) reject(err);
      resolve(JSON.parse(template));
    });
  })
}

exports.getUserChronoFile = () => {
  return new Promise((resolve, reject)=>{
    fs.readFile(PATH_USER_CHRONO_CONFIG, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } 
      if(data){
        resolve(JSON.parse(data))
      } else {
        resolve(undefined)
      }
    });
  })
}

exports.saveZone = async (zone)=>{
  if(!this.existsUserChronoFile()){
    //FIXME: se non c'è sollevare un eccezione
    await this.createUserChronoFile();
  }
  const userChrono = await this.getUserChronoFile();
  userChrono.zone[zone.idZone] = zone;
  return await saveUserChronoFile(userChrono);
}

exports.updateZone = async (zone)=>{
  if(!this.existsUserChronoFile()){
    throw 'user chrono config file does not exist'
  }
  const userChrono = await this.getUserChronoFile();
  userChrono.zone[zone.idZone] = zone;
  return await saveUserChronoFile(userChrono);
}

exports.updateDeviceRegistry= async (devicesInfo)=>{
  if(!this.existsUserChronoFile()){
    throw 'user chrono config file does not exist'
  }
  let userChrono = await this.getUserChronoFile();
  userChrono.deviceRegistry = devicesInfo;
  let deviceRegistryIds = Object.keys(devicesInfo);

  for(let [idZone, zoneConfig] of Object.entries(userChrono.zone)){
    const devicesAssigned = zoneConfig.devicesAssigned;
    let new_devicesAssigned = [];
    devicesAssigned.map((idDevice)=>{
      if(deviceRegistryIds.includes(idDevice)){
        new_devicesAssigned.push(idDevice);
      }
    });
    zoneConfig.devicesAssigned = new_devicesAssigned;
    userChrono.zone[idZone] = zoneConfig;
  }
  
  return await saveUserChronoFile(userChrono);
}


const saveUserChronoFile = (userChrono)=>{
  const _userChrono = JSON.stringify(userChrono, null, 2);
  return new Promise((resolve, reject)=>{
    fs.writeFile(PATH_USER_CHRONO_CONFIG, _userChrono, (err) => {
      if (err) reject(err);
      resolve(userChrono);
    });
  })
}