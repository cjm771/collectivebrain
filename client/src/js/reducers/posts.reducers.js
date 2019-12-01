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
        posts: undefined,
        ...action.posts,
        items: action.posts.posts,
        processing: false
      }
    case 'GET_MORE_POSTS_SUCCESS':
      return {
        ...state,
        posts: undefined,
        ...action.posts,
        items: [...items, ...action.posts.posts],
        processing: false
      }
    case 'GET_POSTS_FAILURE':
      debugger
      return {
        ...state,
        error: action.error,
        processing: false
      }
    default:
      return state;
  }
};