export default (state = {
  processing: null,
  moreProcessing: null,
  saving: false,
  savingError: false,
  savingErrofFields: false,
  items: [],
  sort: {by: 'createdAt', dir: 'desc'},
  filter: null,
  groupTags: [],
  activeItem: null,
  error: null
}, action) => {
  switch (action.type) {
    case 'GET_POSTS_REQUEST':
      return {
        ...state,
        deleteError: false,
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
    case 'CLEAR_POSTS':
      return {
        ...state,
        total: undefined, 
        start: undefined,
        end: undefined,
        limit: undefined,
        next: undefined,
        posts: undefined,
        items: []
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
    case 'CLEAR_ACTIVE_POST':
      return {
        ...state,
        deleteError: null,
        activeItem: null,
        processing: false,
        saving: false,
        savingError: null,
        savingErrorFields: null
      }
    case 'GET_POST_REQUEST':
      return {
        ...state,
        activeItem: null,
        processing: true,
        saving: false,
        savingError: null,
        savingErrorFields: null
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
    case 'DELETE_POST_REQUEST':
      return {
        ...state,
        deleteProcessing: action.toDelete
      }
    case 'DELETE_POST_SUCCESS':
      return {
        ...state,
        deleteProcessing: false,
        deleted: action.deleted,
        deleteError: true,
        deletedResults: action.deletedResults
      }
    case 'DELETE_POST_FAILURE':
      return {
        ...state,
        deleteError: {
          id: action.id,
          error: action.error,
          errorFields: action.errorFields
        },
        deleteProcessing: false,
        deleted: action.deleted
      }
    case 'SET_POST_REQUEST':
      return {
        ...state,
        savingError: null,
        savingErrorFields: null,
        saving: true
      }
    case 'SET_POST_SUCCESS':
      return {
        ...state,
        savingError: null,
        savingErrorFields: null,
       saving: false,
       saved: action.post
      }
    case 'SET_POST_FAILURE':
      return {
        ...state,
        savingError: action.error,
        savingErrorFields: action.errorFields,
        saving: false
      }
    case 'GET_TAGS_FAILURE':
      return {
        ...state,
        groupTags: []
      }
    case 'GET_TAGS_REQUEST':
      return {
        ...state,
        groupTags: []
      }
    case 'GET_TAGS_SUCCESS':
      return {
        ...state,
        groupTags: action.groupTags
      }
    case 'UPDATE_POSTS_SETTINGS':
      return {
        ...state,
        ...action.updates
      }
    default:
      return state;
  }
};