'use strict';

const { INTERNAL_SERVER_ERROR } = require('../utils/http.response.message');
const {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http.response.code');

const ApiResponse = require('../utils/http.response');

const {
  accountSchema,
  changePasswordSchema,
  profileSchema,
  imageSchema,
  projectImageSchema,
  cvSchema,
  cImageSchema,
  adminSignupSchema,
  userSignupSchema,
  projectSchema,
  updateProjectSchema,
  createWikiSchema,
  createVideoSchema,
  updateVideoSchema,
  cc,
  forgotPasswordSchema,
  updateWikiSchema,
  updateAppStatusSchema,
  portfolioProjectStatusSchema,
  resetPasswordSchema,
  supportGroupSchema,
  supportGroupChatSchema,
  testimonySchema,
  upgradeUserSchema,
  transactionSchema,
  joinWaitlist,
  validateTopUp
} = require('../utils/request.schema');
const validator = require('../utils/validator');

let { ADMIN, SUPERADMIN, USER } = require('../utils/role');
const logger = require('../logger');
ADMIN = H.getRoleName(ADMIN)
SUPERADMIN = H.getRoleName(SUPERADMIN)
USER = H.getRoleName(USER);

class BodyValidator {
   async u(schema, {
      req,
      res,
      next
   }) {
      try {
         logger.info(schema)
         const valid = await validator(schema, req.body);
         if (valid.ok) {
            res.locals.validatedBody = valid.data;
            next();
         } else res.status(valid.code).json(valid);
      } catch (err) { 
         logger.error(err);

         res.status(HTTP_INTERNAL_SERVER_ERROR).json(ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, err));
      }
   }

   static async signup(req, res, next) {
     let schema;
     if ([ADMIN, SUPERADMIN].includes(req.body.type)) {
       schema = adminSignupSchema;
      } else {
      const pp = req.body.privacyPolicy;
        req.body.privacyPolicy = pp === "on" ? true : false;
        console.log("In else")
         req.body.merchantId = H.generateRandomString(10, "alphabetic");
         schema = userSignupSchema;
         logger.info(req.body.email+" marchant ID is: " + req.body.merchantId);
      }


      
      if ([ADMIN, SUPERADMIN, USER].includes(req.body.type)) {
         await new BodyValidator().u(schema, {
            req,
            res,
            next
         });
      }
   }

  static async login(req, res, next) {
    await new BodyValidator().u(accountSchema, {
      req,
      res,
      next,
    });
  }

  static async validateTopUp(req, res, next) {
    await new BodyValidator().u(validateTopUp, {
      req,
      res,
      next,
    });
  }

  static async updateAccount(req, res, next) {
    let valid;
    if (
      Object.keys(req.body).includes('email') ||
      Object.keys(req.body).includes('password')
    ) {
      valid = accountSchema;
    } else {
      if (Object.keys(req.body).includes('fullName')) {
        req.body.firstName = req.body.fullName.split(' ')[0];
        req.body.lastName = req.body.fullName.split(' ')[1];
        delete req.body.fullName;
      }
      valid = profileSchema;
    }
    await new BodyValidator().u(valid, {
      req,
      res,
      next,
    });
  }

  static async changePassword(req, res, next) {
    await new BodyValidator().u(changePasswordSchema, {
      req,
      res,
      next,
    });
  }


    static async  transaction (req, res, next) {
      if (req.body.tags instanceof Array === false && req.body.tags) {
        req.body.tags = req.body.tags.split(',');
      }
      await new BodyValidator().u(transactionSchema, {
        req,
        res,
        next
     });
    }

  static async uploadAvatar(req, res, next) {
    await new BodyValidator().u(imageSchema, {
      req,
      res,
      next,
    });
  }



  static async validateUpdateWiki(req, res, next) {
    await new BodyValidator().u(updateWikiSchema, {
      req,
      res,
      next,
    });
  }

   static async uploadCover(req, res, next) {
      await new BodyValidator().u(cImageSchema, {
         req,
         res,
         next
      })
   }


  static async validateUpdateVideo(req, res, next) {
    if (req.body.tags instanceof Array === false && req.body.tags) {
      req.body.tags = req.body.tags.split(',');
    }
    await new BodyValidator().u(updateVideoSchema, {
      req,
      res,
      next,
    });
  }

  static async cc(req, res, next) {
    await new BodyValidator().u(cc, {
      req,
      res,
      next,
    });
  }

   static async forgotPassword(req, res, next) {
      await new BodyValidator().u(forgotPasswordSchema, {
         req,
         res,
         next
      });
   }

   static async resetPassword(req, res, next) {
      await new BodyValidator().u(resetPasswordSchema, {
         req,
         res,
         next
      });
   }

  static async validateCreateVideo(req, res, next) {
    await new BodyValidator().u(createVideoSchema, {
      req,
      res,
      next,
    });
  }

  static async upgradeUser (req, res, next) {
    await new BodyValidator().u(upgradeUserSchema, {
      req,
      res,
      next,
    });
  }
 

}

module.exports = BodyValidator;
