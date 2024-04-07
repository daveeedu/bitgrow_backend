const joi = require('joi');


// profile
const name = joi.string().min(3).max(100),
  number = joi.string().min(10).max(15),
  walletId = joi.string(),
  referrer = joi.string(),
  avatar = joi.string(),
  country = joi.string().min(3),
  password = joi.string().min(8).max(20).required(),
  confirmPassword = joi.ref("password"),
  email = joi.string().email({minDomainSegments: 2}),
  merchantId = joi.string();

const socialLinks = joi.object().keys({
  linkedin: joi.string().min(3).max(500),
  github: joi.string().min(3).max(400),
  twitter: joi.string().min(3).max(400),
  facebook: joi.string().min(3).max(400),
  instagram: joi.string().min(3).max(400),
  youtube: joi.string().min(3).max(400),
});

let {
  ADMIN,
  SUPERADMIN,
  USER
} = require('./role.js');

ADMIN = H.getRoleName(ADMIN);
SUPERADMIN = H.getRoleName(SUPERADMIN);
USER = H.getRoleName(USER);

exports.accountSchema = joi.object({
  email,
  password,
  type: joi.string().valid(ADMIN, SUPERADMIN, USER),
});

exports.userSignupSchema = joi.object({
  name: name.required(),
  userName: name.required(),
  email: email.required(),
  confirmEmail: email.required(),
  merchantId,
  country,
  number: number.required(),
  walletId: walletId.allow(""),
  password: password.required(),
  confirmPassword,
  referrer: referrer.allow(""),
  privacyPolicy: joi.boolean().allow(true),
  type: joi.string().valid(ADMIN, SUPERADMIN, USER),
});

exports.adminSignupSchema = joi.object({
  name: name.required(),
  userName: name.required(),
  number: number.required(),
  email: email.required(),
  password,
  confirmPassword,
  type: joi.string().valid(ADMIN, SUPERADMIN),
});

exports.changePasswordSchema = joi.object({
  oldPassword: password,
  password,
});


exports.profileSchema = joi.object({
  name,
  number,
  avatar,
  email,
  country,
  walletId
});


exports.forgotPasswordSchema = joi.object({
  email,
});

exports.resetPasswordSchema = joi.object({
  password,
});


exports.testimonySchema = joi.object({
  testimony: joi.string().min(3).max(1000).required(),
});

exports.upgradeUserSchema = joi.object({
  type: joi.string().valid(USER, ADMIN, SUPERADMIN),
});

exports.joinWaitlist = joi.object({
  email: email.required(),
  fullName: name.required(),
  number: number.required(),
  country: country.required(),
});

exports.transactionSchema = joi.object({
  amount: joi.number().required(),
  profit: joi.string().required(),
  plan: name.required(),
  method: name.required()
});

exports.validateTopUp = joi.object({
  amount: joi.number().required(),
  profit: joi.string().required(),
  method: name,
  plan: name,
})