const path = require('path');
const fs = require('fs');

const mongoose = require('../db.js');
const CloudinaryService = require('../utils/CloudinaryService.js');
/**
 * SCHEMA
 */ 

 const fileSchema = mongoose.Schema({
    providerId: {
      type: String
    },
    src: {
      type: String,
      required: true
    },
    srcThumb: {
      type: String
    },
    caption: {
      type: String
    }
 });


/**
 * PROPERTY
 */

// fileSchema.virtual('uploadProvider').get(function () {
//   if (/^\/uploads\/(.+)/.test(this.src)) {
//     return fileSchema.statics.UPLOAD_PROVIDER.SELF;
//   } else if (/^(.+)cloudinary.com\/(.+)$/.test(this.src)) {
//     return fileSchema.statics.UPLOAD_PROVIDER.CLOUDINARY;
//   } else {
//     return fileSchema.statics.UPLOAD_PROVIDER.UNKNOWN;
//   }
// });

/**
 * METHODS
 */

fileSchema.methods.getThumbPublicId = function() {
  return this.getPublicId(this.srcThumb);
};

fileSchema.methods.getUploadProvider = function(srcPath=this.src) {
  if (/^\/uploads\/(.+)/.test(srcPath)) {
    return fileSchema.statics.UPLOAD_PROVIDER.SELF;
  } else if (/^(.+)cloudinary.com\/(.+)$/.test(srcPath)) {
    return fileSchema.statics.UPLOAD_PROVIDER.CLOUDINARY;
  } else {
    return fileSchema.statics.UPLOAD_PROVIDER.UNKNOWN;
  }
};

fileSchema.methods.getPublicId = function(srcPath=this.src) {
  if (!this.isCloudinaryHosted()) {
    return null;
  } else {
    // attempt to parse..kind of hacky for now. edit: actually this is probably the best way for now
    const pubIdPattern = /^.+?\/((?:d|p)\/.+)\.(.+)$/
    const matches = pubIdPattern.exec(srcPath);
    return (!matches) ? null : matches[1];
  }
};

fileSchema.methods.isTmpFile = function(srcPath=this.src) {
  return fileSchema.statics.PATH_PATTERNS.TMP_UPLOAD.test(srcPath);
};

fileSchema.methods.uploadFile = async function() {
  if (this.isTmpFile()) {
    if (CloudinaryService.useCloudinary) { // cloudinary
      const filePath = this.getFilePath();
      const thumbFilePath = this.getFileThumbPath();
      const cloudinaryParams = { resource_type: 'raw' };
      const cloudinaryResult = await CloudinaryService.upload(filePath, cloudinaryParams);
      this.src = cloudinaryResult.url;
      this.providerId = cloudinaryResult.public_id;
      if (thumbFilePath) {
        const cloundinaryResultThumb = await CloudinaryService.upload(thumbFilePath, 
          {...cloudinaryParams, format: 'jpg'});
        this.srcThumb = cloundinaryResultThumb.url;
      }
      // this.providerId = cloudinaryResult.public_id;
      // @TODO remove from tmp directory immediately
      return this;
    } else { // local file storage
      const oldFilePath = this.getFilePath();
      const newFilePath = await this.getUniqueFileName(file.src.replace(fileSchema.statics.PATH_PATTERNS.TMP_UPLOAD, (m, m1) => {
        return path.join(__dirname, '../uploads', m1);
      }));
      await fs.promises.rename(oldFilePath, newFilePath);
      let matches = filePattern.exec(newFilePath);
      this.src = `/uploads/${matches[1]}`;
      return this;
    }
  }
};

fileSchema.methods.getUniqueFileName = async function (fullPath) {
  const targetDir =  path.dirname(fullPath) + '/';
  fs.mkdirSync(path.join(__dirname, targetDir), { recursive: true });
  const originalPath = targetDir;
  let originalFileName = path.basename(fullPath);
  let fileName = originalFileName;
  let pathToSave = originalPath + fileName;
  
  let keepGoing = true;
  let count = 0;
  while (keepGoing) {
    try {
      await fs.promises.access(pathToSave);
      count++;
      fileName = count + '-' + originalFileName;
      pathToSave =  originalPath + fileName; 
      keepGoing = true;
    } catch (e) {
      keepGoing = false;
    }
  }
  return pathToSave;
};

fileSchema.methods.deleteFile = async function() {
  if (this.isSelfHosted()) {
    let filePath;
    try {
      await fs.promises.access(this.getFilePath());
    } catch (e) {
      throw 'File does not exist';
    }
    try {
      await fs.promises.unlink(this.getFilePath());
      try {
        if (this.getFileThumbPath()) {
          await fs.promises.unlink(this.getFileThumbPath());
        }
      } catch (e) {
        console.log('could not delete local thumb', e);
      }
      return this.src;
    } catch (e) {
      throw `Could not delete file: ${e}`;
    }  
  } else if (this.isCloudinaryHosted()) {
    const cloudinaryResult = await CloudinaryService.destroy(this.getPublicId());
    try {
      if (this.getFileThumbPath()) {
        await CloudinaryService.destroy(this.getThumbPublicId());
      }
    } catch (e) {
      console.log('could not delete thumb from cloudinary', e);
    }
    return cloudinaryResult;
  } else {
    throw 'Cannot delete file, unknown/not safe host provider';
  }
};

fileSchema.methods.getFileThumbPath =function() {
  if (!this.srcThumb) {
    return null;
  }
  return this.getFilePath(this.srcThumb);
};

fileSchema.methods.getFilePath =function(filePath=this.src) {
  if (!this.isSelfHosted(filePath)) {
    return filePath;
  } else {
    if (this.isTmpFile(filePath)) {
      return filePath.replace(fileSchema.statics.PATH_PATTERNS.TMP_UPLOAD, (m, m1) => {
        return path.join(__dirname, '../uploads/tmp', m1);
      });
    } else {
      return filePath.replace(fileSchema.statics.PATH_PATTERNS.UPLOAD, (m, m1) => {
        return path.join(__dirname, '../uploads', m1);
      });
    }
  }
};

fileSchema.methods.isCloudinaryHosted = function(srcPath=this.src) {
  return this.getUploadProvider(srcPath) === fileSchema.statics.UPLOAD_PROVIDER.CLOUDINARY;
};

fileSchema.methods.isSelfHosted = function(srcPath=this.src) {
  return this.getUploadProvider(srcPath) === fileSchema.statics.UPLOAD_PROVIDER.SELF;
};

fileSchema.methods.isUnknownHost = function(srcPath=this.src) {
  return this.getUploadProvider(srcPath) === fileSchema.statics.UPLOAD_PROVIDER.UNKNOWN;
};

fileSchema.statics.PATH_PATTERNS = {
  UPLOAD:  /^\/uploads\/(.+)/,
  TMP_UPLOAD: /^\/uploads\/tmp\/(.+)/,
};

fileSchema.statics.UPLOAD_PROVIDER = {
  UNKNOWN: -1, 
  SELF: 0,
  CLOUDINARY: 1
};


/**
 * MODEL
 */
const File = mongoose.model('File', fileSchema);
module.exports = File;