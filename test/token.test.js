const mongoose = require('../server/db.js');
const Token = require('../server/models/Token.js');
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


describe("Token tests", () => {

  it('creates pseudo random generated unique token', async () => {
    const token1 = new Token({type: Token.TOKEN_TYPES.INVITE});
    await token1.save();
    const token2 = new Token({type: Token.TOKEN_TYPES.INVITE});
    await token2.save();
    const token3 = new Token({type: Token.TOKEN_TYPES.INVITE});
    await token3.save();
    const tokens = [token1, token2, token3].map((token) => {
      return token.token;
    });
    expect(new Set(tokens).size).toEqual(tokens.length);
  });

  it('should reject if type doesn\'t exist.', async () => {
    const token1 = new Token({type: -99});
    await expect(token1.save()).rejects.toThrow();
    const token2 = new Token();
    await expect(token2.save()).rejects.toThrow();
  });

});