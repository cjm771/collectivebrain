// react / reduz
import React, {useEffect, useRef, useState} from 'react';

// resources
import { SpriteMaterial, Sprite, TextureLoader, MeshLambertMaterial, Mesh, Box3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import SpriteText from 'three-spritetext';

// services
import PostsService from '../services/posts.services.js';

// hooks
import useWindowSize from '../hooks/useWindowResize.js';

// components
import { ForceGraph3D } from 'react-force-graph';

export default (props) => {
  /*********
   * HOOKS
   ********/

   const [objs, setObjs] = useState(null);
   const [width, height] = useWindowSize();

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
    loadObjs(props.posts.items).then((objDict) => {
      setObjs(objDict);
    }).catch((e) => {
    })
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

  const loadObjs = (posts) => {
    const toLoad = [];
    const postIds = [];
    let hitFirstFile = false;
    for (let post of posts) {
      if (post.files && post.files.length) {
        // for testing
        if (!hitFirstFile) {
          post.files[0].src = 'https://res.cloudinary.com/hpbzpednu/raw/upload/v1609954206/tests/teapot_cfbaif.obj';
          hitFirstFile = true;
        }
        if (/\.obj$/.test(post.files[0].src)) {
          postIds.push(post.id);
          toLoad.push(new Promise((res, rej) => {
            new OBJLoader().load(post.files[0].src, (object) => { 
              object.traverse(function (child) {
                if (child instanceof Mesh) {
                  // child.material.map = texture;
                  child.material.transparent = true;
                }
              });
              const geo = object.children[0].geometry;
              const bBox = new Box3().setFromObject(object.children[0]);
              const bBoxSize = bBox.getSize();
              const maxDim = Math.max(bBoxSize.x, bBoxSize.y, bBoxSize.z);
              const scale = 25 / maxDim;
              geo.scale(scale, scale, scale);
              res(geo);
            }, (progress) => {
              // pass
            }, (err) => {
              res(null);
            });
          }));
        }
      }
    }
    const returnDict = {};
    return Promise.all(toLoad).then((geos) => {
      geos.forEach((geo, index) => {
        if (geo) {
          returnDict[postIds[index]] = geo;
        }
      });
      return returnDict;
    });
  };

  const handleThreeObject = (node) => {
    let sprite = null;
    if (node.post.files && node.post.files.length) {
      if (objs[node.post.id]) {
        return new Mesh(objs[node.post.id],
        new MeshLambertMaterial({
          color: 'white',
          opacity: 1
        }));
      }
      try {
        const imgTexture = new TextureLoader().load(node.post.files[0].src);
        const material = new SpriteMaterial({ map: imgTexture });
        sprite = new Sprite(material);
        sprite.scale.set(20, 20);
      } catch (e) {
        console.log('could not make sprite:', e);
      }
    } 
    if (!sprite) {
      let wordwrappedTitle = (node.post.title + ' ').replace(/(\S(.{0,20}\S)?)\s+/g, '$1\n').trim();
      sprite = new SpriteText(wordwrappedTitle);
      sprite.color = '#000000';
      sprite.fontWeight = 800;
      sprite.padding = 2;
      sprite.backgroundColor = PostsService.getSubCategoryColorByName(node.post.subCategory);
      sprite.textHeight = 1;
    }
    return sprite;
  };

  const handleClick = (node) => {
    // Aim at node from outside it
    const distance = 40;
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
  objs ? 
  <ForceGraph3D 
    graphData={generateGraph(props.posts.items)}
    backgroundColor={props.themeMap.bgColor}
    nodeColor='rgb(0,0,0)'
    width={width}
    height={height}
    linkCurvature={0.2}
    linkWidth={.25}
    linkOpacity={1}
    linkColor={() => props.themeMap.linkColor}
    ref={fgRef}
    controlType="orbit"
    d3VelocityDecay={.85}
    enableNodeDrag={false}
    showNavInfo={false}
    onNodeClick={handleClick}
    nodeAutoColorBy="category"
    nodeThreeObject={handleThreeObject}
  /> : ''
)};
