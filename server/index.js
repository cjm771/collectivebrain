require('dotenv').config();

const path = require('path');
const express = require('express');

// utils
const setupExpress = require('./utils/setupExpress');

// views
const staticImageCardView = require('./views/staticImageCard.view.js');
const fileUploadView = require('./views/fileUpload.view.js');
const logoutView = require('./views/logout.view.js');

// utils
const app = setupExpress((app) => {
  app.get('/logout', logoutView);
  app.post('/fileUpload', fileUploadView);
  app.get('/post/static/:id', staticImageCardView);
  app.use('/', express.static(path.join(__dirname, '../client/dist/')));
  app.use('/uploads', express.static(path.join(__dirname, './uploads')));
});

