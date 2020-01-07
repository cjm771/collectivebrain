import React, {useEffect, useRef} from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import PostsService from '../services/posts.services.js';
    
const CBForceGraphComponent = (props) => {
  /*********
   * HOOKS
   ********/

  useEffect(() => {
    let timeout;
    const initAfterThreeLoad = () => {
      let angle = 90 * Math.PI / 180;
      let distance = 350;
      if (fgRef && fgRef.current) {
        fgRef.current.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle)
        }, props.animationDuration);
        document.addEventListener('scroll', () => {
          props.onZoomPan();
        });
        fgRef.current.rootElem.querySelector('canvas').addEventListener('mousedown', () => {
          props.onZoomPan();
        });
        clearTimeout(timeout);
      } else {
        timeout = setTimeout(initAfterThreeLoad, 10);
      }
    };
    timeout = setTimeout(initAfterThreeLoad, 10);
  }, []);
  const fgRef = useRef();

  /*********
   * HELPERS
   ********/

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
        post: post,
        value: .1
      });
      // gather.. group ids by tag 
      if (post.tags) {
        post.tagGroups = {};
        post.tags.forEach(tag => {
          if (!tagGroups[tag]) {
            tagGroups[tag] = [];
          }
          tagGroups[tag].push(post);
          post.tagGroups[tag] = tagGroups[tag];
        });
      }
    });
    // process tag groups to generate links
    Object.keys(tagGroups).forEach((tagName) => {
      const postIds = tagGroups[tagName].map(post => {
        return post.id;
      });
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


  const handleThreeObject = ({id, category}) => {
    var texture = new THREE.TextureLoader().load( `/post/static/${id}?format=jpg` )
    // texture.needsUpdate = true;
    var basicMaterial = new THREE.MeshBasicMaterial({
      color: PostsService.getCategoryColorByName(category),
      flatShading: true,
      opacity: 0.75,
      transparent: true
    });

    if (texture) {
      var mainMaterial =  new THREE.MeshBasicMaterial({
        color: 'white',
        flatShading: true,
        opacity: 1,
        map: texture,
      });
    } else {
      mainMaterial = basicMaterial;
    }

    const box = new THREE.Mesh(
    new THREE.BoxGeometry(5, 10.5, .5), [
      basicMaterial,
      basicMaterial,
      basicMaterial,
      basicMaterial,
      mainMaterial,
      mainMaterial,
    ]);
    box.rotation.setFromVector3(new THREE.Vector3(0,  Math.PI / 2, 0));
    return box;
  };

  const handleClick = (node) => {
    // Aim at node from outside it
    const distance = 25;
    props.onClick(node);
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y,  z: node.z }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  };

  /*********
   * RENDER
   ********/
  return (
  <ForceGraph3D 
  graphData={generateGraph(props.posts.items)}
  backgroundColor='rgba(255,255,255,0)'
  nodeColor='rgb(0,0,0)'
  linkCurvature={0.2}
  linkWidth={.035}
  linkOpacity={.7}
  linkColor='rgb(0,0,0)'
  ref={fgRef}
  controlType="orbit"
  d3VelocityDecay={.85}
  enableNodeDrag={false}
  showNavInfo={false}
  onNodeClick={handleClick}
  nodeAutoColorBy="category"
  nodeThreeObject={handleThreeObject}
/>
)};

const propsIsEqual = function (prevProps, nextProps) {
  // adjust this if rerendering is an  issue
  return true;
}

export default React.memo(CBForceGraphComponent, propsIsEqual);
