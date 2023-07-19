var express = require("express");
var ChronoManager = require('../service/chrono/chronoManager');
const { successResponse, errorResponse } = require("../service/common/responseHandler");


var router = express.Router();


router.get('/configs', async (req, res)=>{
  try {
    const chronoConfig = await ChronoManager.getChronoConfig();
    const userConfig = await ChronoManager.getUserChronoConfig();
    const response = {chronoConfig, userConfig};
    res.end(successResponse(response));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.get('/config', async (req, res)=>{
  try {
    const config = await ChronoManager.getChronoConfig();
    res.end(successResponse(config));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.get('/user/config', async (req, res)=>{
  try {
    const userConfig = await ChronoManager.getUserChronoConfig();
    res.end(successResponse(userConfig));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.post('/zone', async (req, res)=>{
  try {
    const { zoneName } = req.body;
    const userConfig = await ChronoManager.createNewZone(zoneName);
    res.end(successResponse(userConfig));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.patch('/zone/:idZone/workMode/:idWorkMode', async (req, res)=>{
  try {
    const { idZone, idWorkMode } = req.params;
    const { setPoint } = req.body;

    const result = await ChronoManager.updateSetPoint(idZone, idWorkMode, setPoint);
    res.end(successResponse(result));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.patch('/zone/:idZone/weeklyProgramming', async (req, res)=>{
  try {
    const { idZone } = req.params;
    const { weeklyProgramming } = req.body;

    const result = await ChronoManager.updateWeeklyProgram(idZone, weeklyProgramming);
    res.end(successResponse(result));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.patch('/zone/:idZone/:idDay/schedule', async (req, res)=>{
  try {
    const { idZone, idDay } = req.params;
    const { schedule } = req.body;

    const userConfig = await ChronoManager.updateDailySchedule(idZone, idDay, schedule);
    res.end(successResponse(userConfig));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

router.patch('/zone/devices', async (req, res)=>{
  try {
    const { mapZoneDevices } = req.body;

    const result = await ChronoManager.updateZoneDevices(mapZoneDevices);
    res.end(successResponse(result));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

//TODO: FORSE DA RIMUOVERE
router.patch('/zone/:idZone/devices', async (req, res)=>{
  try {
    const { idZone } = req.params;
    const { idDevices } = req.body;

    const result = await ChronoManager.updateZoneDevices(idZone, idDevices);
    res.end(successResponse(result));
  } catch (error) {
    res.status(400).end(errorResponse(error));
  }
});

module.exports=router;