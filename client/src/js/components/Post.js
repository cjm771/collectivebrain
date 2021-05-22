import React from 'react';
import Carousel from './Carousel.js';
import postStyle from '../../scss/post.scss';
import postsService from '../services/posts.services.js';
import Linkify from 'react-linkify';

export default ({node}) => {
  const dateStr = (node.post.startDate ? (node.post.endDate) ? `${postsService.getYear(node.post.startDate)} - ${postsService.getYear(node.post.endDate)}` : (postsService.getYear(node.post.startDate) ? `${postsService.getYear(node.post.startDate)}` : null) : null);
  return (
  <div className={postStyle.post}>
    <div className={postStyle.title}>{ node.post.title }</div>
    {!dateStr ? '' : (
      <div className={postStyle.date}>{ dateStr }</div>
    )}
    <div className={postStyle.creator}>{ node.post.creator }</div>
    <div className={postStyle.category}>{ node.post.category }</div>
    {!node.post.tags || !node.post.tags.length ? '' : (
      <ul className={postStyle.tags}>
        {node.post.tags.map((tag) => (
          <li>{ tag.trim() }</li>
        ))}
      </ul>
    )}
    {!postsService.getImageFiles(node.post.files).length ? '' : (
      <Carousel images={[...postsService.getImageFiles(node.post.files)]} _id={node.post.id} />
    )}
    
    <div className={postStyle.description}>
      {!node.post.description ? '' : node.post.description.split(/\n/g).map((item, idx) => (
         <span key={idx}>
         {item}
         <br/>
     </span>
      )) }
    </div>
    {!node.post.sources || !node.post.sources.length ? '' : (
      <ul className={postStyle.sources}>
        {node.post.sources.map((source) => (
          <li><Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="blank" href={decoratedHref} key={key}>
                {decoratedText}
            </a>
        )}>{ source }</Linkify></li>
        ))}
      </ul>
    )}
  </div>
  )
};