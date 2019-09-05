const User = require('../server/models/User.js');
const mongoose = require('../server/db.js');

afterAll(() => {
  // clean up test database
  if (process.env.NODE_ENV === 'test') {
    mongoose.connection.dropDatabase();
  }
});


describe("User tests", () => {
  it('should pass this basic ass test?', (done) => {
    expect(true).toBe(true);
  });
  
  // creation
  it('creates 3 invite tokens');
  it('adds a new user');
  it('adds a new moderator');
  it('adds a new admin');
  // validation
  it('should prevent existing emails from registering');
  it('should require all required fields');
  it('requires an invite token to register');
  // operations
  it('logs in a user');
  it('requires all fields for login');
  // user permissions
  it('should not allow a user to modify mod or admin');
  it('should not allow a mod to modify an admin');
  it('should allow an admin to modify a user / mod');
  it('should allow an mod to modify a user');
});