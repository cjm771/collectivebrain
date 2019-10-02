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
    posts: (_, args, ctx) => {
      if (ctx.req.session.user) {
        return Post.find({}).populate('user')
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
    category: ({category}) => Post.getCategoryName(category).toLowerCase()
  },
  User: {
    profileUrl: ({email}) => `http://gravatar.com/${email}`
  }
}