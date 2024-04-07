'use strict';
const PlatformService = require('../../services/platform.service');


exports.getPlatformSetting = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await PlatformService.getPlatformSettings();
    res.status(data.code).json(data)
  } catch (error) {
    logger.error(error);
    res.status(error.code).json(error)
  }
}

exports.updatePlatformSetting = async (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
  try {
    const data = await PlatformService.updatePlatformSettings(req.body);
    res.status(data.code).json(data)
  } catch (error) {
    logger.error(error);
    res.status(error.code).json(error)
  }
}



exports.createCertifications = async (req, res, next) => {
  try{
  logger.info({method: req.method, path: req.originalUrl});
  
  const res = await Certifications.insertMany(req.body.certifications);
  
  res.json({code: 201, data: res, message: "Certification created successfully"})
}catch(err){
  const arr = err.writeErrors[0].errmsg.split(':'),
  msg = err.writeErrors[0].errmsg.split(':')[arr.length - 1].replace(/[}"]/g,'');

    if(err.code === 11000){
      res.json({code: 409, message: `${msg.trim()} already exists`})
    }
    else res.json({code: 500, data: err, message: "Certification creation failed"})
  }
}

exports.g = async (req, res, next) => {
  try{
    const data = await PlatformService.u({f:req.files.file});
    res.status(data.code).json(data)
  }catch(r){
    res.status(r.code).json(r)
  }
}