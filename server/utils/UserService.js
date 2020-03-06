module.exports = {
  USER_ROLES : {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2
  },
  getRoleName : function (val) {
    val = parseInt(val);
    const keys = Object.keys(this.USER_ROLES);
    if (typeof val !== 'number' ||val < 0 || val > keys.length - 1 ) {
      throw new Error(`Invalid value to look up: ${val}`);
    } else {
      return keys.filter((key) => {
        return val === this.USER_ROLES[key];
      })[0];
    }
  }
}