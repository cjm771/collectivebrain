const Post = require('../models/Post');
const User = require('../models/User');
const Token = require('../models/Token');


const MailerService = require('../utils/MailerService.js');

const {UserInputError, AuthenticationError, SchemaError} = require('apollo-server-express');

const confirmLoggedInUser = async (ctx) => {
  if (!ctx.req.session.user) {
    throw new AuthenticationError('You must be logged into post');
  }
  user = await User.findOne({ email: ctx.req.session.user.email });
  if (!user) {
    throw new AuthenticationError('Could not resolve user. Are you logged in?');
  }
  return user;
};

const loginUser = (user, ctx) => {
  const token = 'DUMMY TOKEN';
  // 3
  ctx.req.session.user = {
    email: user.email, 
    name: user.name,
  };
  return {
    token,
    user: user.toJSON(),
  }
}

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
          user: await User.findOne({ email: ctx.req.session.user.email }),
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
        await post.moveTmpFiles(user);
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
        await post.moveTmpFiles(user);
      } catch (e) {
        handlePostErrors(e);
      }
      return post;
    },
    addInvite: async (_, args, ctx) => {
      const user = await confirmLoggedInUser(ctx);
      // args.input = cleanFields(args.input);
      if (!user.canInvite(args.input.role)) {
        throw new UserInputError('You are not permitted to invite that role type.', {
          invalidArgs: ['role'],
        });
      }
      const newInvite = new Token({
        metaData: args.input,
        user: user,
        type: Token.TOKEN_TYPES.INVITE
      });
      let invite;
      try {
        invite = await newInvite.save();
        if (MailerService.shouldSendEmails && invite.metaData.email) {
          const inviteMessage = MailerService.MESSAGES.INVITE({
            user,
            invitee: {
              token: invite.token,
              email: invite.metaData.email,
              name: invite.metaData.name,
            }
          });
          console.log(inviteMessage);
          try {
            await MailerService.send(inviteMessage);
          } catch (e) {
            console.log('Could not mail invite email:', e);
          }
        }
      } catch (e) {
        handlePostErrors(e);
      }
      return invite;
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
      return loginUser(user, ctx);
    },
    addUser: async (_, args, ctx) => {
      if (args.input.password !== args.input.passwordConfirm) {
        throw new UserInputError('Password and confirmation do not match!', {
            invalidArgs: ['password', 'passwordConfirm'],
        });
      }

      const token = await Token.findOne({ token: args.input.inviteToken, type: Token.TOKEN_TYPES.INVITE, status: Token.STATUS.AVAILABLE});
      if (!token) {
        throw new UserInputError('Invite token is invalid.', {
          invalidArgs: ['inviteToken'],
        });
      }
      args.input.token = token;

      const user = await new User(args.input).save();
      return loginUser(user, ctx);
    },
    editUser: async (_, args, ctx) => {
      const editor = await confirmLoggedInUser(ctx);
      args.input.editor = editor._id;
      let user = await User.findOne({_id: args.input.id})
      if (!user) {
        throw new Error('No such user found');
      }
      user = await user.update(args.input);
      return loginUser(user, ctx);
    }
  },
  Query : {
    post: async (_, args, ctx) => {
      // if (ctx.req.session.user) {
        try {
          const post = await Post.findOne({_id: args.id}).populate('user');
          return post;
        } catch (e) {
          throw new UserInputError('Post not found', {
            invalidArgs: ['id'],
           });
        }
      // } else {
      //   throw new AuthenticationError('You are not permitted to access this page!. Are you logged in?');
      // }
    },
    posts: async (_, args, ctx) => {
      // if (ctx.req.session.user) {
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
      // } else {
      //   throw new AuthenticationError('You are not permitted to access this page!. Are you logged in?')
      // }
    },
    users: (_, args, ctx) => {
      if (ctx.req.session.user) {
        return User.find({})
      } else {
        throw new AuthenticationError('You are not permitted to access this page!. Are you logged in?')
      }
    },
    userSettings: async (_, args, ctx) => {
      user = await confirmLoggedInUser(ctx);
      invites = Token.find({user, type: Token.TOKEN_TYPES.INVITE}).populate('metaData.user');
      return {
        user,
        invites,
        canInvite: user.getEditableRoles()
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