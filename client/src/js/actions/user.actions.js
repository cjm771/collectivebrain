// apollo
import { gql } from 'apollo-boost';

// services
import ApolloClient from '../services/ApolloClient.js';
import GeneralService from '../services/general.services.js';

const IS_USER_LOGGED_IN = gql`
mutation {
  isLoggedIn {
    token,
    user { 
      name, 
      email
    }
  }
}
`;

const USER_LOGIN = gql`
  mutation ($email:String!, $password:String!) {
    login(email: $email, password: $password) {
      token,
      user { 
        name, 
        email
      }
    }
  }
`;

const USER_REGISTER = gql`
  mutation($input: RegisterInput) {
    addUser(input: $input) {
      token,
      user { 
        name, 
        email
      }
    }
  }
`;

export const registerAction = (inputs) => {
  return (dispatch) => {
    debugger;
    dispatch({
      type: 'REGISTER_REQUEST',
      payload: inputs
    });
    ApolloClient.mutate({
      variables: {input: inputs},
      mutation: USER_REGISTER,
    })
      .then((result) => {
        debugger;
        dispatch({
          type: 'REGISTER_SUCCESS',
          user: result.user
        })
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        debugger;
        dispatch({
          type: 'REGISTER_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
};

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
      })
  }
}

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