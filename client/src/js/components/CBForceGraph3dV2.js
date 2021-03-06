// react / reduz
import React, {useEffect, useRef, useState} from 'react';

// resources
import { SpriteMaterial, Sprite, TextureLoader, MeshLambertMaterial, Mesh, Box3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import SpriteText from 'three-spritetext';

// services
import PostsService from '../services/posts.services.js';
import GraphService from '../services/graph.services.js';

// hooks
import useWindowSize from '../hooks/useWindowResize.js';
import useMaxDragDistance from '../hooks/useMaxDragDistance.js';

// styles
import GraphStyle from '../../scss/graph.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// components
import { ForceGraph3D } from 'react-force-graph';
const ForceGraph3DMemo =  React.memo(ForceGraph3D, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.graphData.nodes.map((item) => item.id)) === JSON.stringify(nextProps.graphData.nodes.map((item) => item.id))
  && prevProps.width === nextProps.width
  && prevProps.height === nextProps.height;
});

let originPt = {value: [0, 0]};
let maxDragDistance = {value: 0};

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

  useEffect(() => {
    if (fgRef && fgRef.current && props.focusNode) {
      zoomAndCenter(props.focusNode);
    } 
  }, [props.focusNode]);
  
  const fgRef = useRef();
  const fgWprRef = useRef();
  useMaxDragDistance(fgWprRef, originPt, maxDragDistance);

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
        // if (!hitFirstFile) {
        //   post.files[0].src = 'https://res.cloudinary.com/hpbzpednu/raw/upload/v1609954206/tests/teapot_cfbaif.obj';
        //   hitFirstFile = true;
        // }
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
          color: '#c0c0c0',
          opacity: 1
        }));
      }
      try {
        const imgTexture = new TextureLoader().load(node.post.files[0].srcThumb || node.post.files[0].src, (texture) => {
          if (sprite) {
            const {width, height} = GraphService.calculateAspectRatioFit(texture.image.width, texture.image.height, 20, 20);
            sprite.scale.set(width, height);
          }
        });
        const material = new SpriteMaterial({ map: imgTexture });
        sprite = new Sprite(material);
        sprite.scale.set(20, 20);
      } catch (e) {
        console.log('could not make sprite:', e);
        sprite = drawNodeText(node);
      }
    } 
    if (!sprite) {
      sprite = drawNodeText(node);
    }
    return sprite;
  };

  const drawNodeText = (node) => {
    const wordwrappedTitle = (node.post.title + ' ').replace(/(\S(.{0,20}\S)?)\s+/g, '$1\n').trim();
    let sprite = new SpriteText(wordwrappedTitle);
    sprite.color = PostsService.getCategoryColorByName(node.post.category);
    sprite.fontWeight = 900;
    sprite.padding = 2;
    // sprite.backgroundColor = 'white';
    sprite.textHeight = 1;
    return sprite;
  }

  const zoomAndCenter = (node) => {
    const distance =140;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y,  z: node.z }, // new position
      node, // lookAt ({ x, y, z })
      1000  // ms transition duration
      );
  }

  const handleClick = (node) => {
    // Aim at node from outside it
    if (maxDragDistance.value < 20) {
      zoomAndCenter(node);
      setTimeout(() => {
        props.onClick(node);

      }, 1000);
    }
  };

  const resolveGraphSetting = (graphSettingName) => {
    let resolvedGraphName = GraphService.DEFAULTS[graphSettingName];
    if (props.graphSettings && props.graphSettings[graphSettingName]) {
      resolvedGraphName = props.graphSettings[graphSettingName];
    }
    return resolvedGraphName;
  };

  /*********
   * RENDER
   ********/
  return (
  <div ref={fgWprRef}>
  {
  objs ? 
    <ForceGraph3DMemo 
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
      d3VelocityDecay={resolveGraphSetting('velocityDecay3D')}
      enableNodeDrag={false}
      showNavInfo={false}
      onNodeClick={handleClick}
      nodeAutoColorBy="category"
      nodeThreeObject={handleThreeObject}
    /> : 
    <div className={GraphStyle.loading}> 
      <FontAwesomeIcon icon={faSpinner} spin />Loading 3D Assets..
    </div>
  }
  </div>
)};
