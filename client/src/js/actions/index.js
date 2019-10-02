import ApolloClient from '../services/ApolloClient.js';
import { gql } from 'apollo-boost';

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
// const GET_USERS = gql`
//   {
//     users {
//       name 
//       email
//     }
//   }
// `;
const getErrorFromGraphQL = (error) => {
  if (error.graphQLErrors.length) {
    const result = {
      message: error.graphQLErrors[0].message,
    }
    if (error.graphQLErrors[0].extensions && error.graphQLErrors[0].extensions.exception && error.graphQLErrors[0].extensions.exception.invalidArgs) {
      result.fields = error.graphQLErrors[0].extensions.exception.invalidArgs;
    }
    return result;
  } else {
    return { message: error.toString() }
  }
}

export const loginAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'LOGIN_REQUEST',
      payload: inputs
    });
    // ApolloClient.query({query: GET_USERS})
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
        const {message, fields} = getErrorFromGraphQL(error);
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
    // ApolloClient.query({query: GET_USERS})
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