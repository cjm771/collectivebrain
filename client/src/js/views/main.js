// react / redux
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

// actions
import {getPostsAction} from '../actions/posts.actions.js';
import {getGroupsAction} from '../actions/group.actions.js';

// services
import UserService from '../services/users.services.js';

// components
import CBForceGraph2d from '../components/CBForceGraph2d.js';
import CBForceGraph3dV2 from '../components/CBForceGraph3dV2.js';
import Post from '../components/Post.js';
import FilterWidget from '../components/FilterWidget.js';

// styles
import mainStyle from '../../scss/main.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';

const CBForceGraph2dMemo = React.memo(CBForceGraph2d, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.posts.items.map((item) => item.id)) === JSON.stringify(nextProps.posts.items.map((item) => item.id));
});

export default ({match}) => {

    /*********
     * VARS
     *********/
    const ANIM_DELAY = 0;

    /*********
     * HOOKS
     ********/

    const dispatch = useDispatch();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [mode, setMode] = useState('2D');
    const [tags, setTags] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState(null);
    const [activePost, setActivePost] = useState(null);
    const [userThemeMap, setUserThemeMap] = useState(UserService.THEME_DICT.dark);
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

    const user = useSelector(state => state.user);
    
    useEffect(() => {
      // TODO seperate getting session data vs user data? hacky way to set anon's by querying class
      if (user && user.theme) {
        const theme = UserService.getThemeMap(user.theme);
        setUserThemeMap(theme);
      } else if (!user.loggingIn) {
        let theme = UserService.getThemeMap(null);
        document.querySelector('body').classList.forEach((_class) => {
          const matches = /^theme-(.+)$/.exec(_class);
          if (matches) {
            theme = UserService.getThemeMap(matches[1]);
          }
        });
        setUserThemeMap(theme);
      }
      
    }, [user]);

    useEffect(() => {
      setFilteredPosts(posts);
    }, [posts]);

    /***********
     * HELPERS
     **********/

    const handleZoomPan = () => {
      // setModalVisible(false);
    }

    const closeDrawer = () => {
      setDrawerVisible(false);
    }

    const handleClick = (post) => {
      setActivePost(post.post);
      setTimeout(() => {
        // setModalVisible(true);
        setDrawerVisible(true);
      }, ANIM_DELAY);
    }

    const handleSetMode = (mode) => {
      setMode(mode);
    }

    const handleTagsChange = (newTags) => {
      if (JSON.stringify(tags) !== JSON.stringify(newTags)) {
        setTags(newTags);
        const newFilteredPosts = {...posts};
        newFilteredPosts.items = [...posts.items];
        newFilteredPosts.items = posts.items.filter((post) => {
          let keep = false;

          if (!newTags.length) {
            return true;
          }
          if (!post.tags) {
            return false;
          }
          post.tags.forEach((tag) => {
            if (newTags.indexOf(tag) !== -1) {
              keep = true;
            }
          });
          return keep;
        });
        setFilteredPosts(newFilteredPosts);
      }
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
          ) :  ( <div className={`${mainStyle.mainWpr} ${ drawerVisible ? mainStyle.drawerOpen : ''}`}>
              <div className={mainStyle.filterArea}>
                { posts && posts.items &&  posts.items.length  ? (
                  <FilterWidget 
                  posts={posts.items}
                  mode={mode}
                  onModeChange={handleSetMode}
                  onTagsChange={handleTagsChange}
                  themeMap={userThemeMap}
                />
                ) : '' }

              </div>
              {filteredPosts && filteredPosts.items && filteredPosts.items.length  ? (
              <div className={mainStyle.forceGraph}>
                {
                  mode === '2D' ?
                <CBForceGraph2dMemo
                  animationDuration={ANIM_DELAY}
                  posts={filteredPosts}
                  onZoomPan={handleZoomPan}
                  onClick={handleClick}
                  themeMap={userThemeMap}
                /> :
                <CBForceGraph3dV2
                  animationDuration={ANIM_DELAY}
                  posts={filteredPosts}
                  onZoomPan={handleZoomPan}
                  onClick={handleClick}
                  themeMap={userThemeMap}
                />
                }
              
              </div>) : (
                <div className={mainStyle.noPosts}>
                  { !posts || posts.processing === null ? '' : 'No Posts yet!' }
                </div> 
              )
              }
              <div className={mainStyle.drawer}>
                <div className={mainStyle.drawerInner}>
                  <div className={`${mainStyle.closeWpr}`}>
                    <div 
                      className={`${mainStyle.closeIcon} ${mainStyle.actionIcon}  ${mainStyle.persistent}`}
                      onClick={closeDrawer}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </div>
                  </div>
                  {
                    drawerVisible ? <Post post={activePost} /> : ''
                  }
                </div>
              </div>
            </div>
          ) 
        }
    
      </div>
    )

};