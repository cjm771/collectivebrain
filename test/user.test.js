describe("User tests", () => {

  it('should pass this basic ass test?', () => {
    expect(true).toBe(true);
  });
  // creation
  it('creates 3 invite tokens', todo.test);
  it('adds a new user', todo.test);
  it('adds a new moderator', todo.test);
  it('adds a new admin', todo.test);
  // validation
  it('should prevent existing emails from registering', todo.test);
  it('should require all required fields', todo.test);
  it('requires an invite token to register', todo.test);
  // operations
  it('logs in a user', todo.test);
  it('requires all fields for login', todo.test);
  // user permissions
  it('should not allow a user to modify mod or admin', todo.test);
  it('should not allow a mod to modify an admin', todo.test);
  it('should allow an admin to modify a user / mod', todo.test);
  it('should allow an mod to modify a user', todo.test);
});