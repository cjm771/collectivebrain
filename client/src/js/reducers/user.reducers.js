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
    case 'REGISTER_REQUEST':
        return {
          registering: true
        }
    case 'REGISTER_SUCCESS':
        return {
          ...action.user,
          registered: true
        }
    case 'REGISTER_FAILURE':
        return {
          registerError: action.error,
          registerErrorFields: action.errorFields
        }
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
    case 'RESEND_INVITE_REQUEST':
      return {
        ...state,
        resendInvite: {
          processing: true
        }
      }
    case 'RESEND_INVITE_SUCCESS':
      return {
        ...state,
        resendInvite: {
          success: action.token
        }
      }
    case 'RESEND_INVITE_FAILURE':
      return {
        ...state,
        resendInvite: {
          error: action.error, 
          errorFields: action.errorFields
        }
      }
    case 'RESEND_INVITE_RESET':
      return {
        ...state,
        resendInvite: {}
      }
    case 'INVITE_REQUEST':
      return {
        ...state,
        invited: false,
        inviteError: false,
        inviteProcessing: true
      }
    case 'INVITE_SUCCESS':
      return {
        ...state,
        invited: true,
        inviteError: false,
        inviteErrorFields: null,
        inviteProcessing: false,
        token: action.token
      }
    case 'INVITE_FAILURE':
      return {
        ...state,
        inviteProcessing: false,
        inviteError: action.error,
        inviteErrorFields: action.errorFields
      }
    case 'GET_SETTINGS_REQUEST':
      return {
        ...state,
        settingsLoading: true
      }
    case 'GET_SETTINGS_SUCCESS':
      return {
        ...state,
        settingsLoading: false,
        userSettings: action.userSettings
      }
    case 'GET_SETTINGS_FAILURE':
      return {
        ...state,
        settingsLoading: false,
        settingsError: action.error,
        settingsErrorFields: action.errorFields
      }
    case 'UPDATE_GROUP_REQUEST':
      return {
        ...state,
        settingsLoading: true,
        saving: true
      }
    case 'UPDATE_GROUP_SUCCESS':
      return {
        ...state,
        ...action.userSettings.user,
        userSettings: action.userSettings,
        settingsLoading: false,
      }
    case 'UPDATE_GROUP_FAILURE':
      return {
        ...state,
        settingsLoading: false,
        settingsError: action.error,
        settingsErrorFields: action.errorFields
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