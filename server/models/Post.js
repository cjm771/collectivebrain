const mongoose = require('../db.js');
const Schema = mongoose.Schema;
const User = require('../models/User.js');

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
}, {
  timestamps: true
});

/**
 * PRE HANDLERS
 */
postSchema.pre('save', async function (next) {
  const post = this;

  if (post.isNew) { // new user

  } else { // existing user
    const permissionsError = new Error('You are not permitted to edit this post');
    if ( post.editor !== post.user._id) {
      // no editor? instant error
      if (!post.editor) {
        return next(permissionsError);
      }
      const editor = await User.findOne({_id: post.editor});
      if (!editor) {
        return next(new Error('Editor required to edit user'));
      }
      if (editor.isNormalUser()) {
        return next(permissionsError);
      } else if (editor.role <= post.user.role) {
        return next(permissionsError);
      }
    } 
  }
  post.editor = null;
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

postSchema.statics.COLORS = [
  '#cccccc',
  '#ff5252',
  '#7c4dff',
  '#64ffda',
  '#69f0ae',
  '#ffd740',
  '#ffab40',
  '#ff6e40',
  '#eeff41',
];

postSchema.statics.getCategoryIndexByName = function (name) {
  return postSchema.statics.CATEGORIES[name.toUpperCase()];
};

postSchema.statics.getCategoryColorByName = function (name) {
  return postSchema.statics.COLORS[postSchema.statics.getCategoryIndexByName(name)]
};

postSchema.statics.getCategoryName = (val) => {
  const keys = Object.keys(postSchema.statics.CATEGORIES);
  if (typeof val !== 'number' ||val < 0 || val > keys.length - 1 ) {
    throw new Error(`Invalid value to look up: ${val}`);
  } else {
    return keys.filter((key) => {
      return val === postSchema.statics.CATEGORIES[key];
    })[0];
  }
}

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