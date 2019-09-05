const mongoose = require('../db.js');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const SALT_WORK_FACTOR = 10;
const USER_ROLES = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2
};

/**
 * SCHEMA
 */
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, `Please fill valid email address`],
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
      }, message: 'Email Already Taken'
    }
  },
  password: {
    type: String,
    required: [true, 'Password required']
  },
  role: {
    type: Number,
    default: USER_ROLES.USER,
    required: [true, 'Role required'],
  },
  tokens: [{ type: Schema.Types.ObjectId, ref: 'Token' }],
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post'}]
});

/**
 * PRE HANDLERS
 */
userSchema.pre('save', function (next) {
  const user = this;
  if (user.password) {
      // this.password = hashPassword(this.password)
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) return next(err);
          user.password = hash;
          next();
        });
        if (err) return next(err);
      });
  }
  next();
});

/**
 * STATICS
 */
userSchema.statics.USER_ROLES = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2
};

/**
 * MODEL
 */
const User = mongoose.model('User', userSchema);
module.exports = User;