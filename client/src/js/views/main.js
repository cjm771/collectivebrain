// react / redux
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

// actions
import {getPostsAction} from '../actions/posts.actions.js';
import {getGroupsAction} from '../actions/group.actions.js';

// components
import CBforceGraph3d from '../components/CBForceGraph3d.js';
import CBModal from '../components/CBModal.js';
import Post from '../components/Post.js';

// styles
import mainStyle from '../../scss/main.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default ({match}) => {

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
    const groupsData = useSelector((state) => { return state.groups });
    useEffect(() => {
      dispatch(getGroupsAction());
    }, []);

    useEffect(() => {
      if (groupsData && groupsData.items && groupsData.items.length) {
        const filteredGroups = groupsData.items.filter((group) => {
          return group.name === match.params.group;
        });
        const groupToSet = filteredGroups.length ? filteredGroups[0] : groupsData.items[0];
        dispatch(getPostsAction(
          {group: (groupToSet && groupToSet.id) || null}
        ));
      }
    }, [groupsData]);
    
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