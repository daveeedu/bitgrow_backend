const api = require('express').Router();
const controller = require('../../controllers/user');
const {
    validateAuthorization,
    validateUserAvailability,
    validateAdmin,
    validateSuperAdmin,
  } = require('../../middlewares'),
  BodyValidator = require('../../middlewares/bodyValidator');

api.get(
  '/active',
  validateAuthorization,
  validateUserAvailability,
  controller.getActiveUsers
);

api.get(
  '/all/activities',
  validateAuthorization,
  validateUserAvailability,
  controller.getAllUsersActivities
);

api.get(
  '/all',
  validateAuthorization,
  validateUserAvailability,
  controller.getAllUsers
);

api.get(
  '/',
  validateAuthorization,
  validateUserAvailability,
  controller.getLoggedInUser
);

api.get(
  '/:id',
  validateAuthorization,
  validateUserAvailability,
  controller.getUserById
);

api.delete(
  '/:id',
  validateAuthorization,
  // validateSuperAdmin,
  validateUserAvailability,
  controller.deleteUserById
);

api.put(
  '/',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.updateAccount,
  controller.updateAccount
);

api.put(
  '/upload',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.uploadAvatar,
  controller.uploadAvatar
);

api.post(
  '/enable-disable/:id',
  validateAuthorization,
  validateAdmin,
  validateUserAvailability,
  controller.toggleUserApproval
);


module.exports = api;
