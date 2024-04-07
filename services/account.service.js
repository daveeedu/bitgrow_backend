/*jslint node: true */
// jshint esversion:8

'use strict';
const path = require('path');
const AccountModel = require('../modules/account/model');
const {
  ProfileModel
} = require(path.resolve('modules/profile/model'));
const dayjs = require('dayjs');

const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_FORBIDDEN,
} = require('../utils/http.response.code');
const responseMessage = require('../utils/http.response.message');
const MailNotificationService = require(path.resolve(
  'services',
  'mail.notification.service'
));
const ProfileService = require('./profile.service');
const Notification = require('./notification.service');
const Bank = require('./bank.service');

const ApiResponse = require(path.resolve('utils', 'http.response'));

const {
  ADMIN,
  SUPERADMIN,
  USER,
  ACTIVE,
  INACTIVE,
  SUSPENDED,
  DELETED
} = require('../utils/role');

// const status = {
//   inactive: 0,
//   active: 1,
//   suspend: 2
// }


class Account extends AccountModel {
  static async getAccountById(id, filter) {
    try {
      const account = await this.findById(id);
      if (account) {
        const result = filter ?
          H.filter(account._doc, filter) :
          account._doc;
        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.ACCOUNT_RETRIEVED,
          result
        );
      } else {
        return ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      }
    } catch (err) {
      return ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getAccountByEmail(email, filter) {
    const account = await this.findOne({
      email,
    });
    if (account) {
      const result = filter ?
        H.filter(account._doc, filter) :
        account._doc;
      return result;
    }
    return null;
  }

  static async createAccount(body) {
    try {
      let {
        email,
        password,
        type
      } = body;
      type = H.getRoleNumber(type || "user");
      const user = await this.getAccountByEmail(email);

      if (!user) {
        // hash the password
        password = H.hashPassword(password);
        const passwordArchived = [H.encrypt(password)];
        const data = {
          email,
          password,
          role: type,
          passwordArchived,
        };

        if ([ADMIN, SUPERADMIN].includes(type) === false) {


        }
        const account = await this.create(data);

        // setup profile
        const profile = await ProfileService.setUpProfile(account._id, body);

        // setup bank
        await Bank.open(profile._id)
        // setup notification activity
        await Notification.init(profile._id)

        if ([USER].includes(type)) {
          profile.role = account.role;

          // send notification
          await MailNotificationService.sendApplicationNotification({
            to: email,
            name: profile.name,
          });

          await MailNotificationService.sendVerificationEmail({
            to: email,
            name: profile.name,
          });

        } else {
          // send notification
          await MailNotificationService.sendVerificationEmail({
            to: email,
            name: profile.firstNam,
          });
        }


        return ApiResponse.gen(HTTP_CREATED, responseMessage.ACCOUNT_CREATED);
      } else {
        throw ApiResponse.gen(
          HTTP_CONFLICT,
          responseMessage.ACCOUNT_ALREADY_EXISTS
        );
      }
    } catch (err) {
      logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  static async login({
    email,
    password
  }, referrer) {
    try {
      let user = await this.getAccountByEmail(email);
      if (user) {
        if ([USER].includes(user.role) && referrer == ADMIN) {
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ONLY_ADMINS_ACCESS
          );
        } else if (
          [ADMIN, SUPERADMIN].includes(user.role) &&
          referrer == USER
        ) {
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ONLY_FELLOWS_ACCESS
          );
        }
        // console.log([USER, ADMIN].includes(user.role) &&
        // user.status === SUSPENDED)
        if (
          [USER, ADMIN].includes(user.role) &&
          user.status === SUSPENDED
        )
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ACCOUNT_SUSPENDED
          );
        else if (
          [USER, ADMIN, SUPERADMIN].includes(user.role) &&
          user.status === DELETED
        )
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ACCOUNT_NOT_FOUND
          );

        const passwordMatches = H.comparePassword(user.password, password);

        if (passwordMatches) {
          let profile = await ProfileService.getProfileByAccountId({
              user: user._id,
            }),
            pid = profile._id;

          const token = H.generateUserToken(user._id, user.role, pid);
          logger.info(`${user.email} logged in successfully`);

          // update last login
          await this.findByIdAndUpdate(user._id, {
            lastLogin: dayjs(new Date()).format('YYYY-MM-DD HH:mm'),
          });
console.log(H.getRoleName, user);
          return ApiResponse.gen(
            HTTP_OK,
            responseMessage.ACCOUNT_LOGGED_IN, {
              token,
              type: H.getRoleName(user.role)
            }
          );
        }

        throw ApiResponse.gen(
          HTTP_BAD_REQUEST,
          responseMessage.PASSWORD_INCORRECT
        );
      }
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND);
    } catch (err) {
      logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async toggleUserApproval(id) {
    try {
      let enabled, disabled;
      const user = await this.findById(id);
      if (!user) {
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      }
      const {
        name
      } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'name',
      });

      if ([ACTIVE, INACTIVE].includes(user.status)) {
        disabled = await this.findByIdAndUpdate(id, {
          status: SUSPENDED,
        });
        if (disabled) {
          delete disabled._doc.password;
          delete disabled._doc.passwordArchived;

          // await MailNotificationService.sendSuspensionMail({
          //   to: user.email,
          //   name: name,
          // });

          return ApiResponse.gen(
            HTTP_OK,
            responseMessage.ACCOUNT_DISABLED,
            disabled
          );
        } else
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.ACCOUNT_DISABLED_FAILED
          );
      } else {
        enabled = await this.findByIdAndUpdate(id, {
          status: ACTIVE,
        });
        if (enabled) {
          delete enabled._doc.password;
          delete enabled._doc.passwordArchived;

          // await MailNotificationService.sendSuspensionRevokedMail({
          //   to: enabled.email,
          //   role: enabled.role,
          //   name: name,
          // });
          return ApiResponse.gen(
            HTTP_OK,
            responseMessage.ACCOUNT_ENABLED,
            enabled
          );
        } else
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.ACCOUNT_ENABLED_FAILED
          );
      }
    } catch (err) {
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async updateApplicationStatus(id, status) {
    try {
      const user = await this.findById(id);
      const {
        name
      } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'name',
      });
      if (!user)
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.APPLICATION_NOT_FOUND
        );

      let updated = await this.findByIdAndUpdate(id, {
        applicationStatus: status,
        isEnabled: status.toLowerCase() === 'accepted' ? true : false,
      });

      if (updated) {
        // send application update email
        await MailNotificationService.sendAppStatusEmail({
          to: user.email,
          name: name,
          status: updated.applicationStatus,
          defaultPassword: H.decrypt(updated.defaultPassword),
        });
        if (updated.applicationStatus === 'accepted') {
          // send account verification email
          await MailNotificationService.sendVerificationEmail({
            to: user.email,
            name: name,
          });
        }

        delete updated._doc.password;
        delete updated._doc.passwordArchived;

        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.APPLICATION_STATUS_UPDATED,
          updated
        );
      } else
        throw ApiResponse.gen(
          HTTP_INTERNAL_SERVER_ERROR,
          responseMessage.APPLICATION_STATUS_UPDATED_FAILED
        );
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      return ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async updateUserChatStatus(id, onlineChatStatus) {
    try {
      await this.findByIdAndUpdate(id, {
        onlineChatStatus: onlineChatStatus,
      });

      return ApiResponse.gen(HTTP_OK, responseMessage.ACCOUNT_UPDATED, {});
    } catch (err) {
      logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async deleteAccount(id) {
    try {
      const account = await this.findByIdAndDelete(id);
      const {
        name
      } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'name',
      });
      if (account) {
        // send notification
        await MailNotificationService.sendAccountDeletedEmail({
          to: account.email,
          name: name,
        });
        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.ACCOUNT_DELETED,
          account
        );
      } else {
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      }
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async resendVerificationEmail(id, pid) {
    try {
      const {
        data
      } = await this.getAccountById(id);
      const {
        name
      } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'name',
      });
      if (data) {
        // send notification
        await MailNotificationService.sendVerificationEmail({
          to: data.email,
          name: name,
        });

        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.VERIFICATION_EMAIL_SENT
        );
      }
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND);
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async verifyAccount(secure) {
    try {
      const token = H.decrypt(secure);
      const user = H.verifyToken(token);

      if (user === 'token_expired' || user === 'invalid signature') {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.LINK_EXPIRED);
      }

      if (user === 'token_expired' || user === 'invalid signature') {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.LINK_EXPIRED);
      }

      if (token) {
        const account = await this.getAccountByEmail(user.email);

        if (account) {
          if (account.status == ACTIVE) {
            throw ApiResponse.gen(
              HTTP_BAD_REQUEST,
              responseMessage.ACCOUNT_ALREADY_VERIFIED
            );
          } else {
            account.status = ACTIVE;
            await this.findByIdAndUpdate(account._id, account);
            return ApiResponse.gen(HTTP_OK, responseMessage.ACCOUNT_VERIFIED);
          }
        }
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      } else
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.INVALID_TOKEN);
    } catch (err) {
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async changePassword(id, data) {
    try {
      const account = await this.findById(id);
      const {
        name
      } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'name',
      });

      const passwordMatches = H.comparePassword(
        account.password,
        data.oldPassword
      );
      // ensures that the provided password matches the database password
      if (!passwordMatches) {
        const msg = `Old ${responseMessage.PASSWORD_INCORRECT.toLowerCase()}`;
        throw ApiResponse.gen(HTTP_BAD_REQUEST, msg);
      }

      // ensures that the new password is not one of the old passwords
      let isUsedPassword = false;
      for (let archivedPassword of account.passwordArchived) {
        if (H.decrypt(archivedPassword) == data.password)
          isUsedPassword = true;
      }
      if (isUsedPassword) {
        throw ApiResponse.gen(
          HTTP_BAD_REQUEST,
          responseMessage.PASSWORD_ALREADY_USED
        );
      }
      // change the password if provided password matches the database password and new password has not been used before
      else if (passwordMatches && !isUsedPassword) {
        const passwordArchived = [
          ...account.passwordArchived,
          H.encrypt(data.oldPassword),
        ];
        const password = H.hashPassword(data.password);
        const result = await this.findByIdAndUpdate(id, {
          password,
          passwordArchived,
        });
        if (result) {
          if (account.defaultPassword) {
            await this.findByIdAndUpdate(id, {
              defaultPassword: null,
            });
          }
          // send notification
          await MailNotificationService.sendChangedPasswordEmail({
            to: account.email,
            role: account.role,
            name: name,
          });

          return ApiResponse.gen(HTTP_OK, responseMessage.PASSWORD_CHANGED);
        } else {
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.PASSWORD_CHANGED_FAILED
          );
        }
      }
    } catch (err) {
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async forgotPassword(email) {
    const user = await this.findOne({
      email,
    });
    if (!user) {
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND);
    }
    const {
      name
    } = await ProfileService.getProfileByAccountId({
      user: user._id,
      filter: 'name',
    });
    await MailNotificationService.sendResetPasswordMail({
      to: email,
      role: user.role,
      name: name,
    });

    return ApiResponse.gen(HTTP_OK, responseMessage.FORGOT_PASSWORD);
  }

  static async resetPassword(data) {
    try {
      const token = H.decrypt(data.secure);
      const user = H.verifyToken(token);

      if (user === 'token_expired' || user === 'invalid signature') {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.LINK_EXPIRED);
      }
      if (token) {
        const account = await this.getAccountByEmail(user.email);
        if (account) {
          for (let encryptedPassword of account.passwordArchived) {
            if (H.decrypt(encryptedPassword) == data.password) {
              throw ApiResponse.gen(
                HTTP_FORBIDDEN,
                responseMessage.PASSWORD_ALREADY_USED
              );
            }
          }
          const password = H.hashPassword(data.password);
          const passwordArchived = [
            ...account.passwordArchived,
            H.encrypt(data.password),
          ];

          const result = await this.findByIdAndUpdate(account._id, {
            password,
            passwordArchived,
          });

          if (result) {
            return ApiResponse.gen(HTTP_OK, responseMessage.PASSWORD_RESET);
          }
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.PASSWORD_RESET_FAILED
          );
        }
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.INVALID_TOKEN);
      }
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getAllUsers(data) {
    let {
      type,
      email,
      createdAt,
    } = data;

    data.limit = parseInt(data.limit) || 10;
    data.skip = parseInt(data.skip) > 0 ? parseInt(data.skip) - 1 : 0;
    type = type || USER
    try {
      let filter = {
        role: type,
        email,
        createdAt,
      };

      if (!type) delete filter.role;
      if (!email) delete filter.email;
      if (!createdAt) delete filter.createdAt;

      if (createdAt) {
        // filter.role = type || FELLOW;

        const date = new Date();
        date.setHours(0, 0, 0, 0);
        filter.createdAt = {
          $gte: dayjs(date)
            .subtract(createdAt || 7, 'day')
            .toISOString(),
        };
      }

      let users = await AccountModel.find(filter)
        .skip(data.skip * data.limit)
        .limit(data.limit)
        .sort({
          createdAt: -1,
        });

      let userIds = users.map((user) => user._id);

      users = await ProfileModel
        .find(filter)
        .where('user')
        .in(userIds)
        .populate('user')
        .sort({
          createdAt: -1,
        })
        .exec();

      filter.skip = data.skip;
      filter.limit = data.limit;
      const pageCount = await this.countDocuments(filter);

      data = {
        data: users,
        totalPages: Math.ceil(pageCount / data.limit) || 1,
        page: parseInt(data.skip) + 1,
        perPage: parseInt(data.limit) || pageCount,
        pageCount: users.length,
      };
      return ApiResponse.gen(HTTP_OK, 'Retrieved successfully', data);
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.PROFILE_NOT_FOUND);
    }
  }

  static async getActiveUsers(obj) {
    try {
      obj.skip = obj.offset || 0;

      const filt = {
        status: {
          $nin: [SUSPENDED],
        },
        role: {
          $nin: [SUPERADMIN, ADMIN],
        },
      };

      const filter = {
        lastLogin: {
          $gte: dayjs(new Date())
            .subtract(obj.for || 3, 'day')
            .format('YYYY-MM-DD'),
        },
        ...filt,
      };

      const aggregation = [{
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'user',
          as: 'profile',
        }
      }];

      obj.limit = parseInt(obj.limit) || 10;
      obj.skip = parseInt(obj.skip) > 0 ? parseInt(obj.skip) - 1 : 0;

      let users = await this.aggregate(aggregation)
        .match(filter)
        .skip(obj.skip * obj.limit)
        .limit(obj.limit)
        .sort({
          lastLogin: -1,
        });

      users = users.map((user) => {
        delete user.password;
        delete user.passwordArchived;
        return user;
      });
      const pageCount = await this.countDocuments(filter);
      const data = {
        data: users,
        totalPages: Math.ceil(pageCount / obj.limit) || 1,
        page: parseInt(obj.skip) + 1,
        perPage: parseInt(obj.limit) || pageCount,
        pageCount: users.length,
      };

      return ApiResponse.gen(HTTP_OK, 'Retrieved successfully', data);
    } catch (e) {
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async upgradeUser(id, {
    type
  }) {
    const {
      data
    } = await this.getAccountById(id, 'role');
    logger.warn(data.role, type)
    if (data.role === type) {
      throw ApiResponse.gen(HTTP_CONFLICT, `User is already a ${type.toUpperCase()}`);
    }
    const user = await this.findByIdAndUpdate(id, {
      role: type,
    });

    if (user) {

      if (type === ADMIN) {
        const {
          name
        } = await ProfileService.getProfileByAccountId({
          user: id,
          filter: 'name'
        })
        await MailNotificationService.ugmsg({
          to: user.email,
          name: name
        })
      }
      return ApiResponse.gen(HTTP_OK, 'User upgraded successfully');
    } else {
      throw ApiResponse.gen(HTTP_NOT_FOUND, 'Failed to upgrade user');
    }
  }
}

module.exports = Account;