const mongoose = require('mongoose');
const crypto = require('crypto');
mongoose.set('returnOriginal', false);

const {
  Schema,
  model
} = mongoose;

const accountSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 300,
  },
  passwordArchived: [{
    type: String,
    trim: true,
    minlength: 8,
    maxlength: 300,
  }, ],
  status: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
  },
  lastLogin: {
    type: String,
    default: ""
  },
  role: {
    type: Number,
    enum: [0, 1, 2],
    default: 2,
  },
}, {
  timestamps: true,
});

accountSchema.index({
  email: 1,
  role: 1,
});

module.exports = model('Accounts', accountSchema);