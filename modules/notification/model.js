const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
  Schema,
  model
} = mongoose;

const activities = new Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'transaction',
  },
}, {
  timestamps: true
})

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    trim: true,
  },
  activities: {
    type: [activities],
    default: []
  },
  
}, {
  timestamps: true
})

module.exports = model('notification', NotificationSchema)