export default {
  USER_ROLES: {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2,
  },
  INVITE_STATUS: {
    INVITED: 0,
    ACCEPTED: 1,
    REMOVED: 2,
  },
  THEME_DICT: {
    karry: {
      color: 'rgba(0, 0, 0, .5)',
      linkColor: '#cb887573',
      bgColor: 'rgba(254, 236, 226, 0)',
      autocompletBgColor: '#fff',
      paneColor: '#fee5d6'
    },
    dark: {
      color: 'rgba(255,255,255, .5)',
      linkColor: 'rgba(255,255,255, .5)',
      bgColor: 'rgba(0, 0, 0, 1)',
      autocompletBgColor: 'rgba(0, 0, 0, 1)',
      paneColor: 'rgba(100, 100, 100, 1)'
    },
    light: {
      color: 'rgba(0, 0, 0, .5)',
      linkColor: 'rgba(0, 0, 0, .25)',
      bgColor: 'rgba(255,255,255, 1)',
      autocompletBgColor: 'rgba(255,255,255, 1)',
      paneColor: 'rgba(220, 220, 220, 1)'
    }
  },
  getThemeMap: function (user) {
    const theme = this.THEME_DICT[user.theme] || this.THEME_DICT['dark'];
    return theme;
  },
  getRoleName: function (val) {
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