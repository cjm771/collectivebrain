const express = require('express');
const app = express();
const User = require('./models/User.js');

const PORT = process.env.MONGODB_URI || 3000;
app.listen(PORT, () => {
  console.log(`listening on ${PORT}..`);
  const user = new User();
  user.create({
    name: 'Chris',
    email: 'chris08@example.com',
    password: 'helloworld123',
  }).then(() => {
    console.log('user created');
  }).catch((error) => {
    console.log('could not create user:', error);
  });
});

