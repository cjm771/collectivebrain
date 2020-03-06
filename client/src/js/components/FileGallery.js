import React, { useState, useEffect, useCallback } from 'react';

// resources
import arrayMove from 'array-move';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

// components
import {SortableContainer} from 'react-sortable-hoc';
import SortableFileItem from './SortableFileItem.js';
import FileDropZone from './FileDropZone.js';

// services
import generalService from '../services/general.services.js';

// styles
import fileGalleryStyle from '../../scss/fileGallery.scss';

const SortableList = SortableContainer(({files, onApproveCaption, onDeleteItem, onFileDropOnDropZone, onFileUploadError, disabled}) => {

  console.log(disabled);

  return (
    <div className={`row ${fileGalleryStyle.fileGallery}`}>
      {files.map((file, index) => (
        <SortableFileItem 
          onApproveCaption={onApproveCaption}
          onDelete={onDeleteItem}
          key={`item-${file.key}`} 
          disabled={disabled}
          _disabled={disabled}
          index={index} 
          file={file} 
        />
      ))}
      <FileDropZone 
        inputFiles={files} 
        disabled={disabled}
        onError={onFileUploadError}
        onDrop={onFileDropOnDropZone}
      />
    </div>
  );
});

export default ({files, onChange, onFileUploaded, disabled}) => {


  /*********
   *  VARS *
  **********/

  // limits
 const ALLOWED_FILETYPES = [/^image\/.+$/];
 const MAX_FILE_SIZE_MB = 5;

  /*********
   * HOOKS *
  **********/

  const [inputFiles, setInputFiles] = useState([]);

  useEffect(() => {
    if (files && files.length) {
      const readyFiles = files.map((file) => {
        return {
          ...file,
          key: uuidv4()
        }
      });
      setInputFiles(readyFiles);
      onChange(readyFiles, false);
    }
  }, [files]);
  /***********
   * HELPERS *
   ***********/

  const filteredTooLargeFiles = (files) => {
    return files.filter((file) => {
      return file.size < MAX_FILE_SIZE_MB * 1000000;
    });
  };

  const filterInvalidFileTypes = (files) => {
    return files.filter((file) => {
      let valid = false;
      ALLOWED_FILETYPES.forEach((typePattern) => {
        if (typePattern.test(file.type)) {
          valid = true;
        }
      });
      return valid;
    });
  };

  const getPreviewDataUrl = (file) => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        // convert image file to base64 string
        res(reader.result);
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      }
    })
  };

  const updateFileParams = (file, params, allFiles=inputFiles) => {
    const newInputFiles = [...allFiles].map((currItem) => {
      if (currItem.key === file.key) {
        console.log('before: ', currItem);
          for (let [key, val] of Object.entries(params)) {
            if (val === undefined) {
              delete  currItem[key];
            } else {
              currItem[key] = val;
            }
          }
          console.log('after: ', currItem);
      } 
      return currItem;
    });
    setInputFiles(newInputFiles);
    onChange(newInputFiles, true);
  };

  
  const uploadFile = (file, allFiles) => {
      let formData = new FormData();
      formData.append('file', file.fileData);
      axios.post( '/fileUpload',
        formData,
        {
          headers: {
              'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: function( progressEvent ) {
           const uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
           console.log(uploadPercentage);
           updateFileParams(file, {progress: uploadPercentage}, allFiles);
          }.bind(this)
        }
      ).then(function(resp){
        updateFileParams(file, {
          progress: undefined,
          previewUrl: undefined,
          new: true,
          src: resp.data.data.src
        }, allFiles);
        onFileUploaded(resp.data.data.src);
      })
      .catch(function(err){
        const error = (err.response && err.response.data && err.response.data.error) || err;
        updateFileParams(file, {
          progress: undefined,
          error: error
        }, allFiles);
        setTimeout(() => {
          handleDeleteItem(file);
        }, 5000);
        generalService.notifyError(`An error occurred while uploading: ${error}`);
      });
  };

  const handleDrop = (acceptedFiles) => {
    // remove not valid
    let filteredFiles = filterInvalidFileTypes(acceptedFiles);
    let filesRemovedCount = acceptedFiles.length - filteredFiles.length;
    if (filesRemovedCount) {
      generalService.notifyInfo(`${filesRemovedCount} files were invalid file types and filtered out.`);
    }
    let filesLeft = filteredFiles.length;
    // remove too large
    filteredFiles = filteredTooLargeFiles(filteredFiles);
    filesRemovedCount = filesLeft - filteredFiles.length;
    if (filesRemovedCount) {
      generalService.notifyError(`${filesRemovedCount} files were too large (exceeded ${MAX_FILE_SIZE_MB}MB) and filtered out.`);
    }
   Promise.all(filteredFiles.map((file) => {
      return getPreviewDataUrl(file).then((dataUrl) => {
        return {fileData: file, key: uuidv4(), previewUrl: dataUrl, progress: -1};
      }).catch((err) => {
        return {error: err};
      });
    })).then((newFiles) => {
      const allFiles = [...inputFiles, ...newFiles];
      newFiles.forEach((file) => {
        uploadFile(file, allFiles);
      })
      setInputFiles(allFiles);
      onChange(allFiles, true);
    });

  
  };

   const handleApproveCaption = (file, newCaption) => {
    updateFileParams(file, {caption: newCaption});
   };
   
   const handleDeleteItem = (targetItem) => {
    axios.delete('/fileUpload?f=' + targetItem.src)
      .then(() => {
      })
      .catch((err) => {
        const error = (err.response && err.response.data && err.response.data.error) || err;
        generalService.notifyError('Could not delete file from server: ' + error);
      }).finally(() => {
        onChange(newFiles, true);
      });
    const newFiles = inputFiles.filter((item) => {
      return targetItem !== item;
    });
    setInputFiles(newFiles);
    onChange(newFiles, true);
   };

   const handleSortEnd = ({oldIndex, newIndex}) => {
    const newFiles = arrayMove(inputFiles, oldIndex, newIndex);
    setInputFiles(newFiles);
    onChange(newFiles, true);
   };

   const shouldCancelStart = (e) => {
        if (!e.target.getAttribute('data-handle')) {
          return true; // Return true to cancel sorting
      }
   };


  /**********
   * RENDER *
   **********/

  return (
    <SortableList 
      files={inputFiles} 
      shouldCancelStart={shouldCancelStart}
      helperClass={'floating'}
      onSortEnd={handleSortEnd} 
      axis={'xy'}
      disabled={disabled}
      onApproveCaption={handleApproveCaption}
      onDeleteItem={handleDeleteItem}
      onFileDropOnDropZone={handleDrop}
    />  
  )
};