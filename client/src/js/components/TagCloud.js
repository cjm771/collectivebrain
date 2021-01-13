// react + redux
import React from 'react';

// services 
import TagCloud from '../services/tagcloud.services.js';

// styles
import style from '../../scss/tagCloud.scss';
import formStyle from '../../scss/_forms.scss';

export default ({ tags, toIgnore, onTagClick, maxCount }) => {
  tags = tags.filter((tag) => (toIgnore.indexOf(tag.trim()) === -1));
  const tagCloud = TagCloud(tags, 1.75, .75).slice(0, maxCount || null);
  
  return (
    !tagCloud.length ? '' :
    (
      <ul className={style.tagCloudList}>
        {
          tagCloud.map((tag, key) => {
            return (
              <li 
                key={key} 
                className={`${style.tagCloudListItem}`} 
                onClick={() => { onTagClick(tag.word.trim()) }}
                style={
                {fontSize: `${tag.value}rem`}
              }>
                <div className={`${formStyle.buttonLink} ${style.buttonLink}`}>
                  <span className={style.word}>
                    { tag.word } 
                  </span>
                  <span className={style.count}>
                    ({ tag.count })
                  </span>
                </div>
              </li>
            )
          })
        }
      </ul>
    )
  )
}