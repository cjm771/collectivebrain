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
    case 'GET_MORE_POSTS_REQUEST':
      return {
        ...state,
        moreProcessing: state.items.length ? true : false,
        processing: state.items.length ? false : true,
      }
    case 'GET_POSTS_SUCCESS':
      return {
        ...state,
        ...action.posts,
        posts: undefined,
        items: action.posts.posts,
        moreProcessing: false,
        processing: false
      }
    case 'GET_MORE_POSTS_SUCCESS':
      return {
        ...state,
        ...action.posts,
        posts: undefined,
        items: [...state.items, ...action.posts.posts],
        moreProcessing: false,
        processing: false
      }
    case 'GET_POSTS_FAILURE':
      return {
        ...state,
        error: action.error,
        processing: false,
        moreProcessing: false
      }
    default:
      return state;
  }
};