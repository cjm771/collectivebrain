/**
 * this script converts images arr to files arr for later addeitional file tgypes must be ran from root where .env exist
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
        if (post.images &&  post.images instanceof Array) {
          post.images.forEach((image) => {
            post.files = post.files || [];
            const alreadyConverted = post.files.filter((file) => {
              return file._id === image._id;
            }).length;
            if (alreadyConverted) {
              console.log('file already copied over, skipping..');
            } else {
              post.files.push(image);
            }
          });
          console.log(`converted ${post.images.length} images to files`);
          post.editor  = admin._id;
          await post.save();
          post.images = undefined;
          post.editor  = admin._id;
          await post.save();
        } else {
          console.log(`no images for post: ${post._id}. ${post.files && post.files.length ? post.files.length + ' files already converted / exist.' : ''}`);
        }
      } catch (e) {
        console.error('Error: ', e);
        process.exit();
      }
    }
  } else {
    console.error('Admin user could not be found');
  }
})();
