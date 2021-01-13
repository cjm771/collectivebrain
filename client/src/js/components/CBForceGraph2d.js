import React, {useEffect, useRef, useState} from 'react';
import { ForceGraph2D } from 'react-force-graph';
import PostsService from '../services/posts.services.js';
    
export default (props) => {
  /*********
   * HOOKS
   ********/

  const [images, setImages] = useState(null);
  useEffect(() => {
    loadImages(props.posts.items).then((_images) => {
      setImages(_images);
    });
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

  const loadImages = (posts) => {
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
        let imageSrc = post.files[0].src;
        if (/\.obj$/.test(post.files[0].src)) {
          imageSrc = `/obj-thumbnailer?url=${post.files[0].src}`;
        }
          postIds.push(post.id);
          toLoad.push(new Promise((res, rej) => {
            const image = new Image();
            image.onload = () => {
              res(image);
            }
            image.onerror = () => {
              res(null);
            }
            image.src = imageSrc;
          }));
        }
      }
    const returnDict = {};
    return Promise.all(toLoad).then((imgs) => {
      imgs.forEach((img, index) => {
        if (img) {
          returnDict[postIds[index]] = img;
        }
      });
      return returnDict;
    });
  };

  const handleCanvasObject = (node, ctx, globalScale) => {
    if (node.post.files && node.post.files.length) {
     ctx.drawImage(images[node.post.id], node.x - 5, node.y - 5, 10, 10);
     return;
    }
    const label = node.post.title;
    const fontSize = 2;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

    ctx.fillStyle = PostsService.getSubCategoryColorByName(node.post.subCategory);
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText(label, node.x, node.y)
  };

  const handleClick = (node) => {
    // Aim at node from outside it
    props.onClick(node);
    fgRef.current.zoom(20, 3000);
    fgRef.current.centerAt(node.x, node.y, 3000);  // ms transition duration
  };

  /*********
   * RENDER
   ********/
  return (
  images ? 
    <ForceGraph2D 
      graphData={generateGraph(props.posts.items)}
      nodeRelSize={8}
      linkOpacity={100}
      linkColor={() => props.themeMap.linkColor}
      linkWidth={.5}
      linkCurvature={.2}
      d3VelocityDecay={.85}
      ref={fgRef}
      enableNodeDrag={false}
      showNavInfo={false}
      onNodeClick={handleClick}
      nodeCanvasObject={handleCanvasObject}
    /> : ''
)};
