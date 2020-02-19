const Post = require('../models/Post');
const User = require('../models/User');
const {UserInputError, AuthenticationError, SchemaError} = require('apollo-server-express');

const confirmLoggedInUser = async (ctx) => {
  if (!ctx.req.session.user) {
    throw new AuthenticationError('You must be logged into post');
  }
  user = await User.findOne({ email: ctx.req.session.user.email });
  if (!user) {
    throw AuthenticationError('Could not resolve user. Are you logged in?');
  }
  return user;
};

const cleanFields = (inputs) => {
  const yearAtts = ['startDate', 'endDate'];
  yearAtts.forEach((att) => {
    const year = inputs[att];
    try {
      inputs[att] = new Date(inputs[att]);
    } catch (e) {
      inputs[att] = e;
    }
  });
  return inputs;
};

const handlePostErrors = (e) => {
  const fieldsWithIssues = {};
  if (e.errors) {
    for (let [field, errObj] of Object.entries(e.errors)) {
      if (errObj.name === 'CastError') {
        if (errObj.kind === 'Date') {
          if (['endDate', 'startDate'].indexOf(field) !== -1) {
            fieldsWithIssues[field] = 'Not a Valid date, should be a year (YYYY)';
          } else {
            fieldsWithIssues[field] = 'Not a Valid date';
          }
        } else {
          fieldsWithIssues[field] = `Not a Valid ${errObj.kind}`;
        }
      } else if (errObj.name === 'ValidatorError' && errObj.kind === 'required') {
        fieldsWithIssues[field] = 'This field is required';
      } else {
        fieldsWithIssues[field] = errObj.message;
      }
    }
    throw new UserInputError(Object.values(fieldsWithIssues).map((val, index) => { 
      return Object.keys(fieldsWithIssues)[index] + ': ' + val
    }).join(','), 
      {invalidArgs: Object.keys(fieldsWithIssues)});
  } else {
    throw e;
  }
};

module.exports  = {
  Mutation : {
    isLoggedIn: async (_, args, ctx) => {
      if (ctx.req.session.user) {
        return {
          token: 'DUMMY TOKEN',
          user: ctx.req.session.user,
        }
      } else {
        return null;
      }
    },
    deletePost: async (_, args, ctx) => {
      const user = await confirmLoggedInUser(ctx);
      let post;
      try {
        post = await Post.findOne({_id: args.id || -1});
      } catch (e) {
        throw SchemaError(`Could not find post with given id: ${args.id}`);
      }
      let deletedFilesResults = {};
      if (post.files) {
        deletedFilesResults = await post.deleteFiles();
      }
      try {
        await Post.deleteOne({_id: args.id});
      } catch (e) {
        handlePostErrors(e);
      }
      return {post, deletedFilesResults};
    },
    editPost: async (_, args, ctx) => {
      const user = await confirmLoggedInUser(ctx);
      let post;
      try {
        post = await Post.findOne({_id: args.input.id || -1});
      } catch (e) {
        throw SchemaError(`Could not find post with given id: ${args.input.id}`);
      }
      post = await Post.findOneAndUpdate({_id: args.input.id}, {$set: args.input},  { new: true });
      post.editor = user._id;
      try {
        post = await post.save();
        await post.moveTmpFiles();
      } catch (e) {
        handlePostErrors(e);
      }
      return post;
    },
    addPost: async (_, args, ctx) => {
      const user = await confirmLoggedInUser(ctx);
      // args.input = cleanFields(args.input);
      const newPost = new Post(args.input);
      newPost.user = user;
      let post;
      try {
        post = await newPost.save();
        await post.moveTmpFiles();
      } catch (e) {
        handlePostErrors(e);
      }
      return post;
    },
    login: async (_, args, ctx) => {
      if (args.email.trim() === '' && args.password.trim() === '') {
        throw new UserInputError('Fill in all required fields', {
          invalidArgs: ['email', 'password'],
        });
      }
      if (args.email.trim() === '') {
        throw new UserInputError('Email Required', {
            invalidArgs: ['email'],
        });
      }
      if (args.password.trim() === '') {
        throw new UserInputError('Password Required', {
            invalidArgs: ['password'],
        });
      }
      const user = await User.findOne({ email: args.email })
      if (!user) {
        throw new Error('No such user found');
      }
      // 2
      const valid = await user.validatePassword(args.password);
      if (!valid) {
        throw new UserInputError('Password invalid', {
            invalidArgs: ['password'],
        });
      }
      const token = 'DUMMY TOKEN';
      // 3
      ctx.req.session.user = {
        email: user.email, 
        name: user.name
      };
      return {
        token,
        user: user.toJSON(),
      }
    }
  },
  Query : {
    post: async (_, args, ctx) => {
      if (ctx.req.session.user) {
        try {
          const post = await Post.findOne({_id: args.id}).populate('user');
          return post;
        } catch (e) {
          throw new UserInputError('Post not found', {
            invalidArgs: ['id'],
           });
        }
      } else {
        throw new AuthenticationError('You are not permitted to access this page!. Are you logged in?');
      }
    },
    posts: async (_, args, ctx) => {
      if (ctx.req.session.user) {
        args.limit = args.limit || 0;
        args.offset = args.offset || 0;
        const count = await Post.estimatedDocumentCount({});
        const posts = await Post
        .find({})
        .sort([['_id', -1]])
        .limit(args.limit)
        .skip(args.offset)
        .populate('user')
        .populate('lastEditedBy');
        return {
          total: count, 
          start: args.offset,
          end: args.offset + args.limit - 1,
          limit: args.limit,
          next: (args.offset + args.limit < count) ? args.offset + args.limit : null,
          posts: posts
        }
      } else {
        throw new AuthenticationError('You are not permitted to access this page!. Are you logged in?')
      }
    },
    users: (_, args, ctx) => {
      if (ctx.req.session.user) {
        return User.find({})
      } else {
        throw new AuthenticationError('You are not permitted to access this page!. Are you logged in?')
      }
    }
  }, 
  Post: {
    category: ({category}) => Post.getCategoryName(category).toLowerCase(),
    subCategory: ({subCategory}) => Post.getSubCategoryName(subCategory).toLowerCase(),
    keyFile: ({files}) => (files && files.length) ? files[0] : null,
    updatedAt: ({_id, updatedAt}) => {
      return updatedAt ? new Date(updatedAt).toJSON() : null
    },
    createdAt: ({_id, createdAt}) => {
      return createdAt ? new Date(createdAt).toJSON() : _id.getTimestamp().toJSON()
    }
  },
  User: {
    profileUrl: ({email}) => `http://gravatar.com/${email}`
  }
}