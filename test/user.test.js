const User = require('../server/models/User.js');
const Token = require('../server/models/Token.js')
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

const inviteTokens = []
let normalUser, moderator, admin;

describe("User tests", () => {
  // creation
  it('creates 3 invite tokens', async () => {
    let tmpToken = null;
    let tmpDoc = null;
    let tokenRoleTypes = [
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
    expect(inviteTokens.length).toEqual(3);
  });

  it('prevent a new user to be created without a token', async () => {
    await expect(new User({
      email: 'test@test123.com',
      password: 'password',
      name: 'test',
      // token: inviteTokens[0]
    }).save()).rejects.toThrow('Invite Token is Required');
  });


  it('prevent a new user to be created with an invalid invite token', async () => {
    // verification token instead
    const verificationToken = new Token({type: Token.TOKEN_TYPES.VERIFICATION});
    await verificationToken.save();
    
    await expect(new User({
      email: 'test@test123.com',
      password: 'password',
      name: 'test',
      token: verificationToken
    }).save()).rejects.toThrow('Invite Token is invalid');
  });

  // // validation
  it('should prevent existing emails from registering', async () => {
    const token1 = new Token({type: Token.TOKEN_TYPES.INVITE});
    const token2 = new Token({type: Token.TOKEN_TYPES.INVITE});
    await token1.save();
    await token2.save();
    const originalUser = new User({
      email: 'test@test123.com',
      password: 'password',
      name: 'test',
      token: token1,
    });
    await originalUser.save();

    await expect(new User({
      email: 'test@test123.com',
      password: 'password',
      name: 'test',
      token: token2,
    }).save()).rejects.toThrow('Email Already Taken');
  });
  it('should require all required fields', async () => {
    await expect(new User({
    }).save()).rejects.toThrow();
    await expect(new User({
      email: 'test@test123.com',
    }).save()).rejects.toThrow();
    await expect(new User({
      email: 'test@test123.com',
      password: '123456'
    }).save()).rejects.toThrow();
    await expect(new User({
      email: 'test@test123.com',
      password: '123456',
      name: 'test'
    }).save()).rejects.toThrow();
    await expect(new User({
      email: 'test@test123.com',
      password: '',
      name: '',
      token: ''
    }).save()).rejects.toThrow();
  });

  it('should require a valid email address', async () => {
    const inviteToken = new Token({type: Token.TOKEN_TYPES.INVITE});
    await expect(new User({
      email: 'tescom',
      password: '123456',
      name: 'test',
      token: inviteToken
    }).save()).rejects.toThrow('User validation failed: email: Please fill valid email address');
  });

  it('adds a new user', async () => {
    normalUser = new User({
      email: 'user@test123.com',
      password: '123456',
      name: 'test',
      token: inviteTokens[0]
    });
    await normalUser.save();
    expect(normalUser.isNormalUser()).toEqual(true);
  });

  it('adds a new moderator', async () => {
    moderator = new User({
      email: 'moderator@test123.com',
      password: '123456',
      name: 'test',
      token: inviteTokens[1]
    });
    await moderator.save();
    expect(moderator.isModerator()).toEqual(true);
  });

  it('adds a new admin', async () => {
    admin = new User({
      email: 'admin@test123.com',
      password: '123456',
      name: 'test',
      token: inviteTokens[2]
    });
    await admin.save();
    expect(admin.isAdmin()).toEqual(true);
  });

  it ('doesn\'t reuse a used token!', async () => {
    const user = new User({
      email: 'user_reusedToken@test123.com',
      password: '123456',
      name: 'test',
      token: inviteTokens[0]
    });
    await expect(user.save()).rejects.toThrow('Invite Token is invalid');
  });

  // // operations
  // it('logs in a user');
  // it('requires all fields for login');
  // // user permissions
  it('should not allow a user to modify mod or admin', async () => {
    const token = new Token({type: Token.TOKEN_TYPES.INVITE});
    await token.save();

    const otherUser = new User({
      email: 'otherNormalUser@test123.com',
      password: '123456',
      name: 'test',
      token: token
    });
    await otherUser.save();
    
    admin.name = 'I have a new name';
    await expect(admin.save()).rejects.toThrow('You are not permitted to edit this user');

    moderator.name = 'I have a new name';
    await expect(moderator.save()).rejects.toThrow('You are not permitted to edit this user');
    
    otherUser.editor = normalUser._id;
    otherUser.name = 'I have a new name';
    await expect(otherUser.save()).rejects.toThrow('You are not permitted to edit this user');
    
    normalUser.name = 'I changed my name without an editor';
    await expect(normalUser.save()).rejects.toThrow('You are not permitted to edit this user');
    
    normalUser.editor = normalUser._id;
    normalUser.name = 'I have a new name';
    await normalUser.save();
    await expect(normalUser.name).toEqual('I have a new name');

  });
  it('does not allow a user to modify their own role', async() => {
    normalUser.role = User.USER_ROLES.ADMIN;
    await expect(normalUser.save()).rejects.toThrow('You cannot change your own role');
  });
  // it('should not allow a mod to modify an admin');
  // it('should allow an admin to modify a user / mod');
  // it('should allow an mod to modify a user');
});