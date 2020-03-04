/**
 * move needed tmp files to uploads
 */

require('dotenv').config()
const Post = require('../server/models/Post.js');
const User = require('../server/models/User.js');

(async () => {
  const admin = await User.findOne({email: process.env.ADMIN_EMAIL});
  if (admin) {
    let allPosts = await Post.find({});
    for (post of allPosts) {
      try {
        await post.moveTmpFiles(admin);
        console.log(`${post.title}: any temp files have been moved`)
      } catch (e) {
        console.error(`${post.title} error: ${e}`);
        process.exit();
      }
    }
  } else {
    console.error('Admin user could not be found');
  }
  process.exit();
})();
