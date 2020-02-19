/**
 * remove image duplicates
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
        let tmpSrc = [];
        let newFiles = [];
        let eliminated = 0;
        for (let [index, file] of post.files.entries()) {
          if (tmpSrc.indexOf(file.src) === -1) {
            tmpSrc.push(file.src);
            newFiles.push(file);
          } else {
            eliminated++;
          }
        }
        post.files = newFiles;
        await post.save();
        console.log(`${post.title}: ${eliminated} dup file(s) were removed`)
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
