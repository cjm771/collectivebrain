require('dotenv').config()
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const User = require('./models/User');
const app = express();
const PORT = process.env.MONGODB_URI || 3000;
const mongoose = require('./db.js');
const MongoStore = require('connect-mongo')(session);

// apollo
const {ApolloServer, gql} = require('apollo-server-express');
const typeDefs = require('./schema/typeDefs.js');
const resolvers = require('./schema/resolvers.js');

app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
      expires: 30 * 24 * 60 * 60 * 1000 ,
      maxAge: 30 * 24 * 60 * 60 * 1000 
  }
}));


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

const PROTECTED_ROUTES = ['/', '/dashboard'];
const SKIP_IF_LOGGED_IN_ROUTES = ['/login', '/register'];
// app.use((req, res, next) => {
//   if (req.cookies.user_sid && !req.session.user) {
//     debugger;
//       res.clearCookie('user_sid');        
//   }
//   next();
// });

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      next();
  } else {
    res.redirect('/login');
  }    
};

PROTECTED_ROUTES.forEach((route) => {
  app.get(route, sessionChecker, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/'));
  });
});

SKIP_IF_LOGGED_IN_ROUTES.forEach((route) => {
  app.route(route)
  .get((req, res) => {
      if (req.session.user && req.cookies.user_sid) {
        res.redirect('/');
      } else {
        res.sendFile(path.join(__dirname, '../client/dist/'));
      }
  });
});


// route for user logout
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      res.clearCookie('user_sid');
      res.redirect('/');
  } else {
      res.redirect('/login');
  }
});

app.use('/', express.static(path.join(__dirname, '../client/dist/')));


app.listen(PORT, () => {
  console.log(`listening on ${PORT}..`);
  console.log(`graphql at http://localhost:${PORT}${server.graphqlPath}`);
});

