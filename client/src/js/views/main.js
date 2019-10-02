import React, {useEffect} from 'react';
import mainStyle from '../../scss/main.scss';
import {useDispatch, useSelector} from 'react-redux';
import {getPostsAction} from '../actions/posts.actions.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';

export default () => {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(getPostsAction());
    }, []);

    const posts = useSelector((state) => { return state.posts });

    const getColor = (category) => {
      const colors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#cc0088',
        '#bbaa44',
        '#33ffcc',
        '#aa122a',
        '#fea22b',
        '#00ffff',
      ];
      return colors[CATEGORIES.indexOf(category)];
    }

    const CATEGORIES = [];

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
        if (CATEGORIES.indexOf(post.category) === -1) {
          CATEGORIES.push(post.category);
        }
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
                nodeThreeObject={ ({id, category}) => new THREE.Mesh(
                  new THREE.BoxGeometry(5, 10.5, .5),
                  new THREE.MeshBasicMaterial({
                    color: getColor(category),
                    flatShading: true,
                    opacity: 0.75,
                    transparent: true
                  })
                )}
              />
            </div>
          ) : ''
        }
    
      </div>
    );
};