/**
 * add groups, object to existing posts. must be ran from root where .env exist
 */

require('dotenv').config()
const Group = require('../server/models/Group.js');
const Post = require('../server/models/Post.js');
const User = require('../server/models/User.js');



const groupNamesToCreate = [
  'collectiveBrain',
  'arch304'
];
const defaultGroupName = groupNamesToCreate[0];

(async () => {
  const admin = await User.findOne({email: process.env.ADMIN_EMAIL});
  if (admin) {
    for (groupName of groupNamesToCreate) {
      try {
        const foundGroup = await Group.findOne({name: groupName});
        if (!foundGroup) {
          const group = new Group({name: groupName});
          await group.save();
        } else {
          console.log(`skipping ${foundGroup.name}...already made..`);
        }
      } catch (e) {
        console.error(`Could not create group ${groupName}:`, e);
        process.exit();
      }
    }
    const defaultGroup = await Group.findOne({name: defaultGroupName});
    console.log(`Using ${defaultGroup.name}:${defaultGroup._id} as default group..`);
    console.log('updating posts..');
    let allPosts = await Post.find({});
    for (post of allPosts) {
      try {
        post.editor  = admin._id;
        post.group = defaultGroup;
        await post.save();
      } catch (e) {
        console.error('Error: ', e);
        process.exit();
      }
    }
    console.log('updating users..');
    let allUsers = await User.find({});
    for (user of allUsers) {
      try {
        user.editor  = admin._id;
        user.activeGroup = defaultGroup;
        await user.save();
      } catch (e) {
        console.error('Error: ', e);
        process.exit();
      }
    }
    console.log('DONE!');
    process.exit();
  } else {
    console.error('Admin user could not be found');
  }
})();
