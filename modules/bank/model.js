const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
  Schema,
  model
} = mongoose;

const bankSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    trim: true,
  },
  balance: {
    type: Number,
    default: 0
  },
  invested: {
    type: Number,
    default: 0
  },
  profits: {
    type: String,
    default: 0
  },
  plan: {
    type: {
      name: {
        type: String,
        trim: true,
        default: ''
      },
      percentage: {
        type: Number,
        default: 0
      }
    }
  },
  walletId: {
    type: String,
    trim: true,
    default: null,
    maxlength: 200,
  },
}, {
  timestamps: true
});


const TransationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    default: 0
  },
  profit: {
    type: String,
    default: 0
  },
  plan: String,
  method: String,

}, {
  timestamps: true
})

module.exports = {
  Bank: model('bank', bankSchema),
  Transaction: model('transaction', TransationSchema)
}
