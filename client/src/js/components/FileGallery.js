import React, { useState, useEffect } from 'react';

// resources
import arrayMove from 'array-move';

// components
import Tooltipify from './Tooltipify.js';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';

// styles
import fileGalleryStyle from '../../scss/fileGallery.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faWrench, faTrash, faComment, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';



export default ({files}) => {

  /*********
   * HOOKS
  ********/

  const [inputFiles, setInputFiles] = useState([]);
  const [editMode, setEditMode] = useState(null);
  // const [tmpCaption, setTmpCaption] = useState('');
  let tmpCaption = '';
  let dirty = false;

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

  /*********
   * HELPERS
   ********/

   const toggleEditMode = (item) => {
    // setTmpCaption(item.caption);
    setEditMode(item.key);
   };

   const updateCaption = (e) => {
    //  console.log(e.target.value);
    dirty = true;
    tmpCaption = e.target.value;
    //  console.log('hiiiiiiii',inputFiles);
    //  const newInputFiles = [...inputFiles].map((currItem) => {
    //   console.log(currItem.key, targetItem.key);
    //   if (currItem.key === targetItem.key) {
    //       currItem.caption = value;
    //   } 
    //   return currItem;
    //  });
    // console.log(newInputFiles);
    //  setInputFiles(newInputFiles);
   };

   const approveCaption = (targetItem) => {
     if (dirty) {
      const newInputFiles = [...inputFiles].map((currItem) => {
      console.log(currItem.key, targetItem.key);
      if (currItem.key === targetItem.key) {
          console.log('setting to..', tmpCaption);
          currItem.caption = tmpCaption;
      } 
      return currItem;
      });
      setInputFiles(newInputFiles);
    }
    closeEditMode();
     
   };

   const closeEditMode = () => {
    tmpCaption = null;
    dirty = false;
    setEditMode(null);
   };
   
   const deleteItem = (targetItem) => {
    setInputFiles(inputFiles.filter((item) => {
      return targetItem !== item;
    }));
    console.log(`deleting item ${item}`);
   };

   const onSortEnd = ({oldIndex, newIndex}) => {
    setInputFiles(arrayMove(inputFiles, oldIndex, newIndex));
   };

   const shouldCancelStart = (e) => {
        if (!e.target.getAttribute('data-handle')) {
          return true; // Return true to cancel sorting
      }
   };

  /*********
   * RENDER
   *********/

  const SortableItem = SortableElement(({file}) => {
    return (
      <div className={`col-4 ${fileGalleryStyle.imgWpr} ${file.key ===  editMode ? fileGalleryStyle.editMode : ''}`}>
        <div className={fileGalleryStyle.aspectControl} data-handle="true" style={{
          background: `url(${file.src})`
        }}>
          <div className={`${fileGalleryStyle.actionsPanel}`}>
            <div className={fileGalleryStyle.editModeHide}>
              <Tooltipify  tooltipId='edit' tooltipText='edit'>
                <FontAwesomeIcon icon={faWrench} onClick={(e) => { toggleEditMode(file) }} />
              </Tooltipify>
              <Tooltipify  tooltipId='delete' tooltipText='delete'>
                <FontAwesomeIcon icon={faTrash} onClick={(e) => { deleteItem(file) }} />
              </Tooltipify>
              { !file.caption ? '' : (
                  <Tooltipify  tooltipId='caption' tooltipText={file.caption}>
                    <FontAwesomeIcon icon={faComment} />
                  </Tooltipify>
                )
              }
            </div>
            <div className={fileGalleryStyle.editModeShow}>
              <Tooltipify  tooltipId='confirm' tooltipText='confirm'>
                  <FontAwesomeIcon icon={faCheck} onClick={(e) => { approveCaption(file) }} />
                </Tooltipify>
                <Tooltipify  tooltipId='deny' tooltipText='deny'>
                  <FontAwesomeIcon icon={faTimes} onClick={(e) => { closeEditMode() }} />
                </Tooltipify>
            </div>
          </div>
          <div className={`${fileGalleryStyle.editModeShow} ${fileGalleryStyle.captionInput}`}>
            <input type='text' defaultValue={file.caption} onChange={updateCaption} />
          </div>
        </div>
      </div>
    )
  });
  

  const SortableList = SortableContainer(({files}) => {
    return (
      <div className={`row ${fileGalleryStyle.fileGallery}`}>
        {files.map((file, index) => (
          <SortableItem key={`item-${file.key}`} index={index} file={file} />
        ))}
         <div className={`col-4 ${fileGalleryStyle.imgWpr} ${inputFiles.length === 0 ? fileGalleryStyle.noFiles : ''}`}>
          <div className={fileGalleryStyle.addMore}>
            <div><FontAwesomeIcon icon={faPlus}/> Add {inputFiles.length ? 'More' : 'Files'}</div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <SortableList 
      files={inputFiles} 
      shouldCancelStart={shouldCancelStart}
      helperClass={'floating'}
      onSortEnd={onSortEnd} 
      axis={'xy'}
    />
  )
};