const userHandler = require('../modules/user/handler');

exports.getLoggedInUser = async (req, res, next) => {
  try {
    const user = res.locals.user;
    const account = await userHandler.getLoggedInUser(user);
    res.status(account.code).json(account);
  } catch (err) {
    logger.error(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const account = await userHandler.getUserById(req);
    res.status(account.code).json(account);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.getAllUsersActivities = async (req, res, next) => {
  try {
    const activities = await userHandler.getAllUsersActivities(req);
    res.status(activities.code).json(activities);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const account = await userHandler.deleteUserById(id);
    res.status(account.code).json(account);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const body = {
      data: res.locals.validatedBody,
      ...res.locals.user,
    };

    const account = await userHandler.updateAccount(body);
    res.status(account.code).json(account);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const data = await userHandler.getAllUsers(req.query);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};


exports.toggleUserApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await userHandler.toggleUserApproval(id);
    res.status(result.code).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    const data = await userHandler.uploadImage(res.locals.user, req.body);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(500).json(err);
  }
};

exports.getActiveUsers = async (req, res, next) => {
  try {
    const result = await userHandler.getActiveUsers(req.query);
    res.status(result.code).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};
