import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getPostAction } from '../actions/posts.actions.js';

import AsyncHandler from '../components/AsyncHandler.js';

import classNames from 'classnames';
import formStyle from '../../scss/_forms.scss';

export default ({ match, page }) => {
  /*********
   * HOOKS
  ********/

  const [errorFields, setErrorFields] = useState([]);
  const [inputs, setInputs] = useState({title: ''});

  const user = useSelector((state) => { return state.user });
  const postData = useSelector((state) => {
    return state.posts
  })
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPostAction({
      id: match.params.id
    }))
  }, [match.params.id])
  
  /*********
   * HELPERS
   ********/

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    return null;
  };

  const handleInputChange = (event) => {
    event.persist();
    // dispatch(clearErrorFieldAction(event.target.name));
    setInputs(inputs => ({ ...inputs, [event.target.name]: event.target.value }));
  };


  /*********
   * RENDER
   ********/

  return (
      <AsyncHandler processing={postData.processing} error={postData.error}>
        <div>
          {
            !postData.activeItem ? '' : (
            <form 
              className={formStyle.form}
              onSubmit={handleSubmit}
            >
              <input 
                type="text" 
                className={classNames(formStyle.input, (errorFields && errorFields.indexOf('email') !== -1) ? formStyle.hasErrors : null)} 
                onChange={handleInputChange} 
                value={postData.activeItem.title} 
                placeholder="title" 
                disabled={user.loggingIn}
                name="title"
              />
            </form>
            )
          }
      
        </div>
      </AsyncHandler>
  );
};
