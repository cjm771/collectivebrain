import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

// redux
import { getMorePostsPreviewAction } from '../actions/posts.actions.js';
import { useSelector } from 'react-redux';

// custom hooks / utils
import useInfiniteScroll from '../hooks/useInfiniteScroll.js';

// services
import PostsService from '../services/posts.services.js';

// components
import Gravatar from 'react-gravatar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import moment from 'moment';
import AsyncHandler from '../components/AsyncHandler.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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
  const previewPosts = useSelector((state) => {
    return state.posts;
  });

  useInfiniteScroll(
    getMorePostsPreviewAction, // action
    postListRef, // ref
    'li:last-child', // child selector of ref
    previewPosts, // data .. looks for data.next to see what
    10
  );

  /*********
   * HELPERS
   ********/

  /***********
   * RENDER
   **********/
  return (
    <div className={postsStyle.posts}>
      {!previewPosts.processing && previewPosts.items ? (
        <div className={postsStyle.actions}>
          <Link to="/dashboard/add">
            <FontAwesomeIcon icon={faPlus} />
            Add Post
          </Link>
        </div>
      ) : (
        ''
      )}

      <AsyncHandler processing={previewPosts.processing} error={previewPosts.error}>
        {previewPosts.moreProcessing || previewPosts.items ? (
          <ul className={`${postsStyle.postList}`} ref={postListRef}>
            <li>hiiiii</li>
            {/* preview items */}
            {previewPosts.items.map((post) => {
              return (
                <li key={post.id} className={`row ${postsStyle.postItem}`}>
                  <Link to={`/dashboard/edit/${post.id}`}>
                    <div className={`col-sm-7 ${postsStyle.titleSection} ${!post.published ? postsStyle.draft : ''}`}>
                      <div className={postsStyle.keyImage}>{!post.keyImage ? '' : <img src={post.keyImage.src} />}</div>
                      <div className={postsStyle.text}>
                        <span className={postsStyle.title}>
                          {post.title}
                          <OverlayTrigger overlay={<Tooltip id="tooltip-category">{post.category}</Tooltip>}>
                            <span className={postsStyle.dot} style={{ background: PostsService.getCategoryColorByName(post.category) }}></span>
                          </OverlayTrigger>
                        </span>
                        {!post.published ? <span className={`${postsStyle.badge} badge badge-secondary`}>Draft</span> : ''}
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
            {previewPosts.moreProcessing
              ? '12345'.split('').map((i) => {
                  return (
                    <li key={i} className={`row ${postsStyle.postItem}`}>
                      <div className={`col-sm-8 ${postsStyle.titleSection}`}>
                        <div className={`${skeletonStyle.skeletonCircles} ${postsStyle.keyImage}`}></div>
                        <div className={postsStyle.text}>
                          <div className={skeletonStyle.skeletonInlineBlock} style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div className={`col-sm-4 ${postsStyle.date}`}>
                        <div className={skeletonStyle.skeletonInlineBlock} style={{ width: '100%' }}></div>
                      </div>
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
