import React, { useState, useEffect, useCallback } from 'react';

// resources
import arrayMove from 'array-move';
import axios from 'axios';

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


export default ({files}) => {


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
      {...files[0], key: 1, src: 'https://picsum.photos/seed/1/200/300', caption: '#1'}, 
      {...files[0], key: 2, src: 'https://picsum.photos/seed/2/200/600', caption: '#2'}, 
      {...files[0], key: 3, src: 'https://picsum.photos/seed/3/200/200', }, 
      {...files[0], key: 4, src: 'https://picsum.photos/seed/4/200/400',caption: '#4'}, 
      {...files[0], key: 5, src: 'https://picsum.photos/seed/5/200/150',caption: '#5'}
    ].map((file) => {
      return {...file};
    }));
  }, [files]);

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

  const uploadFile = (file) => {
    let formData = new FormData();
    formData.append('file', file);
    axios.post( '/fileUpload',
      formData,
      {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function( progressEvent ) {
         const uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
         console.log(uploadPercentage);
        }.bind(this)
      }
    ).then(function(){
      console.log('SUCCESS!!');
    })
    .catch(function(){
      console.log('FAILURE!!');
    });
    
  }

  const handleDrop = useCallback(acceptedFiles => {

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
    console.log(filteredFiles);
    filteredFiles.forEach(uploadFile)
  }, []);

   const handleApproveCaption = (file, newCaption) => {
      const newInputFiles = [...inputFiles].map((currItem) => {
      if (currItem.key === file.key) {
          console.log('setting to..', newCaption);
          currItem.caption = newCaption;
      } 
      return currItem;
      });
      setInputFiles(newInputFiles);
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