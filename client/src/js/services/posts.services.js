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
    '#0000ff',
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
    getYear: (ts) => {
    if (ts) {
      return new Date(parseInt(ts)).getUTCFullYear() + '';
    } else {
      return null;
    }
   },
  getSubCategoriesFromCategoryName: function (name) {
    let result = {};
    name = name ? name.toUpperCase() : 'UNCATEGORIZED';
    if (name !== 'UNCATEGORIZED') {
      result['UNCATEGORIZED'] = this.SUB_CATEGORIES['UNCATEGORIZED'];
    }
    const subcat_names = this.SUB_CATEGORIES_TO_CATEGORIES_MAPPINGS[name];
    if (subcat_names) {
      subcat_names.forEach((key) => {
        result[key] = this.SUB_CATEGORIES[key];
      });
    }
    return result;
  },
  cleanInputs: function (inputs, extra={}) {
    const defaults = {
      title: '',
      description: ''
    }

    // clean files
    let cleanedFiles = null;
    if (inputs.files) {
        cleanedFiles = inputs.files.map((file) => {
        return {
          caption: file.caption,
          src: file.src,
          srcThumb: file.srcThumb
        }
      });
    }

    // clean tags 
    let cleanedTags = null;
    if (inputs.tags) {
      cleanedTags = inputs.tags.split(',').map((tag) => {
        return tag.trim();
      }).filter((tag) => {
        return tag !== '';
      })
    }

    // clean sources
    let cleanSources = null;
    if (inputs.sources) {
      
    }
    // final cleanup
    const cleanedInputs = {
      ...defaults,
      ...inputs,
      category: parseInt(inputs.category) || 0,
      subCategory: parseInt(inputs.subCategory) || 0,
      author: undefined,
      files: cleanedFiles,
      tags: cleanedTags,
      ...extra
    }

    return cleanedInputs;
  },
  getAllTagsFromPosts: function (posts, allowDups=false) {
    let tags = [];
    posts.forEach((post) => {
      if (post.tags && post.tags.length) {
        tags = this.getAllTags([...tags, ...post.tags], allowDups);
      }
    });
    return tags;
  },
  getAllTags: function (tags, allowDups=false) { 
    if (!allowDups) {
      tags = [ ...new Set([...tags.filter(t => !!t).map(t => {
       return t.trim()
      })])];
    }
    return tags;
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
  getImageFiles: function(files) {
    if (!files) {
      return [];
    }
    return files.map((file) => {
      let imageSrc = file.src;
      if (/\.obj$/.test(file.src)) {
        imageSrc = file.srcThumb;
      }
      file = {...file};
      file.src = imageSrc;
      return file;
    })
  },
  getSubCategoryIndexByName: function (name) {
    return this.SUB_CATEGORIES[name.toUpperCase()];
  },
  getCategoryIndexByName: function (name) {
    return this.CATEGORIES[name.toUpperCase()];
  },
  getSubCategoryColorByName: function (name) {
    return this.SUB_CATEGORY_COLORS[this.getSubCategoryIndexByName(name)]
  },
  getCategoryColorByName: function (name) {
    return this.CATEGORY_COLORS[this.getCategoryIndexByName(name)]
  } 
};