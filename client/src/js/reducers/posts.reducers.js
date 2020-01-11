export default (state = {
  processing: false,
  items: [],
  activeItem: null,
  error: null
}, action) => {
  switch (action.type) {
    case 'GET_POSTS_REQUEST':
      return {
        ...state,
        activeItem: null,
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
        // posts: undefined,
        items: action.posts.posts,
        moreProcessing: false,
        processing: false
      }
    case 'GET_MORE_POSTS_SUCCESS':
      return {
        ...state,
        ...action.posts,
        // posts: undefined,
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
    case 'GET_POST_REQUEST':
      return {
        ...state,
        activeItem: null,
        processing: true
      }
    case 'GET_POST_SUCCESS':
      return {
        ...state,
        activeItem: action.post,
        processing: false
      }
    case 'GET_POST_FAILURE':
      return {
        ...state,
        error: action.error,
        errorFields: action.errorFields,
        processing: false,
      }
    default:
      return state;
  }
};