const express = require('express');
const app = express();
const db = require('./db.js');

const PORT = process.env.MONGODB_URI || 3000;
app.listen(PORT, () => {
  console.log(`listening on ${PORT}..`);
  db.createUser({
    name: 'Chris',
    email: 'chris08@example.com',
    password: 'helloworld123',
  }).then(() => {
    console.log('user created');
  }).catch((error) => {
    console.log('could not create user:', error);
  });
});

