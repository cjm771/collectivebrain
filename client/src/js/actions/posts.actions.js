import ApolloClient from '../services/ApolloClient.js';
import { gql } from 'apollo-boost';

const GET_POSTS = gql`
query {
  posts {
    id,
    title,
    description,
    creator,
    category,
    startDate,
    endDate,
    tags,
    user {
  		name,
      email
  	},
    images {
      src,
      caption
    }
  }
}
`;

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

export const getPostsAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type: 'GET_POSTS_REQUEST',
      payload: inputs
    });
    ApolloClient.query({query: GET_POSTS })
      .then((result) => {
        dispatch({
          type: 'GET_POSTS_SUCCESS',
          posts: result.data.posts
        })
      }).catch((error) => {
        const {message, fields} = getErrorFromGraphQL(error);
        dispatch({
          type: 'GET_POSTS_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
}
