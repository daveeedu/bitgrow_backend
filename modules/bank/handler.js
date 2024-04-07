const {
  update,
  createTransaction
} = require('../../services/bank.service');
const BankService = require('../../services/bank.service');
const NotificationService = require('../../services/notification.service');

exports.update = async (body, id, nid, status) => {
  let isWithdrawal = false;
  if(nid) {
    isWithdrawal = await (await NotificationService.changeNotificationStatus(id, nid, status, isWithdrawal))._doc.isWithdrawal;
  }

  const res = await BankService.topUp(id,body, status, isWithdrawal);
  return res
}

exports.createTransaction = async (body, pid) => {
  body.user = pid;
  const bank = await BankService.createTransaction(body);

  
  const {
    data
  } = bank;
  const activity = {
    title: `$${data.amount} invested successfully`,
    transactionId: data._id,
  }
  const notification = await NotificationService.updateActivity(activity, pid);
  bank.data._doc.activity = notification?.activities;
  return bank;
}

exports.withdraw = async (body, pid) => {
  const bank = await BankService.createTransaction({amount: body.amount, user: pid});
  const activity = {
    title: `$${body.amount} withdrew successfully`,
    transactionId: bank.data._id,
  }
  const notification = await NotificationService.updateActivity(activity, pid);
  bank.data._doc.activity = notification?.activities;
  return bank;
}

exports.balance = async () => {
  const bank = await BankService.getBalance();
  return bank;
}