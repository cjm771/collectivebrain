import ApolloClient from '../services/ApolloClient.js';
import { gql } from 'apollo-boost';

const QUERIES = {
  GET_POSTS: gql`
  
  query {
    posts {
      posts {
        id,
        title,
        description,
        creator,
        category,
        sources,
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
  }
  `,
  GET_POSTS_PREVIEW: gql`
  query($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
      total,
    	start,
    	end, 
    	next,
  		limit,
      posts {
        id,
        title,
        keyImage {
          src
        },
        category,
        user {
          name,
          email
        },
      }
    }
  }
  `
};

const getErrorFromGraphQL = (error) => {
  if (typeof error === 'object' && error.graphQLErrors && error.graphQLErrors.length) {
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


export const getPostsAction = (inputs, query=QUERIES.GET_POSTS) => {
  inputs = inputs || {};
  return (dispatch) => {
    dispatch({
      type: 'GET_POSTS_REQUEST',
      payload: inputs
    });
    ApolloClient.query({query: query, variables: {
      limit: inputs.limit,
      offset: inputs.offset
    }})
      .then((result) => {
        dispatch({
          type: inputs.morePosts ? 'GET_MORE_POSTS_SUCCESS' : 'GET_POSTS_SUCCESS',
          posts: result.data.posts
        })
      }).catch((error) => {
        const {message, fields} = getErrorFromGraphQL(error);
        console.log('Error:', message, '\nFields:', fields);
        dispatch({
          type: 'GET_POSTS_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
}

export const getPostsPreviewAction = (inputs) => {
  return getPostsAction(inputs, QUERIES.GET_POSTS_PREVIEW);
}

export const getMorePostsPreviewAction = (inputs) => {
  return getPostsAction({morePosts: true, ...inputs}, QUERIES.GET_POSTS_PREVIEW);
}