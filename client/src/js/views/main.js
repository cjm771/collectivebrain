import React from 'react';
import mainStyle from '../../scss/main.scss';
import {useDispatch} from 'react-redux';
import {getPostsAction} from '../actions/posts.actions.js';

export default () => {
    const dispatch = useDispatch();
    dispatch(getPostsAction());

    return (
      <div className={mainStyle.main}>
        <h1>Main page</h1>
        <p>This is the main page</p>
      </div>
    );
};