export default (state = {
  processing: false,
  saving: false,
  savingError: false,
  savingErrofFields: false,
  items: [],
  activeItem: null,
  error: null
}, action) => {
  switch (action.type) {
    case 'GET_GROUPS_REQUEST':
      return {
        ...state,
        processing: true
      }
    case 'GET_GROUPS_SUCCESS':
      return {
        ...state,
        items: action.groups,
        processing: false
      }
    case 'GET_GROUPS_FAILURE':
      return {
        ...state,
        error: action.error,
        processing: false
      }
    default:
      return state;
  }
};