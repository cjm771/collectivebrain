
import React, { useState, useEffect } from 'react';

// components
import {SortableElement} from 'react-sortable-hoc';
import Tooltipify from './Tooltipify.js';

// styles
import fileGalleryStyle from '../../scss/fileGallery.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faTrash, faComment, faTimes, faCheck, faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import { bounceOut, animated} from 'animate.css';

export default SortableElement(({file, onApproveCaption, onDelete, _disabled}) => {


  /*********
   * HOOKS *
  **********/

 const [editMode, setEditMode] = useState(false);
 let  [caption, setCaption] = useState(file.caption);
 let  [dirty, setDirty] = useState(false);
 let [shouldDisappear, setShouldDisappear] = useState(false);

 console.log(_disabled);

 useEffect(() => {
  if (file && file.error) {
    setTimeout(() => {
      setShouldDisappear(true);
    }, 4000);
  }
 }, [file.error]);


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
    <div className={`col-4 ${fileGalleryStyle.imgWpr} ${editMode ? fileGalleryStyle.editMode : ''}  ${file.error ? fileGalleryStyle.error : ''}  ${shouldDisappear ? `${animated} ${bounceOut}` : ''}`}>
      <div className={`${fileGalleryStyle.aspectControl} ${file.previewUrlThumb ? fileGalleryStyle.preview : ''}`} data-handle="true" style={{
        background: `url(${file.srcThumb || file.previewUrlThumb || file.src})`,
        backgroundSize: 'cover'
      }}>
        <img src={file.srcThumb || file.previewUrlThumb || file.src} data-handle="true" />
        <div className={`${fileGalleryStyle.actionsPanel}`}>
          { file.error ? (
              <Tooltipify  tooltipId='error' tooltipText={file.error}>
                <FontAwesomeIcon icon={faExclamationCircle} />
              </Tooltipify>
            ) : (
              <div>
                <div className={fileGalleryStyle.editModeHide}>
                  { _disabled ? '' : 
                    <div>
                      <Tooltipify  tooltipId='edit' tooltipText='edit'>
                        <FontAwesomeIcon icon={faWrench} onClick={(e) => { enableEditMode() }} />
                      </Tooltipify>
                      <Tooltipify  tooltipId='delete' tooltipText='delete'>
                        <FontAwesomeIcon icon={faTrash} onClick={(e) => { deleteItem() }} />
                      </Tooltipify>
                    </div>
                  }
                  
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
          )}
        
        </div>
        {
          file.progress ? (
          <div className={`${fileGalleryStyle.progress}`}>
            <div className={`${fileGalleryStyle.progressBar}`} style={{width: file.progress + '%'}}></div>
          </div>)
          : ''
        }
        
        <div className={`${fileGalleryStyle.editModeShow} ${fileGalleryStyle.captionInput}`}>
          <input type='text' value={caption} onChange={updateCaption} placeholder='Enter Caption here...' />
        </div>
  
      </div>
    </div>
  )
});