import React from 'react';

// services
import PostsService from '../services/posts.services.js'; 

// styles
import BookStackStyle from '../../scss/bookStack.scss';
import FormStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default ({ nodes, activeNode, onBookRemove, onBookClick }) => {
  return (
    <div className={BookStackStyle.bookStack}>
      <ul>
       {
         nodes.map((node) => (
          <li key={node.post.id} className={activeNode.post.id === node.post.id ? BookStackStyle.active : ''} onClick={() => { onBookClick(node) }}>
            <span className={BookStackStyle.left} style={{backgroundColor:  PostsService.getCategoryColorByName(node.post.category)}}>

            </span>
            <span className={BookStackStyle.bookStackInner}>
              <span className={BookStackStyle.title}>{ node.post.title }</span>
              <span className={`${BookStackStyle.remove} ${FormStyle.buttonLink}`} onClick={(e) => { e.stopPropagation(); onBookRemove(node)}}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </span>
          </li>
         ))
       } 
      </ul>
    </div>

  )
};