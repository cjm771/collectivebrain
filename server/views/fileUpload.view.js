
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  if (!(req.session.user && req.cookies.user_sid)) {
    return res.errorJSON('You must be logged in to upload images', 403);
  }

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
};