
import React, { useState } from 'react';

// components
import {SortableElement} from 'react-sortable-hoc';
import Tooltipify from './Tooltipify.js';

// styles
import fileGalleryStyle from '../../scss/fileGallery.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faTrash, faComment, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';


export default SortableElement(({file, onApproveCaption, onDelete}) => {


  /*********
   * HOOKS *
  **********/

 const [editMode, setEditMode] = useState(false);
 let  [caption, setCaption] = useState(file.caption);
 let  [dirty, setDirty] = useState(false);
  
  /***********
   * HELPERS *
   ***********/

  const enableEditMode = () => {
    setEditMode(true);
   };

  const closeEditMode = () => {
    setDirty(false);
    setEditMode(false);
   };

   const updateCaption = (e) => {
    setDirty(true);
    setCaption(e.target.value);
   };

   const deleteItem = () => {
    onDelete(file);
   };

   const denyEdits = () => {
    closeEditMode();
    setCaption(file.caption);
   };

   const approveCaption = ()  => {
     if (dirty) {
      onApproveCaption(file, caption);
    }
    closeEditMode();
   };


  /**********
   * RENDER *
   **********/
  
  return (
    <div className={`col-4 ${fileGalleryStyle.imgWpr} ${editMode ? fileGalleryStyle.editMode : ''}`}>
      <div className={fileGalleryStyle.aspectControl} data-handle="true" style={{
        background: `url(${file.src})`
      }}>
        <div className={`${fileGalleryStyle.actionsPanel}`}>
          <div className={fileGalleryStyle.editModeHide}>
            <Tooltipify  tooltipId='edit' tooltipText='edit'>
              <FontAwesomeIcon icon={faWrench} onClick={(e) => { enableEditMode() }} />
            </Tooltipify>
            <Tooltipify  tooltipId='delete' tooltipText='delete'>
              <FontAwesomeIcon icon={faTrash} onClick={(e) => { deleteItem() }} />
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
                <FontAwesomeIcon icon={faCheck} onClick={(e) => { approveCaption() }} />
              </Tooltipify>
              <Tooltipify  tooltipId='deny' tooltipText='deny'>
                <FontAwesomeIcon icon={faTimes} onClick={(e) => { denyEdits() }} />
              </Tooltipify>
          </div>
        </div>
        <div className={`${fileGalleryStyle.editModeShow} ${fileGalleryStyle.captionInput}`}>
          <input type='text' value={caption} onChange={updateCaption} />
        </div>
      </div>
    </div>
  )
});