describe("post tests", () => {

  it('should let a user make a post', () => {
  });
  it('should reject if required fields are not there', () => {
  });
  // user permissions
  it('should not allow a user to modify mod or admin posts', todo.test);
  it('should not allow a mod to modify an admin posts', todo.test);
  it('should allow an admin to modify an admin / user / mod posts', todo.test);
  it('should allow an mod to modify a user posts', todo.test);
});