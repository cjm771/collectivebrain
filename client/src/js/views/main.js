import React, {useEffect} from 'react';
import mainStyle from '../../scss/main.scss';
import {useDispatch, useSelector} from 'react-redux';
import {getPostsAction} from '../actions/posts.actions.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ForceGraph3D } from 'react-force-graph';
import { isDebuggerStatement } from '@babel/types';

export default () => {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(getPostsAction());
    }, []);

    const posts = useSelector((state) => { return state.posts });

  //   {
  //     "nodes": [
  //         {
  //           "id": "id1",
  //           "name": "name1",
  //           "val": 1
  //         },
  //         {
  //           "id": "id2",
  //           "name": "name2",
  //           "val": 10
  //         },
  //         (...)
  //     ],
  //     "links": [
  //         {
  //             "source": "id1",
  //             "target": "id2"
  //         },
  //         (...)
  //     ]
  // }
    const generateGraph = (posts) => {
      const result = {
        nodes: [],
        links: []
      };
      const tagGroups = {};
      posts.forEach(post => {
        // generate nodes
        result.nodes.push({
          id: post.id,
          name: `${ post.title } [${ post.category }] ///// ${post.tags ? post.tags.join(',') : ''}`,
          category: post.category,
          value: 1
        });
        // gather.. group ids by tag 
        if (post.tags) {
          post.tags.forEach(tag => {
            if (!tagGroups[tag]) {
              tagGroups[tag] = [];
            }
            tagGroups[tag].push(post.id);
          });
        }
      });
      // process tag groups to generate links
      Object.keys(tagGroups).forEach((tagName) => {
        const postIds = tagGroups[tagName];
        if (postIds.length > 1) {
          // handle all that isnt last
          for (let i = 0; i < postIds.length; i++) {
            for (let j = i + 1; j < postIds.length; j++) {
              result.links.push({
                source: postIds[i],
                target: postIds[j]
              });
            }
          } 
        }
      });
      return result;
    }
    
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
            <div className={mainStyle.forceGraph}>
              <ForceGraph3D 
                graphData={generateGraph(posts.items)}
                backgroundColor='rgba(255,255,255,0)'
                nodeColor='rgb(0,0,0)'
                linkCurvature={0.2}
                nodeAutoColorBy="category"
              />
            </div>
          ) : ''
        }
    
      </div>
    );
};