require('dotenv').config();
const cloudinary = require('cloudinary').v2

module.exports = {
  useCloudinary: process.env.USE_CLOUDINARY === 'true',
  upload: (filePath, params) => {
    return new Promise((res, rej) => {
      cloudinary.uploader.upload(filePath, 
        {
          folder: process.env.NODE_ENV === 'production' ? 'p' : 'd',
          ...params,

        },
        function(error, result) { 
          if (error) return rej(error);
          res(result);
        })
    });
  },
  destroy: (filePath) => {
    return new Promise((res, rej) => {
      cloudinary.uploader.destroy(filePath, 
        function(error, result) { 
          if (error) return rej(error);
          if (result.result === 'not found') {
            return rej('File was not found');
          }
          if (result.result === 'ok') {
            return res(filePath);
          } else {
            return rej(result.result);
          }
        })
    });
  }
}