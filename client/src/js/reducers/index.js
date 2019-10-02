import userReducer from './user.reducers.js';
import { combineReducers } from 'redux';

export default combineReducers({
  user: userReducer
})