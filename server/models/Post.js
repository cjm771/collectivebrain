const mongoose = require('../db.js');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

/**
 * SCHEMA
 */

 const imageSchema = mongoose.Schema({
    src: {
      type: String,
      required: true
    },
    src_thumb: {
      type: String
    },
    caption: {
      type: String
    }
 });

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    default: false
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  creator: {
    type: String
  },
  description: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  category: {
    type: Number,
    required: [true, 'category required'],
    default: 0,
    validate: {
      validator: function(val) {
        if (val < 0 || val > Object.keys(this.schema.statics.CATEGORIES).length - 1) {
          return false;
        } else {
          return true;
        }
      }, message: 'Not valid category type'
    }
  },
  sources: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  images: [imageSchema]
});

/**
 * PRE HANDLERS
 */
postSchema.pre('save', async function (next) {
  const post = this;
  next();
});

/**
 * STATICS
 */
postSchema.statics.CATEGORIES = {
  UNCATEGORIZED: 0,
  PRECEDENT: 1,
  BOOK: 2,
  PERIODICAL: 3,
  ONLINE_CONTENT: 4,
  ACADEMIC_SOURCE: 5,
  REPRESENTATION: 6
};

/**
 * METHODS
 */
// userSchema.methods.isNormalUser = function() {
//   return this.role === this.schema.statics.USER_ROLES.USER;
// };


/**
 * MODEL
 */
const Post = mongoose.model('Post', postSchema);
module.exports = Post;