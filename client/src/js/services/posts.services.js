export default {
  CATEGORIES: {
    UNCATEGORIZED: 0,
    WRITTEN: 1,
    DRAWN: 2,
    BUILT: 3, 
    CAPTURED: 4
  },
  CATEGORY_COLORS: [
    '#cccccc',
    '#ff00fd',
    '#ff0000',
    '#ffff00',
    '#00ff00'
  ],
  SUB_CATEGORIES:{
    UNCATEGORIZED: 0,
    PRECEDENT: 1,
    BOOK: 2,
    PERIODICAL: 3, 
    ONLINE_CONTENT: 4, 
    ACADEMIC_SOURCE: 5, 
    REPRESENTATION: 6
  },
  SUB_CATEGORY_COLORS: [
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
   SUB_CATEGORIES_TO_CATEGORIES_MAPPINGS : {
    UNCATEGORIZED: ['UNCATEGORIZED'],
    WRITTEN: ['BOOK', 'PERIODICAL', 'ACADEMIC_SOURCE'],
    DRAWN: ['REPRESENTATION'],
    BUILT: ['PRECEDENT'],
    CAPTURED: ['ONLINE_CONTENT']
  },
  getSubCategoriesFromCategoryName: function (name) {
    let result = {};
    if (name.toUpperCase() !== 'UNCATEGORIZED') {
      result['UNCATEGORIZED'] = this.SUB_CATEGORIES['UNCATEGORIZED'];
    }
    const subcat_names = this.SUB_CATEGORIES_TO_CATEGORIES_MAPPINGS[name.toUpperCase()];
    if (subcat_names) {
      subcat_names.forEach((key) => {
        result[key] = this.SUB_CATEGORIES[key];
      });
    }
    return result;
  },
  getCategoryName: function (val) {
    val = parseInt(val);
    const keys = Object.keys(this.CATEGORIES);
    if (typeof val !== 'number' ||val < 0 || val > keys.length - 1 ) {
      throw new Error(`Invalid value to look up: ${val}`);
    } else {
      return keys.filter((key) => {
        return val === this.CATEGORIES[key];
      })[0];
    }
  },
  getSubCategoryIndexByName: function (name) {
    return this.SUB_CATEGORIES[name.toUpperCase()];
  },
  getCategoryIndexByName: function (name) {
    return this.CATEGORIES[name.toUpperCase()];
  },
  getCategoryColorByName: function (name) {
    // debugger;
    return this.CATEGORY_COLORS[this.getCategoryIndexByName(name)]
  } 
};