export default (state = {
  loggingIn: false,
  loggedIn: false,
  error: false
}, action) => {
  switch (action.type) {
    case 'LOGIN_CLEAR_ERROR':
      const newState = {...state};
      if (newState.loginErrorFields) {
        const index = newState.loginErrorFields.indexOf(action.errorField);
        if (index !== -1) {
          newState.loginErrorFields.splice(index, 1);
        }
      }
      return newState;
    case 'LOGIN_REQUEST':
      return {
        loggingIn: true
      }
    case 'LOGIN_SUCCESS':
      return {
        ...action.user,
        loggedIn: true
      }
    case 'LOGIN_FAILURE':
      return {
        loginError: action.error,
        loginErrorFields: action.errorFields
      }
    case 'LOGOUT':
      return state;
    case 'UPDATE':
      return state;
    case 'SIGNUP':
      return state;
    case 'INVITE':
      return state;
    default:
      return state;
  }
};