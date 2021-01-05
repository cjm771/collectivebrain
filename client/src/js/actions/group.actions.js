// apollo
import { gql } from 'apollo-boost';

// services
import ApolloClient from '../services/ApolloClient.js';
import GeneralService from '../services/general.services.js';

const QUERIES = {
  UPDATE_GROUP: gql`
  mutation ($input: EditUserInput) {
    editUser(input: $input) {
      activeGroup
    }
  }
`,
  GET_GROUPS: gql`
  query {
    groups {
      id,
      name
    }
  }
  `,
};

export const getGroupsAction = () => {
  return (dispatch) => {
    dispatch({
      type: 'GET_GROUPS_REQUEST',
    });
    return ApolloClient.query({ query: QUERIES.GET_GROUPS })
      .then((result) => {
        dispatch({
          type: 'GET_GROUPS_SUCCESS',
          groups: result.data.groups
        });
        return result.data.groups;
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        console.log('Error:', message, '\nFields:', fields);
        dispatch({
          type: 'GET_GROUPS_FAILURE',
          error: message,
          errorFields: fields
        })
      });
  }
};