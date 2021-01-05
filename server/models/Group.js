const mongoose = require('../db.js');
const User = require('./User.js');

/**
 * SCHEMA
 */ 

const groupSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function() {
        return new Promise((res, rej) =>{
          Group.findOne({name: this.name, _id: {$ne: this._id}})
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
      }, message: 'Name Already Taken'
    }
  },
  lastEditedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
}, {
  timestamps: true
});



/**
 * PRE HANDLERS
 */

groupSchema.pre('remove', async function (next) {
  const permissionsError = new Error('You are not permitted to remove this group');
  const canBeEdited = await group.canBeEdited();
  next(canBeEdited ? undefined : permissionsError);
});


groupSchema.pre('save', async function (next) {
  const group = this;
  
  if (!group.isNew) {
    const permissionsError = new Error('You are not permitted to edit this group');
    if (await group.canBeEdited()) {
      next()
    } else {
      next(permissionsError);
    }
  }
  group.lastEditedBy = group.editor;
  group.editor = null;
  next();
});


/**
 * METHODS
 */

groupSchema.methods.canBeEdited = async function(editorId=this.editor) {
  const editor = await User.findOne({_id: editorId});
  if (!editor) {
    return false;
  }
  if (!editor.isAdmin()) {
    return false;
  }
  return true;
};

/**
 * MODEL
 */
const Group = mongoose.model('Group', groupSchema);
module.exports = Group;