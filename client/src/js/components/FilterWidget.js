// react / redux
import React, {useEffect, useState} from 'react';

// services
import PostsService from '../services/posts.services.js';
import TagCloud from '../services/TagCloud.js';

// components
import CBAutocompleteInput from './CBAutocompleteInput.js';


// styles
import style from '../../scss/filterWidget.scss';
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


export default (props) => {
  const [filterInput, setFilterInput] = useState('');
  const [tags, setTags] = useState([]);
  
  const filterAutoCompleteOptions = PostsService.getAllTags(props.posts);
  // if (props.posts.length) {
  // const tagCloud = new TagCloud(PostsService.getAllTags(props.posts, true));
  //   console.log(tagCloud);
  //   console.log(PostsService.getAllTags(props.posts, true));
  //   debugger;
  // }


  useEffect(() => {
    props.onTagsChange(tags);
  }, [tags]);

  const removeFilter = (filter) => {
    setTags(tags.filter((tag) => {
      return tag.trim() !== filter.trim();
    }))
  }

  const addFilter = (toSet) => {
    setTags([...new Set([...tags, toSet.trim()])]);
  }

  const handleInputChange = (neVal) => {
    setFilterInput(neVal);
  }

  return (
    <div className={style.filterWidget}>
       <ul className={style.activeFilters}>
         {
           tags.map((tag,key) => {
            return (
              <li key={key} onClick={() => { removeFilter(tag) }}>#{tag} 
                <span className={`${style.closeIcon} ${style.actionIcon} ${style.persistent}`}>
                    <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
                </span>
              </li>
            )
           })
         }
       </ul>
       <CBAutocompleteInput 
          placeholder="Tyoe tags + hit Enter to filter.."
          onSelect={addFilter}
          options={filterAutoCompleteOptions}
        />
      <div className={style.dualButton}>
        <div className={`${style.left} ${props.mode === '2D' ? style.active : ''}`} onClick={() => props.onModeChange('2D')}>
          2D
        </div>
        <div className={`${style.right} ${props.mode === '3D' ? style.active : ''}`} onClick={() => props.onModeChange('3D')}>
          3D
        </div>
      </div>
    </div>
  )
}