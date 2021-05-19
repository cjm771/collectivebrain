const mongoose = require('../db.js');
const User = require('./User.js');

/**
 * SCHEMA
 */ 

const graphSettingsSchema = new mongoose.Schema({
  velocityDecay2D: {
    type: Number,
    default: null
  },
  velocityDecay3D: {
    type: Number,
    default: null
  }
});

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
  graphSettings: {
    
    type: graphSettingsSchema,
    default: () => ({})
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
});


groupSchema.pre('save', async function (next) {
  const group = this;
  
  if (!group.isNew) {
    next();
  }
  group.lastEditedBy = group.editor;
  group.editor = null;
  next();
});


/**
 * METHODS
 */

/**
 * MODEL
 */
const Group = mongoose.model('Group', groupSchema);
module.exports = Group;