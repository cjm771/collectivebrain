const mongoose = require('mongoose');
const bluebird = require('bluebird');
const bcrypt = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;
mongoose.Promise = bluebird;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/collectivebrain';

mongoose.connect(mongoURI, {useNewUrlParser: true, 'useFindAndModify': false}).then(() => {
  console.log('connected to mongo!');
}).catch((e) => {
  console.error('could not connect to database', e);
})

const USER_ROLES = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2
}

// user schema
const userSchema = mongoose.Schema({
  name: String,
  email: {
    type: String,
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
  }
});

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
})

const User = mongoose.model('User', userSchema);

module.exports = {
  /**
   * @param {{}} user object representing a user
   */
  createUser: (user) => {
    return new Promise((resolve, reject) => {
      const userModel = new User(
       user //lets just create the new model
      );
      userModel.save((err, doc) => { // callback
        if (err) {
          reject('Error when trying to update user: ' + err);
        } else {
          resolve(doc);
        }
      });
    })
  }
};