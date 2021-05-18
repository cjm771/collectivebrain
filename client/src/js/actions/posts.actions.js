// apollo
import { gql } from 'apollo-boost';

// services
import ApolloClient from '../services/ApolloClient.js';
import GeneralService from '../services/general.services.js';

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
  canEdit,
  group {
    id,
    name
  },
  user {
    name,
    email
  },
  files {
    src,
    srcThumb,
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
  query($limit: Int, $offset: Int, $group: ID, $sort: SortInput, $filter: String) {
    posts(limit: $limit, offset: $offset, group: $group, sort: $sort, filter: $filter) {
      posts {
        ${postFull}
      }
    }
  }
  `,
  GET_TAGS: gql`
    query($limit: Int, $offset: Int, $group: ID, $sort: SortInput, $filter: String) {
      posts(limit: $limit, offset: $offset, group: $group, sort: $sort, filter: $filter) {
        posts {
          tags
        }
      }
    }
  `,
  GET_POSTS_PREVIEW: gql`
  query($limit: Int, $offset: Int, $group: ID, $sort: SortInput, $filter: String) {
    posts(limit: $limit, offset: $offset, group: $group, sort: $sort, filter: $filter) {
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
        canEdit,
        keyFile {
          src,
          srcThumb
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

export const getPostsAction = (inputs, query=QUERIES.GET_POSTS) => {
  inputs = inputs || {};
  return (dispatch) => {
    dispatch({
      type:  inputs.morePosts ? 'GET_MORE_POSTS_REQUEST' : 'GET_POSTS_REQUEST',
      payload: inputs
    });
    return ApolloClient.query({query: query, variables: {
      group: inputs.group,
      limit: inputs.limit,
      offset: inputs.offset,
      sort: inputs.sort,
      filter: inputs.filter
    }})
      .then((result) => {
        dispatch({
          type: inputs.morePosts ? 'GET_MORE_POSTS_SUCCESS' : 'GET_POSTS_SUCCESS',
          posts: result.data.posts
        });
        return result.data.posts;
      }).catch((error) => {
        const {message, fields} = GeneralService.getErrorFromGraphQL(error);
        console.log('Error:', message, '\nFields:', fields);
        dispatch({
          type: 'GET_POSTS_FAILURE',
          error: message,
          errorFields: fields
        })
      })
  }
};

export const getTagsAction = (inputs) => {
  return (dispatch) => {
    dispatch({
      type:  'GET_TAGS_REQUEST',
      payload: inputs
    });
    return ApolloClient.query({query: QUERIES.GET_TAGS, variables: {
      group: inputs.group,
      limit: inputs.limit,
      offset: inputs.offset
    }}).then((result) => {
      dispatch({
        type: 'GET_TAGS_SUCCESS',
        groupTags: result.data.posts.posts.map((post) => post.tags).flat().filter((tag) => tag !== null).map((tag) => tag.trim()),
      })
    }).catch((error) => {
      const {message, fields} = GeneralService.getErrorFromGraphQL(error);
      console.log('Error:', message, '\nFields:', fields);
      dispatch({
        type: 'GET_TAGS_FAILURE',
        error: message,
        errorFields: fields
      })
    });
  }
};

export const getPostsPreviewAction = (inputs) => {
  return getPostsAction(inputs, QUERIES.GET_POSTS_PREVIEW);
};


export const getMorePostsPreviewAction = (inputs) => {
  return getPostsAction({
    morePosts: !inputs.reset, 
    ...inputs,
    offset: inputs.reset ? 0 : inputs.offset
  }, QUERIES.GET_POSTS_PREVIEW);
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
      const {message, fields} = GeneralService.getErrorFromGraphQL(error);
      dispatch({
        type: 'SET_POST_FAILURE',
        error: message,
        errorFields: fields
      });
    });
  }
};

export const clearPostsAction = () => {
  return (dispatch) => {
    dispatch({
      type: 'CLEAR_POSTS'
    });
  }
};

export const updatePostsSettingsAction = (updates={}) => {
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_POSTS_SETTINGS',
      updates
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
      const {message, fields} = GeneralService.getErrorFromGraphQL(error);
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
      const {message, fields} = GeneralService.getErrorFromGraphQL(error);
      dispatch({
        type: 'GET_POST_FAILURE',
        error: message,
        errorFields: fields
      });
    });
  }
};