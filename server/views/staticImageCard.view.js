
const path = require('path');

// models
const Post = require('../models/Post');

// resources
const { createCanvas, loadImage } =require('canvas');

module.exports  =  (req, res) => {
    /**
     * get year as unix timestamp
     * @param {*} date 
     */
    const getYear = (date) => {
      return date.getTime();
    }

    /**
     * draws image contained to a box
     * @param {*} ctx 
     * @param {*} img 
     * @param {*} x 
     * @param {*} y 
     * @param {*} _width 
     * @param {*} _height 
     */
    const drawImageContained = (ctx, img, x, y, _width, _height,) => {
        const scale = 1;
        let contains = true;
        const childRatio = img.width / img.height;
        const parentRatio = _width / _height;
        let width = _width * scale;
        let height = _height * scale;
    
        if (contains ? (childRatio > parentRatio) : (childRatio < parentRatio)) {
          height = width / childRatio
        } else {
          width = height * childRatio
        }
    
        ctx.drawImage(img, x + ((_width - width) / 2), y, width, height);
    };

  
  /**
   * draws wrapped text to context given max width and height
   * @param {*} context ctx
   * @param {*} text text to display
   * @param {*} x start (x)
   * @param {*} y start (y)
   * @param {*} maxWidth 
   * @param {*} maxHeight 
   * @param {*} lineHeight 
   */
  const wrapText = (context, text, x, y, maxWidth, maxHeight, lineHeight) => {
    let count = 0;
  
    var words = text.split(/(\n)|\s/g).filter((word) => word);
    var line = '';
    var baseY = y;

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      count++;      

      if ((testWidth > maxWidth && n > 0) || /\n/.test(words[n])) {
        if (y - baseY + lineHeight < maxHeight) {
          context.fillText( line, x, y);
        } else {
          break;
        }
        
        line =  words[n].replace(/\n/g, '') + ' ';
   
        y += lineHeight;
        
        
      }
      else {
        line = testLine;
      }
    }
  if (count < words.length) {
    if (testWidth > maxWidth - 5) {
      line = line.slice(0, line.length - 3) + '...';
    } else {
      line += '...';
    }
  }
    context.fillText(line, x, y);
  }

  /**
   * limit amount of sources to a speicifed amount and add `+3 more` to end..to save space
   * @param {[str]} sources array of sources
   * @param {*} n amount to limit to
   * @returns {sources} limited sources
   */
  const limitSources = (sources, n) => {
    let truncSources = sources.slice();
    if (sources.length > n) {
      truncSources = sources.slice(0, n);
      let leftoverCount = sources.length - n;
      truncSources.push(`+ ${leftoverCount} more source${leftoverCount > 1 ? 's' : ''}` )
    }
    return truncSources.reverse();
  };
  
  const init = async () => {
    const post = await Post.findById(req.params.id);
    try {
      if (post) {
        const height = 1024;
        const width = 512;
        const padding = width * .05;
        const dateStr = (post.startDate ? (post.endDate) ? `${getYear(post.startDate)} - ${getYear(post.endDate)}` : (getYear(post.startDate) ? `${getYear(post.startDate)}` : '') : '');
        const main_content_y_offset = padding + height * .039;
        const image_caption_offset_pct = 0.41;
        const image_height_pct = 0.70;
  
        const canvas = createCanvas(width, height, (req.query.format && req.query.format !=='svg' ? null : 'svg'));
        const ctx = canvas.getContext('2d');
        // post.images = [];
  
        ctx.save();
        ctx.strokeStyle = Post.getCategoryColorByName(Post.getCategoryName(post.category));
        ctx.lineWidth = 20;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        // Write "Awesome!"
        ctx.textAlign = 'right'
        ctx.font = '600 10px Helvetica, Arial, Sans-Serif'
        ctx.fillText(dateStr, width - padding, padding)
        ctx.font = '800 10px Helvetica, Arial, Sans-Serif'
        ctx.fillText(post.creator || 'Dummy Creator', width - padding, 55)
        ctx.textAlign = 'left'
        ctx.font = '600 12px Helvetica, Arial, Sans-Serif'
        ctx.fillText(post.title.toUpperCase(), padding, padding)
        ctx.fillStyle = "rgba(100, 100, 100, 1)";
        ctx.font = '500 10px Helvetica, Arial, Sans-Serif'
        ctx.fillText(Post.getCategoryName(post.category).toUpperCase(), padding, 55)
        if (post.images && post.images.length) {
          const image = await loadImage(path.resolve(__dirname + '/../../client/dist' + post.images[0].src))
          // ctx.drawImage(image, padding, main_content_y_offset, width - padding * 2, width * .57);
          drawImageContained(
            ctx,
            image,
            padding,
            main_content_y_offset,
            width - padding * 2,
            width * image_height_pct,
            true
          );
        }
        ctx.font = 'normal 10px Helvetica, Arial, Sans-Serif'
        ctx.fillStyle = "#333";
        wrapText(
          ctx, 
          post.description, 
          padding, 
          main_content_y_offset + (post.images.length ? height * image_caption_offset_pct - 15 : 30), 
          width - padding * 2, 
          height * (post.images.length ? (image_caption_offset_pct + .005) : .78), 
          12
        );
        ctx.save();
        ctx.fillStyle ='#bbbbbb';
        ctx.font = 'italic normal 10px Helvetica, Arial, Sans-Serif';
        if (post.images && post.images.length) {
          wrapText(
            ctx,
            'I am a random caption s dsd sdasdsadsadasd asdasddasds asdsadasdas dsadasdadasasdasdsdasdasdsaadassdasdsadadadsadaddasdasdasdasdasda',
            padding, 
            padding + height * image_caption_offset_pct,
            width - padding * 2,
            12,
            12
          );
        }
        ctx.restore();
        ctx.fillStyle = '#008cff';
        ctx.textBaseline = 'bottom';
        if (post.tags && post.tags.length) {
          wrapText(
            ctx, 
            post.tags.map(tag => `#${tag.trim()}`).join(' '), 
            padding, 
            height-padding , 
            width - padding * 2, 
            12, 
            12
          );
        }
        ctx.restore();
        ctx.font = 'italic normal 10px Helvetica, Arial, Sans-Serif';
        ctx.fillStyle = '#c0c0c0';
        if (post.sources && post.sources.length) {   
          // post.sources = post.sources.concat(post.sources).concat(post.sources);  
          let sourceY = height - padding - (post.sources.length < 3 ? 30 : 18);
          ctx.fillStyle = '#c0c0c0';
          limitSources(post.sources, 2).forEach((source, index) => {
            wrapText(
              ctx,
              source,
              padding,
              sourceY,
              width - padding * 2,
              24,
              12
            );
            sourceY -= 30;
          });
        }
        
        let mimeType = 'image/svg+xml';
        if (req.query.format && req.query.format === 'jpeg' || req.query.format === 'jpg') {
          mimeType = 'image/jpeg';
        }
        res.contentType(mimeType); 
        res.setHeader('Content-Type', mimeType);
        res.send(canvas.toBuffer(mimeType, {quality: 0.9}));
      } else {
        res.errorJSON('Post could not be found')
      }
    } catch (e) {
      debugger;
      res.errorJSON(e.message || e)
    }
  };
  init();

}