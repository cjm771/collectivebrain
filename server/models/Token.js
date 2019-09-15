const mongoose = require('../db.js');
const Schema = mongoose.Schema;
const shortUUID = require('short-uuid');
/**
 * SCHEMA
 */
const metaDataSchema = mongoose.Schema({
    name: String,
    role: Number,
    email: {
      type: String,
      match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Invalid Email address`],
      validate: {
        validator: function() {
          return new Promise((res, rej) =>{
            User.findOne({email: this.email, _id: {$ne: this._id}})
                .then(data => {
                    if(data) {
                        res(false)
                    } else {
                        res(true)
                    }
                })
                .catch(err => {
                    res(false)
                })
          })
        }, message: 'Email Already a member'
      }
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
})

const tokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: [true, 'token required']
  },
  metaData: metaDataSchema,
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
  VERIFICATION: 1,
  FORGOT_PASSWORD: 2
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