const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');
const Token = require('../models/Token');

const {UserInputError, AuthenticationError, SchemaError} = require('apollo-server-express');

const confirmLoggedInUser = async (ctx) => {
  if (!ctx.req.session.user) {
    throw new AuthenticationError('You must be logged into post');
  }
  user = await User.findOne({ email: ctx.req.session.user.email }).populate('activeGroup');
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
    id: user._id
  };
  return {
    token,
    user: user
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
          user: await User.findOne({ email: ctx.req.session.user.email }).populate('activeGroup'),
        }
      } else {
        return null;
      }
    },
    resendInvite: async (_, args, ctx) =>  {
      const user = await confirmLoggedInUser(ctx);
      invite = await Token.findOne({ token: args.token, user: user });
      if (!invite) {
        throw new SchemaError('Could not find this invite to resend!');
      }
      try {
        await invite.sendInviteEmail();
        return invite;
      } catch (e) {
        throw new SchemaError(`An error occurred while trying to resend invite: ${e}`);
      }
    },
    deletePost: async (_, args, ctx) => {
      const user = await confirmLoggedInUser(ctx);
      let post;
      try {
        post = await Post.findOne({_id: args.id || -1});
      } catch (e) {
        throw new SchemaError(`Could not find post with given id: ${args.id}`);
      }
      if (await post.canBeEdited(user.id)) {
        let deletedFilesResults = {};
        post.editor = user.id;
        if (post.files) {
          deletedFilesResults = await post.deleteFiles();
        }
        try {
          await Post.deleteOne({_id: args.id});
        } catch (e) {
          handlePostErrors(e);
        }
        return {post, deletedFilesResults};
      } else {
        throw new AuthenticationError('You are not permitted to delete this post!');
      }
     
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
        invite.sendInviteEmail();
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
      let user = await User.findOne({_id: args.input.id || editor._id}).populate('activeGroup');
      if (!user) {
        throw new Error('No such user found');
      }
      for (key of Object.keys(args.input)) {
        if (key === 'activeGroup') {
          user[key] = await Group.findOne({_id: args.input[key]});
        } else {
          user[key] = args.input[key];
        }
      }

      try {
        user = await user.save();
        user.populate('activeGroup');
      } catch (e) {
        throw new Error('Could not save');
      }
      invites = Token.find({user, type: Token.TOKEN_TYPES.INVITE}).populate('metaData.user').populate('metaData.group');
      return {
        user,
        invites,
        canInvite: user.getEditableRoles()
      }
    }
  },
  Query : {
    group: async (_, args, ctx) => {
      try {
        const group = await Group.findOne({_id: args.id});
        return group;
      } catch (e) {
        throw new UserInputError('Group not found', {
          invalidArgs: ['id'],
          });
      }
    },
    post: async (_, args, ctx) => {
      try {
        const post = await (await Post.findOne({_id: args.id}).populate('user').populate('group'));
        post.editor = ctx.req.session.user && ctx.req.session.user.id;
        return post;
      } catch (e) {
        throw new UserInputError('Post not found', {
          invalidArgs: ['id'],
          });
      }
    },
    posts: async (_, args, ctx) => {
      // if (ctx.req.session.user) {
        args.limit = args.limit || 0;
        args.offset = args.offset || 0;
        const count = await Post.estimatedDocumentCount({});
        let filter = {};
        if (args.group) {
          filter = {group: args.group};
        }
        let posts = await Post
        .find(filter)
        .sort([['_id', -1]])
        .limit(args.limit)
        .skip(args.offset)
        .populate('user')
        .populate('group')
        .populate('lastEditedBy');
        posts = posts.map((post) => {
          post.editor = ctx.req.session.user && ctx.req.session.user.id;
          return post;
        })
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
    groups: async (_, args, ctx) => {
      if (ctx.req.session.user) {
        return Group.find({})
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
    },
    userSettings: async (_, args, ctx) => {
      user = await confirmLoggedInUser(ctx);
      invites = Token.find({user, type: Token.TOKEN_TYPES.INVITE}).populate('metaData.user').populate('metaData.group');
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
    canEdit: (post) => {
      return post.canBeEdited();
    },
    createdAt: ({_id, createdAt}) => {
      return createdAt ? new Date(createdAt).toJSON() : _id.getTimestamp().toJSON()
    }
  },
  User: {
    profileUrl: ({email}) => `http://gravatar.com/${email}`
  }
}