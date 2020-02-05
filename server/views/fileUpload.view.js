
const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  if (!(req.session.user && req.cookies.user_sid)) {
    return res.errorJSON('You must be logged in to upload images', 403);
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.errorJSON('No files were uploaded', 400);
  }

  let file = req.files.file;

  const targetDir = '../uploads/';
  fs.mkdirSync(path.join(__dirname, targetDir), { recursive: true });
  file.mv(path.join(__dirname, `${targetDir}${file.name}`), function(err) {
    if (err)
      return res.errorJSON(err, 500);

    res.sendJSON({
      src: `/uploads/${file.name}`
    });
  });
};