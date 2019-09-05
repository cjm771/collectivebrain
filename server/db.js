const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;
const mongoURI = (process.env.NODE_ENV === 'test') ? 'mongodb://localhost/collectivebrain_test' : 'mongodb://localhost/collectivebrain';

mongoose.connect(mongoURI, {useNewUrlParser: true, 'useFindAndModify': false}).then(() => {
  console.log('connected to mongo!');
}).catch((e) => {
  console.error('could not connect to database', e);
})

module.exports = mongoose;



