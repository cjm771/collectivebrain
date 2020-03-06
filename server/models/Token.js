require('dotenv').config();
const mongoose = require('../db.js');
const Schema = mongoose.Schema;

// resources
const shortUUID = require('short-uuid');

// services
const MailerService = require('../utils/MailerService.js');
const UserService = require('../utils/UserService.js');

/**
 * SCHEMA
 */
const metaDataSchema = mongoose.Schema({
    name: {
      type: String,
      validate: {
        validator: function(v) {
          return v.length > 3;
        },
        message: props => `${props.value} must be minimum 3 characters!`
      },
    },
    role: Number,
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      },
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
 * PROPERTY
 */

tokenSchema.virtual('url').get(function () {
  if (this.type === this.schema.statics.TOKEN_TYPES.INVITE) {
    return `${process.env.DOMAIN}/register?inviteToken=${this.token}&name=${this.metaData.name}&email=${this.metaData.email}`
  } else {
    return null;
  }
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
};

tokenSchema.methods.sendInviteEmail = async function() {
  const invite = this;
  if (MailerService.shouldSendEmails &&
      this.metaData.email &&
      this.status === this.schema.statics.STATUS.AVAILABLE &&
      this.type === this.schema.statics.TOKEN_TYPES.INVITE
    ) {
    const inviteMessage = MailerService.MESSAGES.INVITE({
      user,
      invitee: {
        token: invite.token,
        email: invite.metaData.email,
        name: invite.metaData.name,
        inviteUrl: invite.url,
        roleName: UserService.getRoleName(invite.metaData.role).toLowerCase().replace(/^[a-z]/, (m) => {
          return m.toUpperCase(); 
        })
      }
    });
    try {
      await MailerService.send(inviteMessage);
      return invite;
    } catch (e) {
      console.log('Could not mail invite email:', e);
    }
  } else {
    return invite;
  }
}


/**
 * MODEL
 */
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;