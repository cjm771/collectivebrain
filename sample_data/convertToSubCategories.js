/**
 * this script converts categories into subcategories and replaces category with its new thing, must be ran from root where .env exist
 */

require('dotenv').config()
const Post = require('../server/models/Post.js');
const User = require('../server/models/User.js');




(async () => {
  const admin = await User.findOne({email: process.env.ADMIN_EMAIL});
  debugger;
  if (admin) {
    let allPosts = await Post.find({});
    let subCatName, subCatIndex, catIndex;
    for (post of allPosts) {
      subCatName = Post.getSubCategoryName(post.category);
      // sub category index
      subCatIndex = Post.getSubCategoryIndexByName(subCatName);
      // get category index
      catIndex = Post.getCategoryIndexfromBySubCategoryName(subCatName);
      console.log(`post id: ${post._id}\n----------------\n`, subCatName, '-->', ` [${catIndex}] ${Post.getCategoryName(catIndex)} :: [${subCatIndex}] ${subCatName}`);
      try {
        post.editor  = admin._id;
        post.category = catIndex;
        post.subCategory = subCatIndex;
        await post.save();
      } catch (e) {
        console.error('Error: ', e);
        process.exit();
      }
    }
  } else {
    console.error('Admin user could not be found');
  }
})();
