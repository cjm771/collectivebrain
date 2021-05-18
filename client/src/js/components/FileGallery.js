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
import filesService from '../services/files.services.js';

// styles
import fileGalleryStyle from '../../scss/fileGallery.scss';

const SortableList = SortableContainer(({files, onApproveCaption, onDeleteItem, onFileDropOnDropZone, onFileUploadError, disabled}) => {
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

export default ({files, onChange, onFileUploaded, disabled, post}) => {
  /*********
   *  VARS *
  **********/

  // limits

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
      return file.size < filesService.MAX_FILE_SIZE_MB * 1000000;
    });
  };

  const filterInvalidFileTypes = (files) => {
    return files.filter((file) => { 
      return filesService.getType(file) !== 'unknown';
    });
  };

  const updateFileParams = (file, params, allFiles=inputFiles) => {
    const newInputFiles = [...allFiles].map((currItem) => {
      if (currItem.key === file.key) {
          for (let [key, val] of Object.entries(params)) {
            if (val === undefined) {
              delete  currItem[key];
            } else {
              currItem[key] = val;
            }
          }
      } 
      return currItem;
    });
    setInputFiles(newInputFiles);
    onChange(newInputFiles, true);
  };

  
  const uploadFile = (file, allFiles) => {
      let formData = new FormData();
      formData.append('file', file.fileData);
      if (file.previewUrlThumb) {
        formData.append('fileThumb', filesService.dataURItoBlob(file.previewUrlThumb));
      }

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
          previewUrlThumb: undefined,
          new: true,
          src: resp.data.data.src,
          srcThumb: resp.data.data.srcThumb,
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
      generalService.notifyError(`${filesRemovedCount} files were too large (exceeded ${filesService.MAX_FILE_SIZE_MB}MB) and filtered out.`);
    }

   Promise.all(filteredFiles.map((file) => {
      return Promise.all([filesService.getPreviewDataUrl(file), filesService.generateThumbnail(file)]).then(([dataUrl, dataUrlThumb]) => {
        return {
          fileData: file, 
          key: uuidv4(), 
          previewUrl: dataUrl, 
          previewUrlThumb: dataUrlThumb,
          progress: -1};
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
    let deleteUrl = `/fileUpload?src=${targetItem.src}&srcThumb=${targetItem.srcThumb}`;
    if (post && post.id) {
      deleteUrl += `&postId=${post.id}`;
    }
    axios.delete(deleteUrl)
      .then(() => {
        generalService.notifySuccess('File deleted!');
      })
      .catch((err) => {
        const error = (err.response && err.response.data && err.response.data.error) || err;
        generalService.notifyError('Could not delete file from server, but we did the best we could to remove from post: ' + error);
      }).finally(() => {
        onChange(newFiles, false);
      });
    const newFiles = inputFiles.filter((item) => {
      return targetItem !== item;
    });
    setInputFiles(newFiles);
    onChange(newFiles, false);
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