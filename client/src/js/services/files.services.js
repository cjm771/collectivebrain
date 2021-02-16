import * as THREE from 'three';

export default {
  getPreviewDataUrl : (file) => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        // convert image file to base64 string
        res(reader.result);
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      }
    })
  },
  dataURItoBlob: (dataURI) => {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    //Old Code
    //write the ArrayBuffer to a blob, and you're done
    //var bb = new BlobBuilder();
    //bb.append(ab);
    //return bb.getBlob(mimeString);

    //New Code
    return new Blob([ab], {type: mimeString});
  },
  generatePlaceholderTextThumbnail : (
    placeholderText='My Beautiful Dark Twisted Fantasy.mp3',
    boundBox=[300, 300],
    fgColor='#fff',
    bgColor='#aaa'
  ) => {
    if (!boundBox || boundBox.length != 2) {
      throw "You need to give the boundBox"
    }
  
    // below are constants you can modify or parameterize as well
    let fontSize =  30;
    const maxChars = 30;
    const ellipsis = '...';
    const padding = 15;
  
    const [w, h] = boundBox;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext('2d');
    
    if (maxChars < placeholderText.length + ellipsis.length) {
        const rmStart = maxChars / 2;
        const rmEnd = placeholderText.length - rmStart + ellipsis.length;
        placeholderText = `${placeholderText.slice(0, rmStart)}${ellipsis}${placeholderText.slice(rmEnd)}`;
    }
    canvas.width = w;
    canvas.height = h;
    ctx.font = `${fontSize}px Arial`;
    
    while(ctx.measureText(placeholderText).width > (canvas.width - padding * 2)) {
      fontSize--;
      ctx.font = `${fontSize}px Arial`;
    }
  
    ctx.fill = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fgColor;
    ctx.textAlign = "center";
    ctx.fillText(placeholderText, w / 2, h / 2);
  
    return canvas.toDataURL('jpg');
  },
  generateThumbnailFromImageFile : (file, boundBox=[300,300]) => {
    if (!boundBox || boundBox.length != 2){
      throw "You need to give the boundBox"
    }
    var scaleRatio = Math.min(...boundBox) / Math.max(file.width, file.height)
    var reader = new FileReader();
    var canvas = document.createElement("canvas")
    var ctx = canvas.getContext('2d');
  
    return new Promise((resolve, reject) => {
      reader.onload = function(event){
          var img = new Image();
          img.onload = function(){
              var scaleRatio = Math.min(...boundBox) / Math.max(img.width, img.height)
              let w = img.width*scaleRatio
              let h = img.height*scaleRatio
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(img, 0, 0, w, h);
              return resolve(canvas.toDataURL(file.type))
          }
          img.src = event.target.result;
      }
      reader.readAsDataURL(file);
    })
  },
  generateObjThumbnail : (srcObj, size=300) => {
    var renderer, scene, camera, banana;
    const canvas = document.createElement("canvas");
    const [ww, wh] = [size, size];
  
    function init() {
      const ctx = canvas.getContext("webgl");
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
      renderer.setSize(ww, wh);
      renderer.setClearColor(0x000000, 0);
  
      scene = new THREE.Scene();
  
      camera = new THREE.PerspectiveCamera(50, ww / wh, 0.1, 10000);
      camera.position.set(0, size * 1.2 / 2, size * 1.2);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(camera);
  
      //Add a light in the scene
      directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, size * 1.2, size * 1.2);
      directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
      const light = new THREE.AmbientLight(0x404040, 0.2);
      scene.add(light);
      scene.add(directionalLight);
  
      //Load the obj file
      return loadOBJ();
    }
  
    var loadOBJ = function () {
      //Manager from ThreeJs to track a loader and its status
      var manager = new THREE.LoadingManager();
      //Loader for Obj from Three.js
      var loader = new THREE.OBJLoader(manager);
  
      return new Promise((res, rej) => {
         try {
            if (/\n/.test(srcObj)) {
                const url = addBananaInScene(loader.parse(srcObj));
                res(url);
            } else {
              loader.load(srcObj, (object) => {
                const url = addBananaInScene(object);
                res(url);
              });
            }
        
         } catch (e) {
           rej(e);
         }
      })
  
      // loader.load(teapot, addBananaInScene);
    };
  
    function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
      pointIsWorld = pointIsWorld === undefined ? false : pointIsWorld;
  
      if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
      }
  
      obj.position.sub(point); // remove the offset
      obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
      obj.position.add(point); // re-add the offset
  
      if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
      }
  
      obj.rotateOnAxis(axis, theta); // rotate the OBJECT
    }
  
    var addBananaInScene = function (object) {
      banana = object;
  
      //Move the banana in the scene
      // banana.rotation.x = Math.PI/2;
      banana.position.x = 0;
      banana.position.y = 0;
      banana.position.z = 0;
      // banana.rotation.y = Math.PI / 6 * -1;
      // banana.rotation.x = Math.PI / 6;
      //Go through all children of the loaded object and search for a Mesh
      object.traverse(function (child) {
        //This allow us to check if the children is an instance of the Mesh constructor
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshLambertMaterial({ color: "#fff" });
  
          const tempGeo = new THREE.Geometry().fromBufferGeometry(child.geometry);
  
          // tempGeo.mergeVertices();
  
          // after only mergeVertices my textrues were turning black so this fixed normals issues
          tempGeo.computeVertexNormals();
          tempGeo.computeFaceNormals();
  
          child.geometry = new THREE.BufferGeometry().fromGeometry(tempGeo);
  
          // child.geometry.computeFaceNormals()
          //Sometimes there are some vertex normals missing in the .obj files, ThreeJs will compute them
          // child.geometry.computeVertexNormals();
        }
      });
      //Add the 3D object in the scene
      banana.children[0].geometry.computeBoundingBox();
      let bbox = banana.children[0].geometry.boundingBox;
      const biggestDim = Math.max(
        bbox.getSize().x,
        bbox.getSize().y,
        bbox.getSize().z
      );
      const ratio = (size * .6) / biggestDim;
      banana.position.x = bbox.getCenter().x * -1 * ratio;
      banana.position.y = bbox.getCenter().y * -1 * ratio;
      banana.position.z = bbox.getCenter().z * -1 * ratio;
      // banana.rotation.set(Math.PI / 6,  Math.PI / 6 * -1, 0);
      rotateAboutPoint(
        banana,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        (Math.PI / 6) * -1,
        false
      );
      // rotateAboutPoint(banana, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1),  Math.PI / 3 , false);
      banana.scale.set(ratio, ratio, ratio);
      // banana.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 6 * -1 * ratio);
      // banana.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0),  Math.PI / 6 * ratio);
      scene.add(banana);
      render();
      return canvas.toDataURL("png");
    };
  
    var render = function () {
      // requestAnimationFrame(render);
      //Turn the banana
      renderer.render(scene, camera);
    };
  
    return init();
  }  
};