require('dotenv').config();

const path = require('path');
const fs = require('fs');

// express
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

// resources
const { createCanvas, loadImage } =require('canvas');

// models
const mongoose = require('./db.js');
const MongoStore = require('connect-mongo')(session);
const User = require('./models/User');
const Post = require('./models/Post');

// apollo
const {ApolloServer, gql} = require('apollo-server-express');
const typeDefs = require('./schema/typeDefs.js');
const resolvers = require('./schema/resolvers.js');

const PORT = process.env.PORT || 3000;

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

const PROTECTED_ROUTES = ['/', /\/dashboard\/?(.*)/];
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

app.post('/fileUpload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let file = req.files.file;

  const targetDir = './uploads/';
  fs.mkdirSync(path.join(__dirname, targetDir), { recursive: true });

  // Use the mv() method to place the file somewhere on your server
  file.mv(path.join(__dirname, `${targetDir}${file.name}`), function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
})

app.get('/post/static/:id', async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);
    const getYear = (date) => {
      return date.getTime();
    }

    function drawImageContained(ctx, img, x, y, _width, _height,) {
        const scale = 1;
        let contains = true;
        const childRatio = img.width / img.height;
        const parentRatio = _width / _height;
        let width = _width * scale;
        let height = _height * scale;
    
        if (contains ? (childRatio > parentRatio) : (childRatio < parentRatio)) {
          height = width / childRatio
        } else {
          width = height * childRatio
        }
    
        ctx.drawImage(img, x + ((_width - width) / 2), y, width, height);
    }

  
  /**
   * draws wrapped text to context given max width and height
   * @param {*} context ctx
   * @param {*} text text to display
   * @param {*} x start (x)
   * @param {*} y start (y)
   * @param {*} maxWidth 
   * @param {*} maxHeight 
   * @param {*} lineHeight 
   */
  const wrapText = (context, text, x, y, maxWidth, maxHeight, lineHeight) => {
    let count = 0;
  
    var words = text.split(/(\n)|\s/g).filter((word) => word);
    var line = '';
    var baseY = y;

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      count++;      

      if ((testWidth > maxWidth && n > 0) || /\n/.test(words[n])) {
        if (y - baseY + lineHeight < maxHeight) {
          context.fillText( line, x, y);
        } else {
          break;
        }
        
        line =  words[n].replace(/\n/g, '') + ' ';
   
        y += lineHeight;
        
        
      }
      else {
        line = testLine;
      }
    }
  if (count < words.length) {
    if (testWidth > maxWidth - 5) {
      line = line.slice(0, line.length - 3) + '...';
    } else {
      line += '...';
    }
  }
    context.fillText(line, x, y);
  }

  /**
   * limit amount of sources to a speicifed amount and add `+3 more` to end..to save space
   * @param {[str]} sources array of sources
   * @param {*} n amount to limit to
   * @returns {sources} limited sources
   */
  const limitSources = (sources, n) => {
    let truncSources = sources.slice();
    if (sources.length > n) {
      truncSources = sources.slice(0, n);
      let leftoverCount = sources.length - n;
      truncSources.push(`+ ${leftoverCount} more source${leftoverCount > 1 ? 's' : ''}` )
    }
    return truncSources.reverse();
  };

  
  
    if (post) {
      const height = 1024;
      const width = 512;
      const padding = width * .05;
      const dateStr = (post.startDate ? (post.endDate) ? `${getYear(post.startDate)} - ${getYear(post.endDate)}` : (getYear(post.startDate) ? `${getYear(post.startDate)}` : '') : '');
      const main_content_y_offset = padding + height * .039;
      const image_caption_offset_pct = 0.41;
      const image_height_pct = 0.70;

      const canvas = createCanvas(width, height, (req.query.format && req.query.format !=='svg' ? null : 'svg'));
      const ctx = canvas.getContext('2d');
      // post.images = [];

      ctx.save();
      ctx.strokeStyle = Post.getCategoryColorByName(Post.getCategoryName(post.category));
      ctx.lineWidth = 20;
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // Write "Awesome!"
      ctx.textAlign = 'right'
      ctx.font = '600 10px Helvetica, Arial, Sans-Serif'
      ctx.fillText(dateStr, width - padding, padding)
      ctx.font = '800 10px Helvetica, Arial, Sans-Serif'
      ctx.fillText(post.creator || 'Dummy Creator', width - padding, 55)
      ctx.textAlign = 'left'
      ctx.font = '600 12px Helvetica, Arial, Sans-Serif'
      ctx.fillText(post.title.toUpperCase(), padding, padding)
      ctx.fillStyle = "rgba(100, 100, 100, 1)";
      ctx.font = '500 10px Helvetica, Arial, Sans-Serif'
      ctx.fillText(Post.getCategoryName(post.category).toUpperCase(), padding, 55)
      if (post.images && post.images.length) {
        const image = await loadImage(path.resolve(__dirname + '/../client/dist' + post.images[0].src))
        // ctx.drawImage(image, padding, main_content_y_offset, width - padding * 2, width * .57);
        drawImageContained(
          ctx,
          image,
          padding,
          main_content_y_offset,
          width - padding * 2,
          width * image_height_pct,
          true
        );
      }
      ctx.font = 'normal 10px Helvetica, Arial, Sans-Serif'
      ctx.fillStyle = "#333";
      wrapText(
        ctx, 
        post.description, 
        padding, 
        main_content_y_offset + (post.images.length ? height * image_caption_offset_pct - 15 : 30), 
        width - padding * 2, 
        height * (post.images.length ? (image_caption_offset_pct + .005) : .78), 
        12
      );
      ctx.save();
      ctx.fillStyle ='#bbbbbb';
      ctx.font = 'italic normal 10px Helvetica, Arial, Sans-Serif';
      if (post.images && post.images.length) {
        wrapText(
          ctx,
          'I am a random caption s dsd sdasdsadsadasd asdasddasds asdsadasdas dsadasdadasasdasdsdasdasdsaadassdasdsadadadsadaddasdasdasdasdasda',
          padding, 
          padding + height * image_caption_offset_pct,
          width - padding * 2,
          12,
          12
        );
      }
      ctx.restore();
      ctx.fillStyle = '#008cff';
      ctx.textBaseline = 'bottom';
      if (post.tags && post.tags.length) {
        wrapText(
          ctx, 
          post.tags.map(tag => `#${tag.trim()}`).join(' '), 
          padding, 
          height-padding , 
          width - padding * 2, 
          12, 
          12
        );
      }
      ctx.restore();
      ctx.font = 'italic normal 10px Helvetica, Arial, Sans-Serif';
      ctx.fillStyle = '#c0c0c0';
      if (post.sources && post.sources.length) {   
        // post.sources = post.sources.concat(post.sources).concat(post.sources);  
        let sourceY = height - padding - (post.sources.length < 3 ? 30 : 18);
        ctx.fillStyle = '#c0c0c0';
        limitSources(post.sources, 2).forEach((source, index) => {
          wrapText(
            ctx,
            source,
            padding,
            sourceY,
            width - padding * 2,
            24,
            12
          );
          sourceY -= 30;
        });
      }
      
      let mimeType = 'image/svg+xml';
      if (req.query.format && req.query.format === 'jpeg' || req.query.format === 'jpg') {
        mimeType = 'image/jpeg';
      }
      res.contentType(mimeType); 
      res.setHeader('Content-Type', mimeType);
      res.send(canvas.toBuffer(mimeType, {quality: 0.9}));
    } else {
      res.errorJSON('Post could not be found')
    }
  } catch (e) {
    debugger;
    res.errorJSON(e.message || e)
  }
  
});

app.use('/', express.static(path.join(__dirname, '../client/dist/')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.listen(PORT, () => {
  console.log(`listening on ${PORT}..`);
  console.log(JSON.stringify(process.env.NODE_ENV));
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log(`graphql at http://localhost:${PORT}${server.graphqlPath}`);
  }
});

