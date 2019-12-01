import React, {useEffect, useState} from 'react';
import dashboardStyle from '../../scss/dashboard.scss';
import {getPostsPreviewAction, getMorePostsPreviewAction} from '../actions/posts.actions.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {useDispatch, useSelector} from 'react-redux';
import Gravatar from 'react-gravatar';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
 


export default () => {
    /*********
     * VARS
     *********/

    /*********
     * HOOKS
     ********/
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);


    useEffect(() => {
      dispatch(getPostsPreviewAction({
        limit: limit,
        offset: offset
      }));
      setOffset(offset + limit);
    }, []);

    useBottomScrollListener(() => {
      debugger;
      dispatch(getMorePostsPreviewAction({
        limit: limit,
        offset: offset
      }));
      setOffset(offset + limit);
    });

    const previewPosts = useSelector((state) => { 
      return state.posts;
    });

    /***********
     * RENDER
     **********/

    return (
      <div className={`container ${dashboardStyle.dashboard}`}>
        {
          previewPosts.processing ? (
            <div>
              <h1>Please wait</h1>
              <p><FontAwesomeIcon icon={faSpinner} spin /> Loading..</p>
            </div>
          ) : previewPosts.error ? (
            <div>
              <h1>Error</h1>
              <p>An error ocurred. Please try again and if problem persists, please contact admin.</p>
            </div>
          ) : previewPosts.items && previewPosts.items.length  ? (

            <ul className={`${dashboardStyle.postList}`}>
              {
                previewPosts.items.map((post) => {
                  return (
                    <li key={post.id} className={`row ${dashboardStyle.postItem}`}>
                      <div className={`col-sm-8 ${dashboardStyle.title}`}>
                      <div className={dashboardStyle.keyImage}>
                        {!post.keyImage ? '' : (
                            <img src={post.keyImage.src} />
                        )}
                      </div>
                      <div className={dashboardStyle.text} >
                        {post.title}
                      </div>
                      </div>
                      <div className={`col-sm-4 ${dashboardStyle.date}`}>
                        by <Gravatar email={post.user.email} className={dashboardStyle.authorProfileImage} /> {post.user.name}, 3 days ago
                      </div>
                    </li>
                  )
                })
              }
            </ul>
          ) : ''
        }
      </div>
    );
};