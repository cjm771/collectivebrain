import React from 'react';
import Carousel from './Carousel.js';
import postStyle from '../../scss/post.scss';

export default ({post}) => {
  const getYear = (date) => {
    return date;
  }
  const dateStr = (post.startDate ? (post.endDate) ? `${getYear(post.startDate)} - ${getYear(post.endDate)}` : (getYear(post.startDate) ? `${getYear(post.startDate)}` : null) : null);
  return (
  <div className={postStyle.post}>
    <div className={postStyle.title}>{ post.title }</div>
    {!dateStr ? '' : (
      <div className={dateStr}>{ dateStr }</div>
    )}
    <div className={postStyle.creator}>{ post.creator }</div>
    <div className={postStyle.category}>{ post.category }</div>
    { }
    {!post.images ? '' : (
      <Carousel images={post.images} _id={post.id} />
    )}
    
    <div className={postStyle.description}>
      { post.description }
    </div>
    {!post.sources ? '' : (
      <ul className={postStyle.sources}>
        {post.sources.map((source) => (
          <li>{ source }</li>
        ))}
      </ul>
    )}
    {!post.tags ? '' : (
      <ul className={postStyle.tags}>
        {post.tags.map((tag) => (
          <li>{ tag }</li>
        ))}
      </ul>
    )}
  </div>
  )
};