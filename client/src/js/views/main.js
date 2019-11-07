import React, {useEffect, useCallback, useRef} from 'react';
import mainStyle from '../../scss/main.scss';
import {useDispatch, useSelector} from 'react-redux';
import {getPostsAction} from '../actions/posts.actions.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import PostCanvas from '../components/postCanvas.js';

export default () => {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(getPostsAction());
    }, []);

    let stage;
    const fgRef = useRef();
    const stageRef = useRef();
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

    const handleClick = useCallback(node => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }, [fgRef]);

    
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
              {
                posts.items.slice(0, 20).map((post) => {
                  console.log(posts.items);
                  return <PostCanvas stageRef={stageRef} post={post} key={post.id} />
                })
              }
              {/* <div className={mainStyle.forceGraph}>
                <ForceGraph3D 
                  graphData={generateGraph(posts.items)}
                  backgroundColor='rgba(255,255,255,0)'
                  nodeColor='rgb(0,0,0)'
                  linkCurvature={0.2}
                  ref={fgRef}
                  onNodeClick={handleClick}
                  nodeAutoColorBy="category"
                  nodeThreeObject={ ({id, category}) => {
                    const canvas = stage.content.children[0];
                    var texture = new THREE.CanvasTexture(canvas);
                    var mainMaterial =  new THREE.MeshBasicMaterial({
                      color: 'white',
                      flatShading: true,
                      opacity: 1,
                      map: texture,
                    });
                    var basicMaterial = new THREE.MeshBasicMaterial({
                      color: getColor(category),
                      flatShading: true,
                      opacity: 0.75,
                      transparent: true
                    });
                    return new THREE.Mesh(
                    new THREE.BoxGeometry(5, 10.5, .5), [
                      basicMaterial,
                      basicMaterial,
                      basicMaterial,
                      basicMaterial,
                      mainMaterial,
                      mainMaterial,
                    ]);
                }}
                />
              </div> */}
            </div>
          ) : ''
        }
    
      </div>
    );
};