require('dotenv').config();
const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;
const mongoURI = (process.env.NODE_ENV === 'test') ? `${process.env.MONGODB_URI}/collectivebrain_test` : process.env.MONGODB_URI;

mongoose.connect(mongoURI, {useNewUrlParser: true, 'useFindAndModify': false}).then(() => {
  console.log('connected to mongo!');
}).catch((e) => {
  console.error('could not connect to database', e);
})

module.exports = mongoose;



