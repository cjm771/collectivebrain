// react + redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// resources
import { useBeforeunload } from 'react-beforeunload';

// actions
import { getPostAction, updateOrCreatePostAction, clearActivePostAction } from '../actions/posts.actions.js';

// services 
import postService from '../services/posts.services.js';
import generalService from '../services/general.services.js';

// components
import AsyncHandler from '../components/AsyncHandler.js';
import Input from '../components/Input.js';
import FileGallery from '../components/FileGallery.js';

//  styles
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export default ({ match, page, onUnsavedChanges, ignoreUnsavedChanges, onDiscardChanges }) => {

  /*********
   * HOOKS
  ********/

  const [inputs, setInputs] = useState({title: ''});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [subCatOptions, setSubCatOptions] = useState(postService.getSubCategoriesFromCategoryName('UNCATEGORIZED'));

  const user = useSelector((state) => { return state.user });
  const postData = useSelector((state) => { return state.posts });

  const dispatch = useDispatch();

  const hasErrors = (field) => {
    return postData.savingErrorFields && postData.savingErrorFields.indexOf(field) !== -1 
  };


  if (page === 'edit') {
    useEffect(() => {
      dispatch(getPostAction({
        id: match.params.id
      }))
    }, [match.params.id]);
  } else if (page === 'add') {
    useEffect(() => {
      dispatch(clearActivePostAction());
    }, [match.params.id]);
  }
  useEffect(() => {
    if (postData.savingError) {
      generalService.notifyError(postData.savingError);
    }
  }, [postData.savingError])

  useEffect(() => {
    if (postData.activeItem) {
      updateSubCategoriesByCatname(postData.activeItem.category);
    }
  }, [postData.activeItem])

  useEffect(() => {
    if (postData.saved) {
      generalService.notifySuccess('Post Saved..redirecting!');
      setTimeout(() => {
        window.location.href = `/dashboard/edit/${postData.saved.id}`;
      }, 1000);
    } 
  }, [postData.saved])


  useBeforeunload((e) => {
    if (!postData.saved && unsavedChanges && !ignoreUnsavedChanges) {
      return 'You have unsaved changes';
    }
  });
  
  
  /*********
   * HELPERS
   ********/

   const allowedToEdit = () => {
    return (postData.activeItem) ? postData.activeItem.canEdit : true;
   }


   const markUnsavedChanges = (file) => {
    if (onUnsavedChanges) {
      onUnsavedChanges(true);
    }
    setUnsavedChanges(true);
   }

   const updateSubCategoriesByCatname = (categoryName) => {
    setSubCatOptions(postService.getSubCategoriesFromCategoryName(categoryName));
   }

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
      dispatch(updateOrCreatePostAction(postService.cleanInputs(inputs, page === 'edit' ? {id: match.params.id} : undefined), page === 'add' ? 'create' : 'update'));
    }
    return null;
  };

  const handleFilesChange = (files, flagUnsaved) => {
    handleInputChange(files, 'files', flagUnsaved);
  }

  const handleInputChange = (value, name, flagUnsaved) => {
    if (name === 'category') {
      updateSubCategoriesByCatname(postService.getCategoryName(value));
    }
    if (flagUnsaved) {
      markUnsavedChanges();
    }
    setInputs(inputs => ({ ...inputs, [name]: value}));
  };

  /*********
   * RENDER
   *********/

  return (
      <AsyncHandler processing={postData.processing} error={postData.error}>
        <div>
          {
            (page === 'edit' && !postData.activeItem) ? '' : (
            <form 
              className={formStyle.form}
              onSubmit={handleSubmit}
            >
              { (postData.savingError) ? 
                <div className={formStyle.errorBox} >
                  {postData.savingError}
                </div>
                : ''
              }
              <Input 
                type="dropdown"
                name="author"
                onChange={handleInputChange} 
                error={hasErrors('user')}
                disabled={true}
                initValue={page === 'add' ? user.name : postData.activeItem.user.name}
              ></Input>
              <div className={`row ${formStyle.half}`}>
                <div className='col-12 col-sm-6'>
                  <Input 
                  type="dropdown"
                  name="category"
                  disabled={!allowedToEdit()}
                  options={postService.CATEGORIES}
                  onChange={handleInputChange} 
                  initValue={page === 'add' ? 0 : postService.getCategoryIndexByName(postData.activeItem.category)}
                ></Input>
                </div>
                <div className='col-12 col-sm-6'>
                  <Input 
                    type="dropdown"
                    name="subCategory"
                    disabled={!allowedToEdit()}
                    options={subCatOptions}
                    onChange={handleInputChange} 
                    initValue={page === 'add' ? 0 :  postService.getSubCategoryIndexByName(postData.activeItem.subCategory)}
                  ></Input>
                </div>
              </div>
              <Input 
                type="text"
                name="title"
                onChange={handleInputChange} 
                disabled={!allowedToEdit()}
                error={hasErrors('title')}
                initValue={page === 'add' ? '' : postData.activeItem.title}
              ></Input>
              <Input 
                type="textarea"
                name="description"
                onChange={handleInputChange}
                disabled={!allowedToEdit()}
                error={hasErrors('description')}
                initValue={page === 'add' ? '' : postData.activeItem.description}
              ></Input>
              <Input 
                type="text"
                name="creator"
                onChange={handleInputChange} 
                disabled={!allowedToEdit()}
                error={hasErrors('creator')}
                initValue={page === 'add' ? '' : postData.activeItem.creator}
              ></Input>
              <div className={`row ${formStyle.halfWithIcon}`}>
                <div className='col-12 col-sm-5'>
                  <Input 
                    type="date"
                    name="startDate"
                    onChange={handleInputChange} 
                    disabled={!allowedToEdit()}
                    error={hasErrors('startDate')}
                    initValue={page === 'add' ? null : postService.getYear(postData.activeItem.startDate)}
                  ></Input>
                </div>
                <div className='col-12 col-sm-2'>
                  <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
                </div>
                <div className='col-12 col-sm-5'>
                  <Input 
                    type="date"
                    name="endDate"
                    onChange={handleInputChange} 
                    disabled={!allowedToEdit()}
                    error={hasErrors('endDate')}
                    initValue={page === 'add' ? null : postService.getYear(postData.activeItem.endDate)}
                  ></Input>
                </div>
              </div>
              <div>
                <FileGallery 
                  disabled={!allowedToEdit()}
                  files={page === 'add' ? null : postData.activeItem.files} 
                  onFileUploaded={markUnsavedChanges} 
                  onChange={handleFilesChange}
                />
              </div>
              <Input 
                type="text"
                name="tags"
                onChange={handleInputChange} 
                error={hasErrors('tags')}
                disabled={!allowedToEdit()}
                initValue={page === 'add' ? '' : postData.activeItem.tags && postData.activeItem.tags.join(', ')}
              ></Input>
               <Input 
                type="textarea"
                name="sources"
                onChange={handleInputChange} 
                error={hasErrors('sources')}
                disabled={!allowedToEdit()}
                initValue={page === 'add' ? '' : postData.activeItem.sources && postData.activeItem.sources.join('\n')}
              ></Input>
              <div className={`row ${formStyle.halfLeftRightAligned}`}>
                <div className='col-6'>
                  Published
                </div>
                <div className='col-6'>
                  <Input 
                  type="checkbox"
                  name="published"
                  onChange={handleInputChange} 
                  disabled={!allowedToEdit()}
                  initValue={page === 'add' ? false : postData.activeItem.published}
                ></Input>
                </div>
              </div>
            
              <button onClick={handleSubmit} className={formStyle.button} disabled={postData.saving || !allowedToEdit()}>
              {postData.saving ? 
                <span><FontAwesomeIcon icon={faCircleNotch}></FontAwesomeIcon> saving..</span> :
              (!allowedToEdit() ? 'Read Only' : 'save')
              }
              </button>
              {
                unsavedChanges ? <div class={formStyle.warningBox}><a href='#' onClick={onDiscardChanges}>Discard Changes</a></div> : ''
              }
            </form>
            )
          }
      
        </div>
      </AsyncHandler>
  );
};
