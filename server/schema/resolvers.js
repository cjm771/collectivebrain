const Post = require('../models/Post');
const User = require('../models/User');
const {UserInputError, AuthenticationError} = require('apollo-server-express');

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
    addPost: async (_, args, ctx) => {
      if (ctx.req.session.user) {
        console.log(ctx.req.session.user);
        user = await User.findOne({ email: ctx.req.session.user.email })
        if (!user) {
          throw AuthenticationError('Could not resolve user. Are you logged in?');
        }
        try {
          console.log('args:', args);
          const newPost = new Post({
            title: args.input.title,
            description:  args.input.description,
            startDate: args.input.startDate,
            endDate: args.input.endDate,
            tags: args.input.tags,
            sources: args.input.sources,
            published: args.input.published,
            user: user
          });
          const post = await newPost.save();
          console.log(post)
          return post
        } catch (e) {
          throw new Error(`Error: ${e}`);
        }


      } else {
        throw new AuthenticationError('You must be logged into post');
      }
    },
    login: async (_, args, ctx) => {
      // 1
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
        .populate('user');
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
    keyImage: ({images}) => images[0],
    createdAt: ({_id, createdAt}) => {
      return createdAt ? new Date(createdAt).toJSON() : _id.getTimestamp().toJSON()
    }
  },
  User: {
    profileUrl: ({email}) => `http://gravatar.com/${email}`
  }
}