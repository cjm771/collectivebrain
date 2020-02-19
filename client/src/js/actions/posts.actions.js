import ApolloClient from '../services/ApolloClient.js';
import { gql } from 'apollo-boost';

const postFull = `
  id,
  createdAt,
  published,
  title,
  description,
  creator,
  category,
  subCategory,
  sources,
  startDate,
  endDate,
  tags,
  user {
    name,
    email
  },
  files {
    src,
    caption
  }
`;

const QUERIES = {
  GET_POST: gql`
  query($id: String) {
    post(id: $id) {
      ${postFull}
    }
  }
  `,
  GET_POSTS: gql`
  query {
    posts {
      posts {
        ${postFull}
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
        createdAt,
        published,
        title,
        keyFile {
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
  `,
  EDIT_POST: gql`
  mutation($input: PostInput!) {
    editPost(input: $input) {
      id, 
      title,
      description,
      createdAt
    }
  }
  `,
  ADD_POST: gql`
  mutation($input: PostInput!) {
    addPost(input: $input) {
      id, 
      title,
      description,
      createdAt
    }
  }`,
  DELETE_POST: gql`
  mutation($id: ID) {
    deletePost(id: $id) {
      post {
        id
      },
      deletedFilesResults {
        deleted {
          src
        },
        notDeleted {
          src
        }
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
  } else if (typeof error === 'object' && error.networkError && error.networkError.result && error.networkError.result.errors && error.networkError.result.errors.length) {
    const tmpResultArr = [];
    const networkError = /(.+)(\{.+\}.*);(.+)/;
    let matches = null;
    for (let rawError of error.networkError.result.errors) {
      matches = null;
      if (matches = networkError.exec(rawError.message)) {
        tmpResultArr.push(matches[3]);
      } else {
        tmpResultArr.push(rawError.message);
      }
    }
    return {message: tmpResultArr.length ? tmpResultArr.join(', ') : error.toString()};
  } else {
    return { message: error.toString() }
  }
};


export const getPostsAction = (inputs, query=QUERIES.GET_POSTS) => {
  inputs = inputs || {};
  return (dispatch) => {
    dispatch({
      type:  inputs.morePosts ? 'GET_MORE_POSTS_REQUEST' : 'GET_POSTS_REQUEST',
      payload: inputs
    });
    return ApolloClient.query({query: query, variables: {
      limit: inputs.limit,
      offset: inputs.offset
    }})
      .then((result) => {
        dispatch({
          type: inputs.morePosts ? 'GET_MORE_POSTS_SUCCESS' : 'GET_POSTS_SUCCESS',
          posts: result.data.posts
        });
        return result.data.posts;
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
};

export const getPostsPreviewAction = (inputs) => {
  return getPostsAction(inputs, QUERIES.GET_POSTS_PREVIEW);
};


export const getMorePostsPreviewAction = (inputs) => {
  return getPostsAction({morePosts: true, ...inputs}, QUERIES.GET_POSTS_PREVIEW);
};


export const updateOrCreatePostAction = (inputs, updateOrCreate = 'create') => {
  inputs = inputs || {};
  return (dispatch) => {
    dispatch({
      type: 'SET_POST_REQUEST'
    });
   
    return ApolloClient.mutate({
      mutation: (updateOrCreate === 'create') ? QUERIES.ADD_POST : QUERIES.EDIT_POST,
      variables: {input: inputs}
    }).then((result) => {
      dispatch({
        type: 'SET_POST_SUCCESS',
        post: (updateOrCreate === 'create') ? result.data.addPost : result.data.editPost
      })
    }).catch((error) => {
      const {message, fields} = getErrorFromGraphQL(error);
      dispatch({
        type: 'SET_POST_FAILURE',
        error: message,
        errorFields: fields
      });
    });
  }
};

export const deletePostAction = (id) => {
  return (dispatch) => {
    dispatch({
      type: 'DELETE_POST_REQUEST',
      toDelete: id
    });
   
    return ApolloClient.mutate({
      mutation: QUERIES.DELETE_POST,
      variables: {id: id}
    }).then((result) => {
      dispatch({
        type: 'DELETE_POST_SUCCESS',
        deleted: id,
        deletedResults: result.data.deletePost.deletedFilesResults
      })
    }).catch((error) => {
      const {message, fields} = getErrorFromGraphQL(error);
      dispatch({
        type: 'DELETE_POST_FAILURE',
        error: message,
        errorFields: fields
      });
    });
  }
};

export const clearActivePostAction = () => {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_ACTIVE_POST'
    });
  }
};

export const getPostAction = (inputs) => {
  inputs = inputs || {};
  return (dispatch) => {
    dispatch({
      type: 'GET_POST_REQUEST',
      payload: inputs
    });
    return ApolloClient.query({
      query: QUERIES.GET_POST,
      variables: {
        id: inputs.id
      }
    }).then((result) => {
      dispatch({
        type: 'GET_POST_SUCCESS',
        post: result.data.post
      })
    }).catch((error) => {
      const {message, fields} = getErrorFromGraphQL(error);
      dispatch({
        type: 'GET_POST_FAILURE',
        error: message,
        errorFields: fields
      });
    });
  }
};