const mongoose = require('../db.js');
const bcrypt = require('bcrypt-nodejs');
const Token = require('./Token.js');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

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
    default: 0,
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
      // no editor? instant error
      if (!user.editor) {
        return next(permissionsError);
      }
      const editor = await User.findOne({_id: user.editor});
      if (!editor) {
        return next(new Error('Editor required to edit user'));
      }
      if (editor.isNormalUser()) {
        return next(permissionsError);
      } 
      if (user.isModified('role') && editor.role < user.role) {
        return next(new Error('You cannot promote beyond your role'));
      } else if (!user.isModified('role') && editor.role <= user.role) {
        console.log(`editor ${editor.email} is less or equal to user ${user.email} role!`);
        return next(permissionsError);
      }
    } else if (user.isModified('role')) {
      return next(new Error('You cannot change your own role'));
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
  user.editor = null;
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

userSchema.set('toObject', {
  transform: (doc, ret, opt) => {
   delete ret.password;
   return ret;
  }
});

userSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
   delete ret.password;
   return ret;
  }
});


/**
 * MODEL
 */
const User = mongoose.model('User', userSchema);
module.exports = User;