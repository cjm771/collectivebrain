import React, { useState, useEffect, useCallback } from 'react';

// resources
import arrayMove from 'array-move';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

// components
import {SortableContainer} from 'react-sortable-hoc';
import SortableFileItem from './SortableFileItem.js';
import FileDropZone from './FileDropZone.js';
import { toast } from 'react-toastify';

// styles
import fileGalleryStyle from '../../scss/fileGallery.scss';

const SortableList = SortableContainer(({files, onApproveCaption, onDeleteItem, onFileDropOnDropZone, onFileUploadError}) => {


  return (
    <div className={`row ${fileGalleryStyle.fileGallery}`}>
      {files.map((file, index) => (
        <SortableFileItem 
          onApproveCaption={onApproveCaption}
          onDelete={onDeleteItem}
          key={`item-${file.key}`} 
          index={index} 
          file={file} 
        />
      ))}
      <FileDropZone 
        inputFiles={files} 
        onError={onFileUploadError}
        onDrop={onFileDropOnDropZone}
      />
    </div>
  );
});

export default ({files, onFileUploaded}) => {


  /*********
   *  VARS *
  **********/

  // limits
 const ALLOWED_FILETYPES = [/^image\/.+$/];
 const MAX_FILE_SIZE_MB = 5;

 const toastSettings = {
  position: toast.POSITION.BOTTOM_RIGHT
};

  /*********
   * HOOKS *
  **********/

  const [inputFiles, setInputFiles] = useState([]);

  useEffect(() => {
    setInputFiles([
      {...files[0], key: uuidv4(), src: 'https://picsum.photos/seed/1/200/300', caption: '#1'}, 
      {...files[0], key: uuidv4(), src: 'https://picsum.photos/seed/2/200/600', caption: '#2'}, 
      {...files[0], key: uuidv4(), src: 'https://picsum.photos/seed/3/200/200', }, 
      {...files[0], key: uuidv4(), src: 'https://picsum.photos/seed/4/200/400',caption: '#4'}, 
      {...files[0], key: uuidv4(), src: 'https://picsum.photos/seed/5/200/150',caption: '#5'}
    ].map((file) => {
      return {...file};
    }));
  }, [files]);

  // useEffect(() => {
  //   inputFiles.forEach((file) => {
  //     console.log('we are doing itttt broooooooooo')
  //     if (file.progress === -1) {
  //       uploadFile(file);
  //     } 
  //   });
  // }, [inputFiles])

  /***********
   * HELPERS *
   ***********/

  const notifyInfo = (msg) => {
    toast(msg, toastSettings);
  };

  const notifyError = (error) => {
    toast.error(error, toastSettings)
  };

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
        console.log('FAILURE!!', err);
      });
  };

  const handleDrop = (acceptedFiles) => {
    // remove not valid
    let filteredFiles = filterInvalidFileTypes(acceptedFiles);
    let filesRemovedCount = acceptedFiles.length - filteredFiles.length;
    if (filesRemovedCount) {
      notifyInfo(`${filesRemovedCount} files were invalid file types and filtered out.`);
    }
    let filesLeft = filteredFiles.length;
    // remove too large
    filteredFiles = filteredTooLargeFiles(filteredFiles);
    filesRemovedCount = filesLeft - filteredFiles.length;
    if (filesRemovedCount) {
      notifyError(`${filesRemovedCount} files were too large (exceeded ${MAX_FILE_SIZE_MB}MB) and filtered out.`);
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
    });

  
  };

   const handleApproveCaption = (file, newCaption) => {
    updateFileParams(file, {caption: newCaption});
   };
   
   const handleDeleteItem = (targetItem) => {
    setInputFiles(inputFiles.filter((item) => {
      return targetItem !== item;
    }));
   };

   const handleSortEnd = ({oldIndex, newIndex}) => {
    setInputFiles(arrayMove(inputFiles, oldIndex, newIndex));
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
      onApproveCaption={handleApproveCaption}
      onDeleteItem={handleDeleteItem}
      onFileDropOnDropZone={handleDrop}
    />  
  )
};