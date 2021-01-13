// react + redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// resources
import { useBeforeunload } from 'react-beforeunload';

// actions
import { getPostAction, getTagsAction, updateOrCreatePostAction, clearActivePostAction } from '../actions/posts.actions.js';
import { getGroupsAction } from '../actions/group.actions.js';

// services 
import postService from '../services/posts.services.js';
import generalService from '../services/general.services.js';
import userService from '../services/users.services.js';

// components
import AsyncHandler from '../components/AsyncHandler.js';
import Input from '../components/Input.js';
import FileGallery from '../components/FileGallery.js';
import CBAutocompleteInput from '../components/CBAutocompleteInput.js';
import TagCloud from '../components/TagCloud.js';

//  styles
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons';

export default ({ match, page, onUnsavedChanges, ignoreUnsavedChanges, onDiscardChanges }) => {

  /*********
   * HOOKS
  ********/

  const [inputs, setInputs] = useState({title: ''});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [userThemeMap, setUserThemeMap] = useState(userService.THEME_DICT.dark);
  const [subCatOptions, setSubCatOptions] = useState(postService.getSubCategoriesFromCategoryName('UNCATEGORIZED'));
  const [tags, setTags] = useState([]);
  const [filterAutoCompleteOptions, setFilterAutoCompleteOptions] = useState([]);
  const [groupTagsForCloud, setGroupTagsForCloud] = useState([]);

  const user = useSelector((state) => { return state.user });
  const postData = useSelector((state) => { 
    return state.posts;
  });
  const groupsData = useSelector((state) => {
    state.groups.options = {};
    state.groups.items.forEach((option) => {
      state.groups.options[option.name] = option.id;
    });
    return state.groups;
  });

  const dispatch = useDispatch();

  const hasErrors = (field) => {
    return postData.savingErrorFields && postData.savingErrorFields.indexOf(field) !== -1 
  };

  useEffect(() => {
    if (postData.groupTags) {
      setFilterAutoCompleteOptions(postService.getAllTags(postData.groupTags));
      setGroupTagsForCloud(postService.getAllTags(postData.groupTags, true));
    }
  }, [postData.groupTags]);

  useEffect(() => {
    const theme = userService.getThemeMap(user);
    setUserThemeMap(theme);
  }, [user]);

  useEffect(() => {
    dispatch(getGroupsAction());
  }, []);

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
    if (inputs.group) {
      dispatch(getTagsAction(
        {group: inputs.group}
      ));
    }
  }, [inputs.group]);

  useEffect(() => {
    if (postData.activeItem) {
      updateSubCategoriesByCatname(postData.activeItem.category);
    }
    if (postData.activeItem && postData.activeItem.tags) {
      setTags(postData.activeItem.tags);
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

  useEffect(() => {
    // if (postData.activeItem && (postData.activeItem.tags === null || postData.activeItem.tags.join(', ') !== tags.join(', '))) {
    if (tags) {
      handleInputChange(tags.join(', '), 'tags', postData.activeItem && (postData.activeItem.tags === null || postData.activeItem.tags.join(', ') !== tags.join(', ')));
    }
    // }
  }, [tags])

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



  const removeFilter = (filter) => {
    setTags(tags.filter((tag) => {
      return tag.trim() !== filter.trim();
    }))
  }

  const addFilter = (toSet) => {
    setTags([...new Set([...tags, toSet.trim()])]);
  }


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
              {
                groupsData && groupsData.items.length ? 
                <Input 
                  type="dropdown"
                  name="group"
                  onChange={handleInputChange}
                  options={groupsData.options}
                  disabled={user.role !== 2}
                  initValue={(postData && postData.activeItem && postData.activeItem.group.id) || (user.activeGroup && user.activeGroup.id) || groupsData.items[0].id}
                ></Input> :
                ''
              }
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
              <ul className={formStyle.tagsList}>
                {
                  tags.map((tag,key) => {
                    return (
                      <li className={formStyle.tagsListItem} key={key} onClick={() => { removeFilter(tag) }}>
                        <span className={formStyle.tagName}>#{tag.trim()} </span>
                        <span className={`${formStyle.close}`}>
                            <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
                        </span>
                      </li>
                    )
                  })
                }
              </ul>
              <CBAutocompleteInput 
                placeholder="Type tags + hit Enter to add.."
                onSelect={addFilter}
                options={filterAutoCompleteOptions}
                themeMap={userThemeMap}
              />
              <TagCloud tags={groupTagsForCloud} maxCount={10} toIgnore={tags} onTagClick={addFilter} />
              {/* <Input 
                type="text"
                name="tags"
                onChange={handleInputChange} 
                error={hasErrors('tags')}
                disabled={!allowedToEdit()}
                initValue={page === 'add' ? '' : postData.activeItem.tags && postData.activeItem.tags.join(', ')}
              ></Input> */}
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
                unsavedChanges ? <div className={formStyle.warningBox}><a href='#' onClick={onDiscardChanges}>Discard Changes</a></div> : ''
              }
            </form>
            )
          }
      
        </div>
      </AsyncHandler>
  );
};
