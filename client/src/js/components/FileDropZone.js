
import React from 'react';

// components
import {useDropzone} from 'react-dropzone';

// styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import fileGalleryStyle from '../../scss/fileGallery.scss';

export default ({inputFiles, onDrop, disabled}) => {

  /*********
   * HOOKS *
  **********/

  const {getRootProps, getInputProps} = useDropzone({onDrop});

  /**********
   * RENDER *
   **********/

  return (
    <div {...getRootProps({
    })} 
      disabled={disabled} 
      className={`col-4 
      ${fileGalleryStyle.imgWpr} ${fileGalleryStyle.fileDropZone} ${inputFiles.length === 0 ? fileGalleryStyle.noFiles : ''}`} 
      // onMouseDown={event => { event.stopPropagation(); event.preventDefault(); return false }}
      // onClick={event => { event.stopPropagation(); event.preventDefault(); return false }}
    >
    <input {...getInputProps()} disabled={disabled} accept="image/*" />{
      <div className={`${disabled ? fileGalleryStyle.disabled : ''} ${fileGalleryStyle.addMore}`}>
        <div><FontAwesomeIcon icon={faPlus}/> Add {inputFiles.length ? 'More' : 'Files'}</div>
      </div>}
    </div>
  )
};