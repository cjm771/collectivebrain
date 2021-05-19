// apollo
import { gql } from 'apollo-boost';

// services
import ApolloClient from '../services/ApolloClient.js';
import GeneralService from '../services/general.services.js';

const SHARED_GROUP_ATTRS = `
id,
name,
graphSettings {
  velocityDecay3D,
  velocityDecay2D
}
`;


const QUERIES = {
  UPDATE_GROUP: gql`
  mutation ($input: GroupInput) {
    editGroup(input: $input) {
      ${SHARED_GROUP_ATTRS}
    }
  }
`,
  GET_GROUPS: gql`
  query {
    groups {
      ${SHARED_GROUP_ATTRS}
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

export const updateGroupSettingsAction = (inputs) => {
  return (dispatch) => {
    ApolloClient.mutate({
      variables: {input: inputs},
      mutation: QUERIES.UPDATE_GROUP,
    })
      .then((result) => {
        dispatch({
          type: 'UPDATE_GROUP_SETTINGS_SUCCESS',
          groups: result.data.editGroup
        })
      }).catch((error) => {
        console.log('could not update:', error);
      })
  }
};