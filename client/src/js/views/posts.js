import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// redux
import { getMorePostsPreviewAction, clearActivePostAction, deletePostAction } from '../actions/posts.actions.js';
import { useSelector, useDispatch} from 'react-redux';

// custom hooks / utils
import useInfiniteScroll from '../hooks/useInfiniteScroll.js';

// services
import PostsService from '../services/posts.services.js';
import GeneralService from '../services/general.services.js';

// components
import Gravatar from 'react-gravatar';
import Tooltipify from '../components/Tooltipify.js';

import moment from 'moment';
import AsyncHandler from '../components/AsyncHandler.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
  }, [postsData.deleteError])

  /*********
   * HELPERS
   ********/

   const deletePost = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(deletePostAction(id));
   }

  /***********
   * RENDER
   **********/
  return (
    <div className={postsStyle.posts}>
      {!postsData.processing && postsData.items ? (
        <div className={postsStyle.actions}>
          <Link to="/dashboard/add">
            <FontAwesomeIcon icon={faPlus} />
            Add Post
          </Link>
        </div>
      ) : (
        ''
      )}

      <AsyncHandler processing={postsData.processing} error={postsData.error}>
        {postsData.moreProcessing || postsData.items ? (
          <ul className={`${postsStyle.postList}`} ref={postListRef}>
            {/* preview items */}
            {postsData.items.map((post) => {
              return (
                <li key={post.id} className={`row ${postsStyle.postItem}`}>
                  <Link to={`/dashboard/edit/${post.id}`} className={postsData.deleteProcessing ? postsStyle.disabled : ''}>
                    <div className={`col-sm-7 ${postsStyle.titleSection} ${!post.published ? postsStyle.draft : ''}`}>
                      <div className={postsStyle.keyImage}>{!post.keyFile ? '' : <img src={post.keyFile.src} />}</div>
                      <div className={postsStyle.text}>
                        <span className={postsStyle.title}>
                          {post.title}
                          <Tooltipify tooltipId='category' tooltipText={post.category}>
                            <span className={postsStyle.dot} style={{ background: PostsService.getCategoryColorByName(post.category) }}></span>
                          </Tooltipify>
                        </span>
                        {!post.published ? <span className={`${postsStyle.badge} badge badge-secondary`}>Draft</span> : ''}
                        {!postsData.deleteProcessing ? (
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
