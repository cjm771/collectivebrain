require('dotenv').config()
const User = require('../server/models/User.js');
const Token = require('../server/models/Token.js');
const Post = require('../server/models/Post.js');
const samplePosts = require('./data.json');


const ADMIN_USER_DATA = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL, 
  password: process.env.ADMIN_PW,
  role: User.USER_ROLES.ADMIN
};


(async () => {
  let user = await User.findOne();
  if (!user) {
    try {
      const inviteToken = new Token({type: Token.TOKEN_TYPES.INVITE, metaData: {role: User.USER_ROLES.ADMIN}});
      ADMIN_USER_DATA.token = inviteToken;
      await inviteToken.save();
      user = new User(ADMIN_USER_DATA);
      await user.save();
    } catch (e) {
      console.error(`User creation error: ${e}`);
      return;
    }
  }
  const postsWillSave = [];
  let postDoc;
  for (post of samplePosts) {
    try {
      post.user = user;
      post.published = true;
      postDoc = new Post(post);
      await postDoc.save();
      postsWillSave.push(postDoc);
    } catch (e) {
      console.error(`An error occurred: ${e}`);
    }
  }
  console.log(postDoc);  
})();
