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
    await new User({
      email: 'normaluser@test123.com',
      password: '123456',
      name: 'Normal User',
      token: inviteTokens[0]
    }).save();
    await new User({
      email: 'moderator@test123.com',
      password: '123456',
      name: 'Moderator',
      token: inviteTokens[1]
    }).save();
    await new User({
      email: 'admin@test123.com',
      password: '123456',
      name: 'Admin',
      token: inviteTokens[2]
    }).save();
  });
  // it('should let a user make a post');
  // it('should reject if required fields are not there');
  // // user permissions
  // it('should not allow a user to modify mod or admin posts');
  // it('should not allow a mod to modify an admin posts');
  // it('should allow an admin to modify an admin / user / mod posts');
  // it('should allow an mod to modify a user posts');
});