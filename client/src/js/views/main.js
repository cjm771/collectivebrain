import React, {useEffect, useState} from 'react';
import mainStyle from '../../scss/main.scss';
import {useDispatch, useSelector} from 'react-redux';
import {getPostsAction} from '../actions/posts.actions.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// components
import CBforceGraph3d from '../components/CBForceGraph3d.js';
import CBModal from '../components/CBModal.js';
import Post from '../components/Post.js';

export default () => {

    /*********
     * VARS
     *********/
    const ANIM_DELAY = 3000;

    /*********
     * HOOKS
     ********/

    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [activePost, setActivePost] = useState(null);

    useEffect(() => {
      dispatch(getPostsAction());
    }, []);
    const posts = useSelector((state) => { 
      return state.posts;
    });
    

    /***********
     * HELPERS
     **********/

    const handleZoomPan = () => {
      setModalVisible(false);
    }

    const handleClick = (post) => {
      setActivePost(post.post)
      setTimeout(() => {
        setModalVisible(true);
      }, ANIM_DELAY);
    }

    /***********
     * RENDER
     **********/
  
    return (
      <div className={mainStyle.main}>
        {
          posts.processing ? (
            <div>
              <h1>Please wait</h1>
              <p><FontAwesomeIcon icon={faSpinner} spin /> Loading..</p>
            </div>
          ) : posts.error ? (
            <div>
              <h1>Error</h1>
              <p>An error ocurred</p>
            </div>
          ) : posts.items && posts.items.length  ? (

            <div>
              <CBModal
                modalVisible = {modalVisible}
                onOverlayInteract={handleZoomPan}
              >
                <Post post={activePost} />
              </CBModal>
              <div className={mainStyle.forceGraph}>
                <CBforceGraph3d 
                  animationDuration={ANIM_DELAY}
                  posts={posts}
                  onZoomPan={handleZoomPan}
                  onClick={handleClick}
                />
              </div>
            </div>
          ) : ''
        }
    
      </div>
    )

};