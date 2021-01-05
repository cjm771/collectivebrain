import userReducer from './user.reducers.js';
import postsReducer from './posts.reducers.js';
import groupsReducer from './groups.reducers.js';

import { combineReducers } from 'redux';

export default combineReducers({
  user: userReducer,
  posts: postsReducer,
  groups: groupsReducer
})