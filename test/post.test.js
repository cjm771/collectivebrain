const User = require('../server/models/User.js');
const Token = require('../server/models/Token.js');
const Post = require('../server/models/Post.js');
const mongoose = require('../server/db.js');

beforeAll(() => {
  // clean up test database
  if (process.env.NODE_ENV === 'test') {
    mongoose.connection.dropDatabase();
  }
});

afterAll(() => {
  // clean up test database
  if (process.env.NODE_ENV === 'test') {
    mongoose.connection.dropDatabase();
  }
});


let normalUser, moderator, admin;
let otherUser, otherModerator, otherAdmin;
let postByUser, postByMod, postByAdmin;
let postByOtherUser, postByOtherMod, postByOtherAdmin;

describe("post tests", () => {
  // creation
  it('creates 3 invite tokens and 3 users', async () => {
    let tmpToken = null;
    let tmpDoc = null;
    const inviteTokens = [];
    const tokenRoleTypes = [
      User.USER_ROLES.USER,
      User.USER_ROLES.MODERATOR,
      User.USER_ROLES.ADMIN
    ];
    for (let i = 0; i < 3; i++) {
      tmpToken = new Token({type: Token.TOKEN_TYPES.INVITE, metaData: {
        role: tokenRoleTypes[i]
      }});
      try {
        tmpDoc = await tmpToken.save();
        inviteTokens.push(tmpDoc);

      } catch (e) {
        throw 'Error: ' + e
      }
    }
    normalUser = new User({
      email: 'normaluser@test123.com',
      password: '123456',
      name: 'Normal User',
      token: inviteTokens[0]
    })
    await normalUser.save();

    moderator = new User({
      email: 'moderator@test123.com',
      password: '123456',
      name: 'Moderator',
      token: inviteTokens[1]
    })
    await moderator.save();

    admin = new User({
      email: 'admin@test123.com',
      password: '123456',
      name: 'Admin',
      token: inviteTokens[2]
    })
    await admin.save();
  });

  it('creates 3 other users and 6 posts from each posts', async () => {
    const token = new Token({type: Token.TOKEN_TYPES.INVITE});
    const token2 = new Token({type: Token.TOKEN_TYPES.INVITE, metaData: {role: User.USER_ROLES.MODERATOR}});
    const token3 = new Token({type: Token.TOKEN_TYPES.INVITE, metaData: {role: User.USER_ROLES.ADMIN}});

    await token.save();
    await token2.save();
    await token3.save();

    otherUser = new User({
      email: 'otherNormalUser@test123.com',
      password: '123456',
      name: 'test',
      token: token
    });
    await otherUser.save();

    otherModerator = new User({
      email: 'otherModerator@test123.com',
      password: '123456',
      name: 'test',
      token: token2
    });
    await otherModerator.save();

    otherAdmin = new User({
      email: 'otherAdmin@test123.com',
      password: '123456',
      name: 'test',
      token: token3
    });
    await otherAdmin.save();

    postByUser = new Post({
      title: 'My post',
      user: normalUser
    });
    await postByUser.save();

    postByMod = new Post({
      title: 'My post',
      user: moderator
    });
    await postByMod.save();

    postByAdmin = new Post({
      title: 'My post',
      user: admin
    });
    await postByAdmin.save();

    postByOtherUser = new Post({
      title: 'My post',
      user: otherUser
    });
    await postByOtherUser.save();

    postByOtherMod = new Post({
      title: 'My post',
      user: otherModerator
    });
    await postByOtherMod.save();

    postByOtherAdmin = new Post({
      title: 'My post',
      user: otherAdmin
    });
    await postByOtherAdmin.save();

  });

  it('should reject if required fields are not there', async () => {
    const post = new Post({});
    await expect(post.save()).rejects.toThrow();
    post.title = 'My post';
    await expect(post.save()).rejects.toThrow();
    post.user = normalUser;
    await post.save();
  });
  it('should let a user make a post', async () => {
    const post = new Post({
      title: 'My post #2',
      user: normalUser
    });
    await expect(post.save()).resolves.toBeDefined();
  });
  // // user permissions
  it('should not allow a user any posts but their own', async () => {
    const editor = normalUser._id;
    postByOtherUser.editor = editor;
    await expect(postByOtherUser.save()).rejects.toThrow();
    postByMod.editor = editor;
    await expect(postByMod.save()).rejects.toThrow();
    postByAdmin.editor = editor;
    await expect(postByAdmin.save()).rejects.toThrow();
    postByUser.editor = editor;
    await expect(postByUser.save()).resolves.toBeDefined();
  });
  it('should not allow a mod to modify an admin posts or other mod posts', async () => {
    const editor = moderator._id;
    postByOtherMod.editor = editor;
    await expect(postByOtherMod.save()).rejects.toThrow();
    postByAdmin.editor = editor;
    await expect(postByAdmin.save()).rejects.toThrow();
    postByMod.editor = editor;
    await expect(postByMod.save()).resolves.toBeDefined();
    postByOtherUser.editor = editor;
    await expect(postByOtherUser.save()).resolves.toBeDefined();
    postByUser.editor = editor;
    await expect(postByUser.save()).resolves.toBeDefined();
  });
  it('should allow an admin to modify an  user / mod posts', async () => {
    const editor = admin._id;
    postByOtherAdmin.editor = editor;
    await expect(postByOtherAdmin.save()).rejects.toThrow();
    postByMod.editor = editor;
    await expect(postByMod.save()).resolves.toBeDefined();
    postByAdmin.editor = editor;
    await expect(postByAdmin.save()).resolves.toBeDefined();
    postByUser.editor = editor;
    await expect(postByUser.save()).resolves.toBeDefined();
  });
});