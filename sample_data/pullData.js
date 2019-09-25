/**
 * Generates json data
 */
const Post = require(__dirname + '/../server/models/Post.js');
const csvFilePath = __dirname + '/sampledata.csv';
const csv = require('csvtojson');
const fs = require('fs');
const textract = require('textract');

const getLocalImageLink = (dropboxUrl, folder) => {
  let path = decodeURIComponent(/\/([^\/]+?)\?/.exec(dropboxUrl)[1]);
  if (folder === 'images') {
   path = '/' + folder + '/media/' + path;
  } else {
    path = __dirname + '/' + folder + '/' + path;
  }
  return path;
};

const formatEntries = (jsonArray) => {
  let matches, datePieces;
  jsonArray = jsonArray.map((entry, index) => {
    return new Promise((resolve, reject) => {
      Object.keys(entry).forEach((key) => {
        if (entry[key] === '') {
          entry[key] = null;
        } else {
          if (['PROJECT DATE', 'PUBLISHED DATE'].indexOf(key) !== -1) {
            if (entry[key].indexOf('-') !== -1) {
              datePieces = entry[key].split('-');
              entry['startDate'] = parseInt(datePieces[0]);
              entry['endDate'] = parseInt(datePieces[1]);
            } else {
              entry['startDate'] = parseInt(entry[key]);
            }
          }
          
          if (key === 'tags') {
            entry[key] = entry[key].split(',').filter((item) => {
              return item.trim() !== '';
            })
          } 
          if (key === 'category') {
            const category = Post.CATEGORIES[entry[key].toUpperCase().replace(' ', '_')];
            if (category === undefined) {
              throw `${entry[key].toUpperCase().replace(' ', '_')} is not defined` 
            }
            entry[key] = category;
          }
        }
      });
      ['PROJECT DATE', 'PUBLISHED DATE'].forEach((key) => {
        delete entry[key];
      });
      if (entry['IMAGE FILE LINK']) {
        entry['images'] = [{
          src: getLocalImageLink(entry['IMAGE FILE LINK'], 'images'),
          src_thumb: null,
          caption: null
        }];
      }
      delete entry['IMAGE FILE LINK'];
      if (entry['TEXT FILE LINK']) {
        entry['TEXT FILE LINK'] = getLocalImageLink(entry['TEXT FILE LINK'], 'text');
        getTextFromDoc(entry['TEXT FILE LINK']).then((text) => {
          // entry['TEXT'] = text;
          matches = /-{5,}([\s\S]+?)-{5,}([\s\S]+?)-{5,}([\s\S]+)/.exec(text);
          entry['title'] = matches[1].trim();
          entry['description'] = matches[2].trim();
          entry['sources'] = matches[3].trim() !== '' ? matches[3].trim().split('\n') : null;
          delete entry['TEXT FILE LINK'];
          resolve(entry);
        });
      } else {
        resolve(entry);
      }
    });
  });
  return Promise.all(jsonArray);
};

const getTextFromDoc = (doc) => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(doc, {preserveLineBreaks: true }, function( error, text ) {
      if (error) {
        console.log('error!', error);
        reject(error);
      } else {
        resolve(text);
      }
    });
  })
}

(async () => {
  // // Async / await usage
  let jsonArray = await csv().fromFile(csvFilePath);
  jsonArray = await formatEntries(jsonArray);
  console.log(jsonArray);
  fs.writeFileSync(__dirname + '/' + 'data.json', JSON.stringify(jsonArray));
})();