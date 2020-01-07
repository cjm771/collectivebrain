export default {
  CATEGORIES: {
    UNCATEGORIZED: 0,
    PRECEDENT: 1,
    BOOK: 2,
    PERIODICAL: 3,
    ONLINE_CONTENT: 4,
    ACADEMIC_SOURCE: 5,
    REPRESENTATION: 6
  },
  COLORS: [
    '#cccccc',
    '#ff5252',
    '#7c4dff',
    '#64ffda',
    '#69f0ae',
    '#ffd740',
    '#ffab40',
    '#ff6e40',
    '#eeff41',
  ],
  getCategoryIndexByName: function (name) {
    return this.CATEGORIES[name.toUpperCase()];
  },
  getCategoryColorByName: function (name) {
    // debugger;
    return this.COLORS[this.getCategoryIndexByName(name)]
  } 
}