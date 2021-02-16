
const path = require('path');
const fs = require('fs');
const FileModel = require('../models/File');
const PostModel = require('../models/Post');


const post = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.errorJSON('No files were uploaded', 400);
  }

  let file = req.files.file;
  let fileThumb = req.files.fileThumb;

  const targetDir = '../uploads/tmp/';
  fs.mkdirSync(path.join(__dirname, targetDir), { recursive: true });
  const originalPath = path.join(__dirname, `${targetDir}`);
  let fileName = file.name;
  let pathToSave = originalPath + fileName;
  
  let keepGoing = true;
  let count = 0;

  while (keepGoing) {
    try {
      await fs.promises.access(pathToSave);
      count++;
      fileName = count + '-' + file.name;
      pathToSave =  originalPath + fileName; 
      keepGoing = true;
    } catch (e) {
      keepGoing = false;
    }
  }

  const ext = path.extname(pathToSave);
  const thumbFileName = `${path.basename(pathToSave, ext)}.thumb${ext}`;
  const pathToSaveThumb = `${originalPath}${thumbFileName}`;


  const _finish = (thumb) => {
    const result = {
      src: `/uploads/tmp/${fileName}`
    };
    if (thumb) {
      result.srcThumb = `/uploads/tmp/${thumb}`;
    }
    res.sendJSON(result);
  };

  file.mv(pathToSave, (err) => {
    // err = 'this is a fake err';
    if (err)
      return res.errorJSON(err, 500);

    if (fileThumb) {
      fileThumb.mv(pathToSaveThumb, (err) => {
        if (err)
          _finish();
        else 
          _finish(thumbFileName)
      })
    } else {
      _finish();
    }


  });
};

const _delete = async (req, res) => {
  let fileInstance = null;
  let post = null;
  // existing post? then lets populate our post
  if (req.query.postId) {
    post = await PostModel.findOne({ _id: req.query.postId });
    if (post && post.files) {
      post.files.forEach((file) => {
        if (file.src === req.query.src) {
          fileInstance = file;
        }
      });
    }
  }
  // if there is no file from an existing post, just delete (prolly tmp)
  if (!fileInstance) {
    fileInstance = new FileModel({src: req.query.src, srcThumb: req.query.srcThumb});
  }
  
  // if its a post, lets try also updating the post.. to prevent dead links being saved
  try {
    if (fileInstance && post && req.session && req.session.user) {

      const newFiles = post.files.filter((file) => {
        return fileInstance.src !== file.src;
      });
      post.files = newFiles;
      post.editor = req.session.user.id;
      await post.save();
    }
  } catch (e) {
    // pass
  }

  // delete that file!
  try {
    await fileInstance.deleteFile();
  } catch (e) {
    return res.errorJSON(e);
  }
  return res.sendJSON({file: fileInstance.src});
};

module.exports = async (req, res) => {
  if (!(req.session.user && req.cookies.user_sid)) {
    return res.errorJSON('You must be logged in to upload/remove images', 403);
  }
  if (req.method === 'POST') {
    post(req, res);
  } else if (req.method === 'DELETE') {
    _delete(req, res);
  } else {
    return res.errorJSON('Forbidden', 403);
  }
};