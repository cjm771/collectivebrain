// apollo
import { gql } from 'apollo-boost';

// services
import ApolloClient from '../services/ApolloClient.js';
import GeneralService from '../services/general.services.js';

const sharedUserParams = `
name,
id,
email,
role,
`;

const sharedUserSettingsParams = `
user {
  name, 
  email,
  profileUrl,
  activeGroup {
    id,
    name
  }
},
canInvite,
invites {
  token,
  status,
  type,
  url,
  metaData {
    name,
    role,
    email,
    group {
      id,
      name
    },
    user {
      name,
      email,
    }
  }
}
`;

const IS_USER_LOGGED_IN = gql`
mutation {
  isLoggedIn {
    token,
    user { 
      ${sharedUserParams}
      activeGroup {
        id,
        name
      }
    }
  }
}
`;

const USER_LOGIN = gql`
  mutation ($email:String!, $password:String!) {
    login(email: $email, password: $password) {
      token,
      user { 
        ${sharedUserParams}
      }
    }
  }
`;

const USER_REGISTER = gql`
  mutation($input: RegisterInput) {
    addUser(input: $input) {
      token,
      user { 
        ${sharedUserParams}
      }
    }
  }
`;

const USER_INVITE = gql`
  mutation($input: MetaDataInput) {
    addInvite(input: $input) {
      token, 
      status,
      type,
      metaData {
        role,
        email,
        name
      }
    }
  }
`;

const USER_RESEND_INVITE = gql`
  mutation ($token:ID!) {
    resendInvite(token: $token) {
      token
    }
  }
`;

const UPDATE_GROUP = gql`
  mutation ($input: EditUserInput) {
    editUser(input: $input) {
      ${sharedUserSettingsParams}
    }
  }
`;

const GET_SETTINGS = gql`
  query {
    userSettings {
      ${sharedUserSettingsParams}
    }
  }
`;

export const registerAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'REGISTER_REQUEST',
      payload: inputs
    });
    ApolloClient.mutate({
      variables: {input: inputs},
      mutation: USER_REGISTER,
    })
      .then((result) => {
        dispatch({
          type: 'REGISTER_SUCCESS',
          user: result.user
        })
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        dispatch({
          type: 'REGISTER_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
};

export const updateActiveGroupAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_GROUP_REQUEST',
      payload: inputs
    });
    ApolloClient.mutate({
      variables: {input: inputs},
      mutation: UPDATE_GROUP,
    })
      .then((result) => {
        dispatch({
          type: 'UPDATE_GROUP_SUCCESS',
          userSettings: result.data.editUser
        })
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        dispatch({
          type: 'UPDATE_GROUP_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
}

export const loginAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'LOGIN_REQUEST',
      payload: inputs
    });
    ApolloClient.mutate({
      variables: { email: inputs.email, password: inputs.password},
      mutation: USER_LOGIN,
    })
    .then((result) => {
      dispatch({
        type: 'LOGIN_SUCCESS',
        user: result.user
      })
    }).catch((error) => {
      const {message, fields} = GeneralService.getErrorFromGraphQL(error);
      dispatch({
        type: 'LOGIN_FAILURE',
        error: message,
        errorFields: fields
      })
    });
  };
};

export const clearResendInviteAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'RESEND_INVITE_RESET',
      payload: inputs
    });
  };
};

export const resendInviteAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'RESEND_INVITE_REQUEST',
      payload: inputs
    });
    ApolloClient.mutate({
      variables: {token: inputs.token},
      mutation: USER_RESEND_INVITE,
    })
    .then((result) => {
      dispatch({
        type: 'RESEND_INVITE_SUCCESS',
        token: result.data.resendInvite
      })
    }).catch((error) => {
      const {message, fields} = GeneralService.getErrorFromGraphQL(error);
      dispatch({
        type: 'RESEND_INVITE_FAILURE',
        error: message,
        errorFields: fields
      })
    });
  };
};

export const addInviteAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'INVITE_REQUEST',
      payload: inputs
    });
    ApolloClient.mutate({
      variables: {input: inputs},
      mutation: USER_INVITE,
    })
      .then((result) => {
        dispatch({
          type: 'INVITE_SUCCESS',
          token: result.data.addInvite
        })
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        dispatch({
          type: 'INVITE_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
};

export const getUserSettingsAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'GET_SETTINGS_REQUEST',
      payload: inputs
    });
    ApolloClient.query({
      query: GET_SETTINGS,
    })
      .then((result) => {
        dispatch({
          type: 'GET_SETTINGS_SUCCESS',
          userSettings: result.data.userSettings
        })
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        dispatch({
          type: 'GET_SETTINGS_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
};

export const isLoggedInAction = () => {
  return (dispatch) => {
    ApolloClient.mutate({
      mutation: IS_USER_LOGGED_IN
    })
      .then((result) => {
        if (result.data && result.data.isLoggedIn && result.data.isLoggedIn.user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            user: result.data.isLoggedIn.user
          })
        }
      }).catch((error) => {
      })
  }
};

export const clearErrorFieldAction = (errorField) => {
  return {
    type: 'LOGIN_CLEAR_ERROR',
    errorField: errorField
  };
};