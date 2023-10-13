var express = require("express");
var HaService = require('../../service/homeAssistant');
var DeviceService = require('../../service/device')
var ConfigService = require('../../service/configuration/configurationService');


var router = express.Router();

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
const CONFIG = hub_strutture;

router.get('/config', async (req, res)=>{
  try {
    const haClimateDevices = await HaService.getHAClimateDevices();
    const devicesInfo = DeviceService.getClimateDevicesInfo(haClimateDevices);
    const useConfig = await ConfigService.updateDeviceRegistry(devicesInfo)
    res.end(JSON.stringify(useConfig))
  } catch (error) {
    res.end("ERRORE"+error)
  }
})

module.exports=router;