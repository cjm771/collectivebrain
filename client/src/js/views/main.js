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
import GraphAdminControls from '../components/GraphAdminControls.js';
import BookStack from '../components/BookStack.js';

// styles
import mainStyle from '../../scss/main.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';

const CBForceGraph2dMemo = React.memo(CBForceGraph2d, (prevProps, nextProps) => {
  const prevfocusNode = prevProps.focusNode && prevProps.focusNode.post.id;
  const nextfocusNode = nextProps.focusNode && nextProps.focusNode.post.id;
  return JSON.stringify(prevProps.posts.items.map((item) => item.id)) === JSON.stringify(nextProps.posts.items.map((item) => item.id))
    && (!nextfocusNode || (prevfocusNode === nextfocusNode));
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
    const [activeNode, setActiveNode] = useState(null);
    const [focusNode, setFocusNode] = useState(null);
    const [bookStack, setBookStack] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [userThemeMap, setUserThemeMap] = useState(UserService.THEME_DICT.dark);
    const groupsData = useSelector((state) => { 
      return state.groups;
    });
    useEffect(() => {
      dispatch(getGroupsAction());
    }, []);

    useEffect(() => {
      if (groupsData && groupsData.items && groupsData.items.length) {
        const filteredGroups = groupsData.items.filter((group) => {
          return group.name === match.params.group;
        });
        const groupToSet = filteredGroups.length ? filteredGroups[0] : groupsData.items[0];
        setActiveGroup(groupToSet);
        dispatch(getPostsAction(
          {group: (groupToSet && groupToSet.id) || null}
        ));
      }
    }, [groupsData, groupsData.items]);
    
    const posts = useSelector((state) => { 
      if (state.posts.items.length) {
        state.posts.items = state.posts.items.filter((post) => {
          return post.published;
        });
      }
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
      if (activeNode) {
        addToBookStack(activeNode);
      }
    }, [activeNode]);

    useEffect(() => {
      console.log('focust post changed!', focusNode);
    }, [focusNode]);

    useEffect(() => {
      setFilteredPosts(posts);
    }, [posts]);

    /***********
     * HELPERS
     **********/

    const handleZoomPan = () => {
      // setModalVisible(false);
    };

    const closeDrawer = () => {
      setDrawerVisible(false);
    };

    const handleClick = (node) => {
      setActiveNode(node);
      setTimeout(() => {
        setDrawerVisible(true);
      }, ANIM_DELAY);
    };
    

    const handleSetMode = (mode) => {
      setMode(mode);
    };

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
    };

    const addToBookStack = (targetNode) => {
      let found = false;
      bookStack.forEach((node) => {
        if (node.post.id === targetNode.post.id) {
          found = true;
        }
      });

      if (!found) {
        setBookStack([targetNode, ...bookStack]);
      }
    };

    const removeFromBookStack = (targetNode) => {
      const newStack = [];
      bookStack.forEach((node) => {
        if (node.post.id !== targetNode.post.id) {
          newStack.push(node);
        }
      });
      setBookStack(newStack);
    };

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
                
                { activeGroup && posts && posts.items && UserService.isAdmin(user) ?
                  <GraphAdminControls activeGroup={activeGroup} />
                  : ''
                }
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
              {activeGroup && filteredPosts && filteredPosts.items && filteredPosts.items.length  ? (
              <div className={mainStyle.forceGraph}>
                {
                  mode === '2D' ?
                <CBForceGraph2dMemo
                  focusNode={focusNode}
                  animationDuration={ANIM_DELAY}
                  posts={filteredPosts}
                  graphSettings={activeGroup.graphSettings}
                  onZoomPan={handleZoomPan}
                  onClick={handleClick}
                  themeMap={userThemeMap}
                /> :
                <CBForceGraph3dV2
                  focusNode={focusNode}
                  animationDuration={ANIM_DELAY}
                  posts={filteredPosts}
                  graphSettings={activeGroup.graphSettings}
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
                  <div className={`${mainStyle.closeWpr}`} onClick={closeDrawer}>
                    <div 
                      className={`${mainStyle.closeIcon} ${mainStyle.actionIcon}  ${mainStyle.persistent}`}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </div>
                  </div>
                  {
                    drawerVisible ? 
                    <Post node={activeNode} />
                  : ''
                  }
                </div>
                {
                  drawerVisible && bookStack.length > 1 ? 
                    <BookStack 
                      nodes={bookStack} 
                      activeNode={activeNode}
                      onBookRemove={(node) => { removeFromBookStack(node) }}
                      onBookClick={(node) => { setActiveNode(node); setFocusNode(node); }}
                    />
                  : ''
                }
              </div>
            </div>
          ) 
        }
    
      </div>
    )

};