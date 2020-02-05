// react + redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// actions
import { getPostAction } from '../actions/posts.actions.js';

// services 
import postService from '../services/posts.services.js';

// components
import AsyncHandler from '../components/AsyncHandler.js';
import Input from '../components/Input.js';
import FileGallery from '../components/FileGallery.js';

//  styles
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default ({ match, page }) => {

  /*********
   * HOOKS
  ********/

  const [errorFields, setErrorFields] = useState([]);
  const [inputs, setInputs] = useState({title: ''});
  const [subCatOptions, setSubCatOptions] = useState(postService.getSubCategoriesFromCategoryName('UNCATEGORIZED'));

  const user = useSelector((state) => { return state.user });
  const postData = useSelector((state) => {
    return state.posts;
  })
  const dispatch = useDispatch();
  if (page === 'edit') {
    useEffect(() => {
      dispatch(getPostAction({
        id: match.params.id
      }))
    }, [match.params.id]);
  }

  useEffect(() => {
    if (postData.activeItem) {
      updateSubCategoriesByCatname(postData.activeItem.category);
    }
  }, [postData.activeItem])
  
  
  /*********
   * HELPERS
   ********/

   const updateSubCategoriesByCatname = (categoryName) => {
    setSubCatOptions(postService.getSubCategoriesFromCategoryName(categoryName));
   }

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    return null;
  };

  const handleInputChange = (value, name) => {
    if (name === 'category') {
      updateSubCategoriesByCatname(postService.getCategoryName(value));
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
              <Input 
                type="dropdown"
                name="author"
                onChange={handleInputChange} 
                initValue={page === 'add' ? user.name : postData.activeItem.user.name}
              ></Input>
              <div className={`row ${formStyle.half}`}>
                <div className='col-12 col-sm-6'>
                  <Input 
                  type="dropdown"
                  name="category"
                  options={postService.CATEGORIES}
                  onChange={handleInputChange} 
                  initValue={page === 'add' ? '' : postService.getCategoryIndexByName(postData.activeItem.category)}
                ></Input>
                </div>
                <div className='col-12 col-sm-6'>
                  <Input 
                    type="dropdown"
                    name="subCategory"
                    options={subCatOptions}
                    onChange={handleInputChange} 
                    initValue={page === 'add' ? '' :  postService.getSubCategoryIndexByName(postData.activeItem.subCategory)}
                  ></Input>
                </div>
              </div>
              <Input 
                type="text"
                name="title"
                onChange={handleInputChange} 
                initValue={page === 'add' ? '' : postData.activeItem.title}
              ></Input>
              <Input 
                type="textarea"
                name="description"
                onChange={handleInputChange} 
                initValue={page === 'add' ? '' : postData.activeItem.description}
              ></Input>
              <Input 
                type="text"
                name="creator"
                onChange={handleInputChange} 
                initValue={page === 'add' ? '' : postData.activeItem.creator}
              ></Input>
              <div className={`row ${formStyle.halfWithIcon}`}>
                <div className='col-12 col-sm-5'>
                  <Input 
                    type="date"
                    name="startDate"
                    onChange={handleInputChange} 
                    initValue={page === 'add' ? '' : postData.activeItem.startDate}
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
                    initValue={page === 'add' ? '' : postData.activeItem.endDate}
                  ></Input>
                </div>
              </div>
              <div>
                <FileGallery files={postData.activeItem.images} />
              </div>
              <Input 
                type="text"
                name="tags"
                onChange={handleInputChange} 
                initValue={page === 'add' ? '' : postData.activeItem.tags && postData.activeItem.tags.join(', ')}
              ></Input>
               <Input 
                type="textarea"
                name="sources"
                onChange={handleInputChange} 
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
                  initValue={page === 'add' ? false : postData.activeItem.published}
                ></Input>
                </div>
              </div>
            
              <button onClick={handleSubmit} className={formStyle.button}>
                {'save'}
              </button>
            </form>
            )
          }
      
        </div>
      </AsyncHandler>
  );
};
