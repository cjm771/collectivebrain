require('dotenv').config();

const path = require('path');
const express = require('express');
const expressStaticGzip = require("express-static-gzip");

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
  app.delete('/fileUpload', fileUploadView);
  app.get('/post/static/:id', staticImageCardView);
  // app.use('/', express.static(path.join(__dirname, '../client/dist/')));
  app.use('/', expressStaticGzip(path.resolve(__dirname, '../client/dist/'), {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: function (res, path) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    }
  }));
  app.use('/uploads', express.static(path.join(__dirname, './uploads')));
  

});

