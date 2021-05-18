import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// redux
import { 
  getMorePostsPreviewAction, 
  clearActivePostAction, 
  deletePostAction, 
  clearPostsAction,
  updatePostsSettingsAction,
  getPostsPreviewAction
} from '../actions/posts.actions.js';
import { useSelector, useDispatch} from 'react-redux';

// custom hooks / utils
import useInfiniteScroll from '../hooks/useInfiniteScroll.js';

// services
import PostsService from '../services/posts.services.js';
import GeneralService from '../services/general.services.js';

// components
import Gravatar from 'react-gravatar';
import Tooltipify from '../components/Tooltipify.js';
import Input from '../components/Input.js';

import moment from 'moment';
import AsyncHandler from '../components/AsyncHandler.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

// styles
import postsStyle from '../../scss/posts.scss';
import skeletonStyle from '../../scss/_skeleton.scss';


export default ({ match }) => {
  /*********
   * VARS
   *********/

  /*********
   * HOOKS
   ********/
  // const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const postListRef = useRef();
  const postsData = useSelector((state) => {
    return state.posts;
  });

  useInfiniteScroll(
    getMorePostsPreviewAction, // action
    postListRef, // ref
    'li:last-child', // child selector of ref
    postsData, // data .. looks for data.next to see what
    user, 
    10
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearActivePostAction());
  }, []);

  useEffect(() => {
    if (postsData.deleted) {
      let imageResults = '';
      if (postsData.deletedResults && postsData.deletedResults.deleted  && postsData.deletedResults.deleted.length) {
        imageResults += `${postsData.deletedResults.deleted.length} image(s) associated with post were also deleted! `;
      }
      if (postsData.deletedResults && postsData.deletedResults.notDeleted  && postsData.deletedResults.notDeleted.length) {
        imageResults += `${postsData.deletedResults.notDeleted.length} image(s) associated with posd could not be deleted...`;
      }
      GeneralService.notifySuccess(`Post was deleted! ${imageResults}`);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  })

  useEffect(() => {
    if (postsData.deleteError) {
      GeneralService.notifyError(postsData.deleteError.error);
    }
  }, [postsData.deleteError]);

  /*********
   * HELPERS
   ********/

  const handleInputChange = (value, name) => {
    // if (!postsData.posts || !postsData.posts.length) {
    //   return;
    // }

    if (name === 'filterKeyword') {
      // no op
      handleSortChange({
        filter: (value && value.trim()) || null
      });
    } else if (name === 'sortBy') {
      if (value) {
        handleSortChange({
          sort: {
            dir: postsData.sort.dir,
            by: value
          }
        });
      }
    } else if (name === 'ascDesc') {
      if (value) {
        handleSortChange({
          sort: {
            dir: value,
            by:  postsData.sort.by
          }
        });
      }
    }
  };

  const handleSortChange = (updates) => {
    // dispatch(clearPostsAction());
    // console.log('clearing');
    // dispatch(clearPostsAction());
    dispatch(updatePostsSettingsAction(updates));
  };

   const deletePost = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const shouldDelete = confirm('Are you sure you want to delete this post?');
    if (shouldDelete) {
      dispatch(deletePostAction(id));
    }
   }

  /***********
   * RENDER
   **********/
  return (
    <div className={postsStyle.posts}>
      <div className={postsStyle.actions}>
        <div className={postsStyle.listSettings}>
          <div className={postsStyle.searchInput}>
            <Input 
              type="text"
              name="filterKeyword"
              label="Search"
              placeholder="Search"
              initValue={postsData.filter}
              onChange={handleInputChange}
            ></Input>
          </div>
          <div className={postsStyle.sortBy}>
            <div className={postsStyle.sortByAttr}>
              <Input 
                type="dropdown"
                name="sortBy"
                label="Sort by"
                options={{Date: 'createdAt', Title: 'title'}}
                initValue={postsData.sort.by}
                onChange={handleInputChange} 
              ></Input>
            </div>
            <div className={postsStyle.sortByDir}>
              <Input 
                type="dropdown"
                name="ascDesc"
                label="Direction"
                options={{Asc: 'asc', Desc: 'desc'}}
                initValue={postsData.sort.dir}
                onChange={handleInputChange} 
              ></Input>
            </div>
          </div>
        </div>
        <Link to="/dashboard/add">
          <FontAwesomeIcon icon={faPlus} />
          Add Post
        </Link>
      </div>
      <AsyncHandler processing={postsData.processing} error={postsData.error}>
        {postsData.moreProcessing || postsData.items ? (
          <ul className={`${postsStyle.postList}`} ref={postListRef}>
            {/* preview items */}
            { !postsData.items.length && postsData.moreProcessing !== null ? <ul>No Posts yet!</ul> :
              postsData.items.map((post) => {
              return (
                <li key={post.id} className={`row ${postsStyle.postItem}`}>
                  <Link to={`/dashboard/edit/${post.id}`} className={postsData.deleteProcessing ? postsStyle.disabled : ''}>
                    <div className={`col-sm-7 ${postsStyle.titleSection} ${!post.published ? postsStyle.draft : ''}  ${!post.canEdit ? postsStyle.notEditable  : ''} `}>
                      <div className={postsStyle.keyImage}>{!post.keyFile ? '' : <img src={post.keyFile.srcThumb || post.keyFile.src} />}</div>
                      <div className={postsStyle.text}>
                        <span className={postsStyle.title}>
                          {post.title}
                          <Tooltipify tooltipId='category' tooltipText={post.category}>
                            <span className={postsStyle.dot} style={{ background: PostsService.getCategoryColorByName(post.category) }}></span>
                          </Tooltipify>
                        </span>
                        {!post.published ? <span className={`${postsStyle.badge} badge badge-secondary`}>Draft</span> : ''}
                        {!post.canEdit ?  
                          <Tooltipify tooltipId='readOnly' tooltipText='Read-Only'><span className={postsStyle.icon}><FontAwesomeIcon icon={faLock} /></span></Tooltipify>  : ''}
                        {!postsData.deleteProcessing && post.canEdit ? (
                            <span className={postsStyle.actionIcon} onClick={(e) => {deletePost(e, post.id)}}>
                              <Tooltipify tooltipId='delete' tooltipText='Delete'>
                                <FontAwesomeIcon icon={faTimes} />
                              </Tooltipify>
                            </span>
                           ) : (  postsData.deleteProcessing === post.id ?
                            <span className={`${postsStyle.actionIcon} ${postsStyle.persistent}`}>
                              <Tooltipify tooltipId='deleting..' tooltipText='deleting..'>
                                <FontAwesomeIcon icon={faSpinner} spin />
                              </Tooltipify>
                            </span> : ''
                           )
                        }
                      </div>
                    </div>
                    <div className={`col-sm-5 ${postsStyle.by}`}>
                      <div className={postsStyle.author}>
                        by <Gravatar email={post.user.email} className={postsStyle.authorProfileImage} /> {post.user.name}
                      </div>
                      <div className={postsStyle.date}>{moment(post.createdAt).fromNow()}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
            {postsData.moreProcessing
              ? '12345'.split('').map((i) => {
                  return (
                    <li key={i} className={`row ${postsStyle.postItem}`}>
                      <a href='#'>
                        <div className={`col-sm-10 ${postsStyle.titleSection}`}>
                          <div className={`${skeletonStyle.skeletonCircles} ${postsStyle.keyFile}`}></div>
                          <div className={postsStyle.text}>
                            <div className={skeletonStyle.skeletonInlineBlock} style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      <div className={`col-sm-2 ${postsStyle.by} ${postsStyle.skeleton}`}>
                        <div className={skeletonStyle.skeletonInlineBlock} style={{ width: '100%' }}></div>
                      </div>
                      </a>
                    </li>
                  );
                })
              : ''}
          </ul>
        ) : (
          ''
        )}
      </AsyncHandler>
    </div>
  );
};
