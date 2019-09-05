const mongoose = require('../db.js');
const Schema = mongoose.Schema;
const shortUUID = require('short-uuid');

/**
 * SCHEMA
 */
const tokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: [true, 'token required']
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: {
    type: Number,
    required: [true, 'type required']
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
  VALIDATION: 1,
  FORGOT_PASSWORD: 2
};

/**
 * MODEL
 */
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;