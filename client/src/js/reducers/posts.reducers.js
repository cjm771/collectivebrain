export default (state = {
  processing: false,
  items: [],
  error: null
}, action) => {
  switch (action.type) {
    case 'GET_POSTS_REQUEST':
      return {
        ...state,
        processing: true
      }
    case 'GET_POSTS_SUCCESS':
      return {
        ...state,
        items: action.posts,
        processing: false
      }
    case 'GET_POSTS_FAILURE':
      return {
        ...state,
        processing: false
      }
    default:
      return state;
  }
};