import React from 'react';
import Carousel from './Carousel.js';
import postStyle from '../../scss/post.scss';
import postsService from '../services/posts.services.js';

export default ({post}) => {
  const dateStr = (post.startDate ? (post.endDate) ? `${postsService.getYear(post.startDate)} - ${postsService.getYear(post.endDate)}` : (postsService.getYear(post.startDate) ? `${postsService.getYear(post.startDate)}` : null) : null);
  return (
  <div className={postStyle.post}>
    <div className={postStyle.title}>{ post.title }</div>
    {!dateStr ? '' : (
      <div className={postStyle.date}>{ dateStr }</div>
    )}
    <div className={postStyle.creator}>{ post.creator }</div>
    <div className={postStyle.category}>{ post.category }</div>
    {!post.tags || !post.tags.length ? '' : (
      <ul className={postStyle.tags}>
        {post.tags.map((tag) => (
          <li>{ tag.trim() }</li>
        ))}
      </ul>
    )}
    {!post.files ? '' : (
      <Carousel images={[...postsService.getImageFiles(post.files)]} _id={post.id} />
    )}
    
    <div className={postStyle.description}>
      { post.description }
    </div>
    {!post.sources || !post.sources.length ? '' : (
      <ul className={postStyle.sources}>
        {post.sources.map((source) => (
          <li>{ source }</li>
        ))}
      </ul>
    )}
  </div>
  )
};