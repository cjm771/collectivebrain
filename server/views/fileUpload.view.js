
const path = require('path');
const fs = require('fs');

const post = async (req, res) => {


  if (!req.files || Object.keys(req.files).length === 0) {
    return res.errorJSON('No files were uploaded', 400);
  }

  let file = req.files.file;

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

  file.mv(pathToSave, function(err) {
    // err = 'this is a fake err';
    if (err)
      return res.errorJSON(err, 500);

    res.sendJSON({
      src: `/uploads/tmp/${fileName}`
    });
  });
}

const _delete = async (req, res) => {
  const filePattern = /^\/uploads\/(.+)/;
  const file = req.query.f;
  if (!filePattern.test(file)) {
    return res.errorJSON('Cannot delete file', 403);
  }
  const filePath = file.replace(filePattern, (m, m1) => {
    return path.join(__dirname, '../uploads', m1);
  });
  try {
    await fs.promises.access(filePath);
  } catch (e) {
    return res.errorJSON('File does not exist');
  }
  try {
    await fs.promises.unlink(filePath);
  } catch (e) {
    return res.errorJSON(`Could not delete file ${file}`);
  }
 

  // make sure file exists
  return res.successJSON({file})
}

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