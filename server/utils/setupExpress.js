require('dotenv').config();
const path = require('path');

// express
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');

// models / mongo / mongoose
const mongoose = require('../db.js');
const MongoStore = require('connect-mongo')(session);

// apollo
const {ApolloServer, gql} = require('apollo-server-express');
const typeDefs = require('../schema/typeDefs.js');
const resolvers = require('../schema/resolvers.js');

const PORT = process.env.PORT || 3000;

module.exports = async (setupRoutes) => {
  const app = express();

  app.engine('.html', exphbs({extname: '.html'}));
  app.set('views', path.resolve(__dirname, '../../client/dist/'));
  app.set('view engine', '.html');
  app.use(cookieParser());
  app.use(session({
    key: 'user_sid',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      expires: 30 * 24 * 60 * 60 * 1000 ,
      maxAge: 30 * 24 * 60 * 60 * 1000 
    }
  }));
  
  app.use(fileUpload());
  
  app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url} `);
    res.sendJSON = (data) => {
      res.status(200).end(JSON.stringify({data}));
    };
    res.errorJSON = (error, status = 400) => {
      res.status(status).end(JSON.stringify({error}));
    };
    next();
  });
  
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      req: req
    }),
    playground: {
      settings: {
        "request.credentials": "include"
      }
    }
  });
  server.applyMiddleware({ app });
  app.use(bodyParser.urlencoded({ extended: true }));
  const OK_ROUTES = [/^\/$/];
  const PROTECTED_ROUTES = [/\/dashboard\/?(.*)/];
  const SKIP_IF_LOGGED_IN_ROUTES = ['/login', '/register'];
  
  // middleware function to check for logged-in users
  const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
      res.redirect('/login');
    }    
  };

  const renderRoot = (req, res) => {
    const availableThemes = ['light', 'dark'];
    if (req.query.theme) {
      if (availableThemes.indexOf(req.query.theme) !== -1) {
        req.session.theme = req.query.theme;
      } else {
        req.session.theme = undefined;
      }
    } 
    res.render('index', {
      layout: false,
      theme: req.session.theme || 'dark'
    });
  }
  
  PROTECTED_ROUTES.forEach((route) => {
    app.get(route, sessionChecker, (req, res) => {
      renderRoot(req, res);
    });
  });

  OK_ROUTES.forEach((route) => {
    app.get(route, (req, res) => {
      renderRoot(req, res);
    });
  });
  
  SKIP_IF_LOGGED_IN_ROUTES.forEach((route) => {
    app.route(route)
    .get((req, res) => {
        if (req.session.user && req.cookies.user_sid) {
          
          res.redirect('/dashboard');
        } else {
          renderRoot(req, res);
        }
    });
  });

  setupRoutes(app);
  
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}..`);
    console.log(JSON.stringify(process.env.NODE_ENV));
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log(`graphql at http://localhost:${PORT}${server.graphqlPath}`);
    }
  });
  return app;
}