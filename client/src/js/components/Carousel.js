import React, {useState, useEffect} from 'react';
import Carousel from 'react-bootstrap/Carousel';
import carouselStyle from '../../scss/carousel.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FilesService from '../services/files.services.js';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default React.memo(({_id, images}) => {
  /*********
   * VARS
   ********/

  const [_images, _setImages] = useState(null);  

  /*********
   * HOOKS
   ********/
  
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // pre load images
    Promise.all(images.map((img) => {
      return imageWillLoad(img);
    })).then((imgs) => {
      _setImages(imgs)
      setLoading(false);
    })
  }, [images]); 

  /*********
   * HELPERS
   ********/

  const imageWillLoad = (img) => {
    return new Promise((resolve, reject) => {
      const image = new Image('image');
      image.src = img.src;
      image.onload =  () => {
        resolve(img);
      }
      image.onerror = () => {
        img.src = null;
        resolve(null);
      }
    });
  };

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
    if (e) {
      setDirection(e.direction);
    }
  };

  /*********
   * RENDER
   ********/
  return (
    <div className={carouselStyle.carousel}>
      {
        loading ? (
          <div className={carouselStyle.loading}>
            <div>
              <FontAwesomeIcon icon={faSpinner} spin />  Loading...
            </div>
          </div>
        ) : (
        _images ? 
          <Carousel 
            activeIndex={index} 
            direction={direction} 
            onSelect={handleSelect}
            controls={_images.length > 1}
            indicators={_images.length > 1}
          >
            {_images.map((image, index) => (
              image ? 
              <Carousel.Item key={index}>
                <img
                  className={`d-block ${carouselStyle.img}`}
                  src={image.src}
                  alt={image.caption}
                />
                {
                  !image.caption ? '' : (
                    <Carousel.Caption>
                    <p>{image.caption}</p>
                  </Carousel.Caption>
                  )
                }
         
              </Carousel.Item> : ''
            ))}
          </Carousel>
        : '')
      }
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps._id === nextProps._id;
})