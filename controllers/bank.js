const bankHandler = require("../modules/bank/handler");

exports.createTransaction = async (req, res, next) => {
  try {
    const data = res.locals.validatedBody;
    const bank = await bankHandler.createTransaction(data, res.locals.user.pid);
    res.status(bank.code).json(bank);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.topUp = async (req, res, next) => {
  try {
    const data = res.locals.validatedBody;
    
    const bank = await bankHandler.update(data, req.params.pid, req.query.activityId, req.query.status);
    res.status(bank.code).json(bank);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.withdraw = async (req, res, next) => {
  try {
    console.log(req.body) 
    const bank = await bankHandler.withdraw(req.body, res.locals.user.pid);
    res.status(bank.code).json(bank);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.getBankBalance = async (req, res, next) => {
  try {
    const bank = await bankHandler.balance();
    res.status(bank.code).json(bank);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}