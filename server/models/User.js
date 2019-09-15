const mongoose = require('../db.js');
const bcrypt = require('bcrypt-nodejs');
const Token = require('./Token.js');
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
  token: {
    type: Token.schema
  },
  editor: {
    type: Schema.Types.ObjectId
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
userSchema.pre('save', async function (next) {
  const user = this;
  
  if (user.isNew) { // new user
    if (!user.token) {
      return next(new Error('Invite Token is Required'));
    } else if (!user.token || !user.token.isInvite() || !(await Token.findOne({token: user.token.token}))) {
      return next(new Error('Invite Token is invalid'));
    } else if (user.token.metaData && user.token.metaData.role) {
        user.role = user.token.metaData.role;
    }
    await Token.deleteOne({token: user.token.token});
  } else { // existing user
    const permissionsError = new Error('You are not permitted to edit this user');
    if ( user.editor !== user._id) {
      if (user.isNormalUser() || !user.editor || user.editor.role <= user.role) {
        return next(permissionsError);
      }
    } else if (user.isModified('role')) {
      return next(new Error('You cannot change your own role'));
    } else {
      return next();
    }
  }
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
 * METHODS
 */
userSchema.methods.isNormalUser = function() {
  return this.role === this.schema.statics.USER_ROLES.USER;
};

userSchema.methods.isModerator = function() {
  return this.role === this.schema.statics.USER_ROLES.MODERATOR;
};

userSchema.methods.isAdmin = function() {
  return this.role === this.schema.statics.USER_ROLES.ADMIN;
};


/**
 * MODEL
 */
const User = mongoose.model('User', userSchema);
module.exports = User;