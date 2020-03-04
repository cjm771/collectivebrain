const mongoose = require('../db.js');
const Schema = mongoose.Schema;
const shortUUID = require('short-uuid');
const User = require('../models/User.js');
/**
 * SCHEMA
 */
const metaDataSchema = mongoose.Schema({
    name: String,
    role: Number,
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    email: {
      type: String,
      match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Invalid Email address`],
    }
})

const tokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: [true, 'token required']
  },
  metaData: metaDataSchema,
  status: {
    type: Number,
    required: [true, 'status required'],
    default: 0
  },
  type: {
    type: Number,
    required: [true, 'type required'],
    validate: {
      validator: function(val) {
        if (val < 0 || val > Object.keys(this.schema.statics.TOKEN_TYPES).length - 1) {
          return false;
        } else {
          return true;
        }
      }, message: 'Not valid token type'
    }
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },

});

/**
 * PRE HANDLERS
 */
tokenSchema.pre('validate', function (next) {
  if (!this.token) {
    this.token = shortUUID.generate();
  }
  next();
});

/**
 * STATICS
 */
tokenSchema.statics.TOKEN_TYPES = {
  INVITE: 0,
  VERIFICATION: 1,
  FORGOT_PASSWORD: 2
};

tokenSchema.statics.STATUS = {
  AVAILABLE: 0,
  USED: 1,
  REMOVED: 2
};
/**
 * METHODS
 */
tokenSchema.methods.isInvite = function() {
  return this.type === this.schema.statics.TOKEN_TYPES.INVITE;
}

/**
 * MODEL
 */
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;