const csvFilePath = __dirname + '/sampledata.csv';
const csv = require('csvtojson');
const fs = require('fs');
const textract = require('textract');

const getLocalImageLink = (dropboxUrl, folder) => {
  return __dirname + '/' + folder + '/' +  decodeURIComponent(/\/([^\/]+?)\?/.exec(dropboxUrl)[1]);
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
              entry['PROJECT START DATE'] = parseInt(datePieces[0]);
              entry['PROJECT END DATE'] = parseInt(datePieces[1]);
            } else {
              entry['PROJECT START DATE'] = parseInt(entry[key]);
            }
          }
          if (key === 'TAGS') {
            entry[key] = entry[key].split(',').filter((item) => {
              return item.trim() !== '';
            })
          }
        }
      });
      if (entry['IMAGE FILE LINK']) {
        entry['IMAGE FILE LINK'] = getLocalImageLink(entry['IMAGE FILE LINK'], 'images');
      }
      if (entry['TEXT FILE LINK']) {
        entry['TEXT FILE LINK'] = getLocalImageLink(entry['TEXT FILE LINK'], 'text');
        getTextFromDoc(entry['TEXT FILE LINK']).then((text) => {
          // entry['TEXT'] = text;
          matches = /-{5,}(.+?)-{5,}(.+?)-{5,}(.+)/.exec(text);
          entry['TITLE'] = matches[1].trim();
          entry['DESCRIPTION'] = matches[2].trim();
          entry['BIBLIO'] = matches[3].trim();
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
    textract.fromFileWithPath(doc, function( error, text ) {
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