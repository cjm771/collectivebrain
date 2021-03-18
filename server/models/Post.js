const mongoose = require('../db.js');

const User = require('./User.js');
const File = require('./File.js');
const { debug } = require('webpack');

/**
 * SCHEMA
 */ 

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
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group'
  },
  lastEditedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
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
  subCategory: {
    type: Number,
    default: 0,
    validate: {
      validator: function(val) {
        if (val < 0 || val > Object.keys(this.schema.statics.SUB_CATEGORIES).length - 1) {
          return false;
        } else {
          return true;
        }
      }, message: 'Not valid sub category type'
    }
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
  images: [File.schema],
  files: [File.schema],
}, {
  timestamps: true
});



/**
 * PRE HANDLERS
 */

postSchema.pre('remove', async function (next) {
  const permissionsError = new Error('You are not permitted to remove this post');
  const canBeEdited = await post.canBeEdited();
  next(canBeEdited ? undefined : permissionsError);
});


postSchema.pre('save', async function (next) {
  const post = this;
  
  if (!post.isNew) {
    const permissionsError = new Error('You are not permitted to edit this post');
    if (await post.canBeEdited()) {
      next()
    } else {
      next(permissionsError);
    }
  }
  post.lastEditedBy = post.editor;
  post.editor = null;

  next();
});

/**
 * PROPERTY
 */

postSchema.virtual('categoryName').get(function () {
  return postSchema.statics.getCategoryName(this.category);
});

/**
 * METHODS
 */


postSchema.methods.canBeEdited = async function(editorId=this.editor) {
  const post = this;
  const author = await User.findOne({ _id: post.user });
  if (!author) {
    return true;
  }
  if ( String(editorId) !== String(post.user._id)) {
    // no editor? instant error
    if (!editorId) {
      return false;
    }
    const editor = await User.findOne({_id: editorId});
    if (!editor) {
      return false;
    }
    if (editor.isNormalUser()) {
      return false;
    } else if (editor.role !== User.USER_ROLES.ADMIN && editor.role <= author.role) {
      return false;
    }
  } 
  return true;
};

postSchema.methods.moveTmpFiles = async function(user) {
  if (await this.canBeEdited(user.id)) {
    if (this.files && this.files.length) {
      for (file of this.files) {
          try {
            this.editor = user._id;
            await file.uploadFile();
            await this.save();     
          } catch (e) {
            throw new Error(`Could not move file from tmp: ${e}`);
            throw new Error(`Could not move file from tmp: ${e.message || e.toString()}`);
          }  
      }
    }
    return true;
  } else {
    throw new Error('You are not permitted to delete the files from this post');
  }
};

postSchema.methods.deleteFiles = async function() {
  const result = {deleted: [], notDeleted: []};
  if (await this.canBeEdited()) {
    if (this.files && this.files.length) {
      for (file of this.files) {
        try {
            await file.deleteFile();
            result.deleted.push(file);
        } catch (e) {
          result.notDeleted.push(file);
        }
      }
    }
    return result;
  } else {
    throw new Error('You are not permitted to delete the files from this post');
  }
};

/**
 * STATICS
 */

postSchema.statics.CATEGORIES = {
  UNCATEGORIZED: 0,
  WRITTEN: 1,
  DRAWN: 2,
  BUILT: 3, 
  CAPTURED: 4, 
};

postSchema.statics.CATEGORY_COLORS = [
  '#cccccc',
  '#ff00fd',
  '#ff0000',
  '#ffff00',
  '#00ff00'
];


postSchema.statics.SUB_CATEGORIES = {
  UNCATEGORIZED: 0,
  PRECEDENT: 1,
  BOOK: 2,
  PERIODICAL: 3, 
  ONLINE_CONTENT: 4, 
  ACADEMIC_SOURCE: 5, 
  REPRESENTATION: 6
};

postSchema.statics.SUB_CATEGORY_COLORS = [
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

const SUB_CATEGORIES_TO_CATEGORIES_MAPPINGS =  {
  UNCATEGORIZED: ['UNCATEGORIZED'],
  WRITTEN: ['BOOK', 'PERIODICAL', 'ACADEMIC_SOURCE'],
  DRAWN: ['REPRESENTATION'],
  BUILT: ['PRECEDENT'],
  CAPTURED: ['ONLINE_CONTENT']
};

postSchema.statics.getCategoryIndexfromBySubCategoryName = function (name) {
  let tmpArr = [];
  let result = null;
  Object.keys(SUB_CATEGORIES_TO_CATEGORIES_MAPPINGS).forEach((key) => {
    tmpArr = SUB_CATEGORIES_TO_CATEGORIES_MAPPINGS[key];
    if (tmpArr.indexOf(name.toUpperCase()) !== -1) {
      result = postSchema.statics.CATEGORIES[key];
    }
  });
  return result;
}

postSchema.statics.getSubCategoryIndexByName = function (name) {
  return postSchema.statics.SUB_CATEGORIES[name.toUpperCase()];
};

postSchema.statics.getCategoryIndexByName = function (name) {
  return postSchema.statics.CATEGORIES[name.toUpperCase()];
};


postSchema.statics.getSubCategoryColorByName = function (name) {
  return postSchema.statics.SUB_CATEGORY_COLORS[postSchema.statics.getCategoryIndexByName(name)]
};

postSchema.statics.getCategoryColorByName = function (name) {
  return postSchema.statics.CATEGORY_COLORS[postSchema.statics.getCategoryIndexByName(name)]
};

postSchema.statics.getSubCategoryName = (val) => {
  const keys = Object.keys(postSchema.statics.SUB_CATEGORIES);
  if (typeof val !== 'number' ||val < 0 || val > keys.length - 1 ) {
    throw new Error(`Invalid value to look up: ${val}`);
  } else {
    return keys.filter((key) => {
      return val === postSchema.statics.SUB_CATEGORIES[key];
    })[0];
  }
}

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


/**
 * MODEL
 */
const Post = mongoose.model('Post', postSchema);
module.exports = Post;