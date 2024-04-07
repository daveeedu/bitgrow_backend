// const BodyValidator = require('../../middlewares/bodyValidator');

const route = require('express').Router(),
 handler = require('./handler'),
 {
  validateAuthorization,
  validateSuperAdmin,
  validateUserAvailability,
  validateAdmin
 } = require('../../middlewares');

route.get('/settings', validateAuthorization, validateSuperAdmin, validateUserAvailability, handler.getPlatformSetting);

route.put('/settings', validateAuthorization, validateSuperAdmin, validateUserAvailability, handler.updatePlatformSetting);

route.patch('/upload-file', handler.g)
module.exports = route;