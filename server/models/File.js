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

fileSchema.virtual('uploadProvider').get(function () {
  if (/^\/uploads\/(.+)/.test(this.src)) {
    return fileSchema.statics.UPLOAD_PROVIDER.SELF;
  } else if (/^(.+)cloudinary.com\/(.+)$/.test(this.src)) {
    return fileSchema.statics.UPLOAD_PROVIDER.CLOUDINARY;
  } else {
    return fileSchema.statics.UPLOAD_PROVIDER.UNKNOWN;
  }
});

/**
 * METHODS
 */

fileSchema.methods.getPublicId = function() {
  if (!this.isCloudinaryHosted()) {
    return null;
  } else if (this.providerId) {
      return this.providerId;
  } else {
    // attempt to parse..kind of hacky for now
    const pubIdPattern = /^.+?\/((?:d|p)\/.+)\.(.+)$/
    const matches = pubIdPattern.exec(this.src);
    return (!matches) ? null : matches[1];
  }
}

fileSchema.methods.isTmpFile = function() {
  return fileSchema.statics.PATH_PATTERNS.TMP_UPLOAD.test(this.src);
}

fileSchema.methods.uploadFile = async function() {
  if (this.isTmpFile()) {
    if (CloudinaryService.useCloudinary) { // cloudinary
      const cloudinaryResult = await CloudinaryService.upload(this.getFilePath());
      this.src = cloudinaryResult.url;
      this.providerId = cloudinaryResult.public_id;
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
}

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
}

fileSchema.methods.deleteFile = async function() {
  if (this.isSelfHosted()) {
    let filePath;
    try {
      filePath = await fs.promises.access(this.getFilePath());
    } catch (e) {
      throw 'File does not exist';
    }
    try {
      await fs.promises.unlink(filePath);
      return this.src;
    } catch (e) {
      throw `Could not delete file ${file}`;
    }  
  } else if (this.isCloudinaryHosted()) {
    const cloudinaryResult = await CloudinaryService.destroy(this.getPublicId());
    return cloudinaryResult;
  } else {
    throw 'Cannot delete file, unknown/not safe host provider';
  }
}

fileSchema.methods.getFilePath =function() {
  if (!this.isSelfHosted()) {
    return this.src;
  } else {
    if (this.isTmpFile()) {
      return this.src.replace(fileSchema.statics.PATH_PATTERNS.TMP_UPLOAD, (m, m1) => {
        return path.join(__dirname, '../uploads/tmp', m1);
      });
    } else {
      return this.src.replace(fileSchema.statics.PATH_PATTERNS.UPLOAD, (m, m1) => {
        return path.join(__dirname, '../uploads', m1);
      });
    }
  }
};

fileSchema.methods.isCloudinaryHosted = function() {
  return this.uploadProvider === fileSchema.statics.UPLOAD_PROVIDER.CLOUDINARY;
};

fileSchema.methods.isSelfHosted = function() {
  return this.uploadProvider === fileSchema.statics.UPLOAD_PROVIDER.SELF;
};

fileSchema.methods.isUnknownHost = function() {
  return this.uploadProvider === fileSchema.statics.UPLOAD_PROVIDER.UNKNOWN;
};

fileSchema.statics.PATH_PATTERNS = {
  UPLOAD:  /^\/uploads\/(.+)/,
  TMP_UPLOAD: /^\/uploads\/tmp\/(.+)/,
}

fileSchema.statics.UPLOAD_PROVIDER = {
  UNKNOWN: -1, 
  SELF: 0,
  CLOUDINARY: 1
}


/**
 * MODEL
 */
const File = mongoose.model('File', fileSchema);
module.exports = File;