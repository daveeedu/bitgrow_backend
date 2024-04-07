const mongoose = require('mongoose');
mongoose.set('returnOriginal', false);

const { Schema, model } = mongoose;

const userProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Accounts',
      required: true,
      populate: {
        path: 'user',
        select: '-password -passwordArchived',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 100,
    },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    userName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    referrer: {
      type: String,
      trim: true,
      default: null,
      maxlength: 300,
    },
    merchantId: String,
    number: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    country: {
      type: String,
      trim: true,
      minlength: 3,
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    
    socialLinks: {
      type: {
        facebook: {
          type: String,
          trim: true,
        },
        twitter: {
          type: String,
          trim: true,
        },
        linkedin: {
          type: String,
          trim: true,
        },
        instagram: {
          type: String,
          trim: true,
        },
        youtube: {
          type: String,
          trim: true,
        },
      },
    },
    
  },
  {
    timestamps: true,
  }
);

const preferenceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Accounts',
      required: true,
      populate: {
        path: 'user',
        select: '-password -passwordArchived',
      },
    },
    dateFormat: {
      type: String,
      default: "MM/DD/YYYY"
    },
    language: {
      type: String,
      trim: true,
      default: "English (United State)"
    },
    theme: {
      type: String,
      default: "Default",
    },
    currency: {
      type: String,
      trim: true,
      default: "BTC",
    },
  },
  {
    timestamps: true,
  }
);

const ProfileModel =  model('profile', userProfileSchema),
PreferenceModel = model("preference", preferenceSchema);

module.exports = {
  ProfileModel,
  PreferenceModel
}