require('dotenv').config();

const path = require('path');
const express = require('express');
const expressStaticGzip = require("express-static-gzip");
const Thumbnailer = require('node-threejs-thumbnailer').default;

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
  app.get('/obj-thumbnailer', function (req, res) {
    Thumbnailer.renderUrl(req.query.url, [
      {
        width: 1920,
        height: 1200,
      }
    ])
    .then((thumbnailPngStreams) => {
      // thumbnails is an array (in matching order to your requests) of WebGlRenderTarget objects
      // you can write them to disk, return them to web users, etc
      res.setHeader('Content-Type', 'image/png');
      thumbnailPngStreams[0].pipe(res);
    })
    .catch(function (err) {
      res.status(500);
      res.send("Error thumbnailing: " + err);
      console.error(err);
    });
  });
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

