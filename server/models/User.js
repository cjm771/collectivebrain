const mongoose = require('../db.js');
const bcrypt = require('bcrypt');
const Token = require('./Token.js');

const UserService = require('../utils/UserService.js');
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
  activeGroup: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group'
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
    } else if (
      !user.token ||
      !user.token.isAvailable() ||
      !user.token.isInvite() ||
      !(await Token.findOne({token: user.token.token}))) {
      let extra = '';
      if (!user.token) {
        extra += ': No token on user';
      } else if (!user.token.isAvailable()) {
        extra += ': Not available, Token was used or removed.';
      } else if (!user.token.isInvite()) {
        extra += ': Token is not an invite token. Type = ' + user.token.type;
      } else if (!(await Token.findOne({token: user.token.token}))) {
        extra += ': Token could not be found';
      }
      return next(new Error('Invite Token is invalid' + extra));
    } else if (user.token.metaData && user.token.metaData.role) {
        user.role = user.token.metaData.role;
    }
    const token = await Token.findOne({token: user.token.token});
    token.status = Token.STATUS.USED;
    if (token.metaData) {
      token.metaData.user = user;
    }
    await token.save();
    if (user.password) {
      await this.updatePassword(this.password);
      next();
    }
  
  } else { // existing user
    const permissionsError = new Error('You are not permitted to edit this user');
    // no editor? instant error
    if (!user.editor) {
      return next(permissionsError);
    }
    if (String(user.editor._id) !== user.id) {
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
    } else {
      next();
    }
  }
  user.editor = null;
});

/**
 * STATICS
 */

 userSchema.statics.USER_ROLES = UserService.USER_ROLES;
userSchema.statics.getRoleName =UserService.getRoleName;

/**
 * METHODS
 */

userSchema.methods.validatePassword = async function(pw) {
  const valid = await bcrypt.compare(pw, this.password);
  return valid;
};

userSchema.methods.updatePassword = async function(pw) {
  const hash = await bcrypt.hash(pw, 10);
  this.password = hash;
  return this;
}

userSchema.methods.update = async function(data) {
  const safeFields = ['role', 'editor', 'name', 'email', 'password'];
  for (field of safeFields) {
    if (data[field] !== undefined) {
      this[field] = data[field];
    }
    if (field === 'password') {
      await this.updatePassword(this.password);
    }
  }
  await this.save();
  return this;
};


userSchema.methods.isNormalUser = function() {
  return this.role === this.schema.statics.USER_ROLES.USER;
};

userSchema.methods.isModerator = function() {
  return this.role === this.schema.statics.USER_ROLES.MODERATOR;
};

userSchema.methods.canInvite = function(role) {
  return this.getEditableRoles().indexOf(role) !== -1;
};

userSchema.methods.isAdmin = function() {
  return this.role === this.schema.statics.USER_ROLES.ADMIN;
};

userSchema.methods.getEditableRoles = function() {
  if (this.isNormalUser()) {
    return [];
  } else if (this.isModerator()) {
    return [this.schema.statics.USER_ROLES.USER];
  } else if (this.isAdmin()) {
    return [this.schema.statics.USER_ROLES.USER, this.schema.statics.USER_ROLES.ADMIN, this.schema.statics.USER_ROLES.MODERATOR];
  }
}

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