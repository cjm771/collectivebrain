/**
 * this script converts the years that are not real timestamps.. to real timestamps. must be ran from root where .env exist
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
        ['startDate', 'endDate'].forEach((att) => {
          if (post[att]) {
            const unixTs = post[att].getTime();
            if (unixTs >= 0 && unixTs < 3000) {
              console.log(`${att}: ${post[att]} --> ${post[att].getTime()}`);
              const newDate = new Date(String(post[att].getTime()));
              post[att] = newDate;
              console.log(`post[att].nameconverting wrong unix ts: ${unixTs} to true: ${newDate}`);
            }
          }
        });
        post.editor  = admin._id;
        await post.save();
      } catch (e) {
        console.error('Error: ', e);
        process.exit();
      }
    }

  } else {
    console.error('Admin user could not be found');
  }
  process.exit();
})();
