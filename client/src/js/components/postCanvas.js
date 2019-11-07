import React, {useState} from 'react';
import { Stage, Layer, Rect, Text, Group, Image } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

export default ({stageRef, post}) => {

  /**
   * ellispify text if runs over a certian amount
   * @param {str} text 
   * @param {int} length 
   * @returns {str} text
   */
  const ellipsifyIfOver = (text, length) => {
    let extraTrunc = 0;
    const newLineVal = 0;
    let trueLength = text.length;
    const regex = /\n/g;
    let matches;
    while (matches = regex.exec(text)) {
      trueLength += newLineVal;
      extraTrunc += newLineVal;
    }
    if (trueLength > (length - 3)) {
      text = text.slice(0, length - 3 - extraTrunc) + '...';
    }
    return text;
  };

  /**
   * limit amount of sources to a speicifed amount and add `+3 more` to end..to save space
   * @param {[str]} sources array of sources
   * @param {*} n amount to limit to
   * @returns {str} text
   */
  const limitSourcesTo = (sources, n) => {
    let truncSources = sources.slice();
    if (sources.length > n) {
      truncSources = sources.slice(0, n);
      let leftoverCount = sources.length - n;
      truncSources.push(`+ ${leftoverCount} more source${leftoverCount > 1 ? 's' : ''}` )
    }
    return truncSources.map((source) => ellipsifyIfOver(source, 200)).join('\n\n');
  };

  const height = 750;
  const width = height * .70;
  const padding = width * .05;
  const dateStr = (post.endDate) ? `${post.startDate} - ${post.endDate}` : ((post.startDate) ? `${post.startDate}` : '');
  const main_content_y_offset = padding + height * .06;
  const image_caption_offset_pct = 0.49;

  const ImageFromUrl = ({url}) => {  
    const [image] = useImage(url);
    // "image" will DOM image element or undefined
    return (
      <Image 
        image={image}
        x={padding}
        y={main_content_y_offset}
        width={width - padding * 2}
        height={width * .6} 
      />
    );
  };  

  return (
    <Stage width={width} height={height} ref={stageRef}>
      <Layer>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill='white'
          stroke='black'
          strokeWidth={1}
        />
        <Text 
          x={padding}
          y={padding}
          width={width - padding * 2}
          fontSize={10}
          align='right'
          fontStyle={600}
          fill='black'
          text={dateStr} 
        />
          <Text 
          x={padding}
          y={55}
          width={width - padding * 2}
          fontSize={10}
          align='right'
          fontStyle={800}
          text={post.creator || 'Dummy Creator'} 
        />
        <Text 
          x={padding}
          y={padding}
          fontSize={12}
          width={width * .70}
          fontStyle={600}
          fill='black'
          text={post.title.toUpperCase()} 
        />
        <Text 
          x={padding}
          y={55}
          fontSize={10}
          width={width * .70}
          fontStyle={500}
          fill='grey'
          text={post.category.toUpperCase()} 
        />
        {
          post.images.length ? 
         (
          <Group>
            <ImageFromUrl
              url={post.images[0].src}
            />
            <Text 
              x={padding}
              y={padding + height * image_caption_offset_pct}
              fontSize={10}
              fill='#bbb'
              fontStyle='italic'
              width={width - padding * 2}
              text={ellipsifyIfOver('I am a random image caption', 100)} 
           />
          </Group>
        )
          : null
        }

        <Text 
          x={padding}
          y={main_content_y_offset + (post.images.length ? height * image_caption_offset_pct - 15 : 15)}
          fontSize={10}
          width={width - padding * 2}
          fill='#333'
          text={ellipsifyIfOver('................................'.split('').map(() => post.description).join(''),  1550 * (post.images.length ? 1 : 2.8))} 
        />
        { post.sources ? 
          <Text 
          x={padding}
          y={padding}
          fontSize={10}
          width={width - padding * 2}
          height={height - padding * 2 - 30}
          fill='#c0c0c0'
          fontStyle='italic'
          verticalAlign='bottom'
          text={limitSourcesTo(post.sources.concat(post.sources, post.sources, post.sources), 2)} 
        /> : null
        }
        <Text 
          x={padding}
          y={padding}
          fontSize={10}
          width={width - padding * 2}
          height={height - padding * 2}
          fill='#008cff'
          verticalAlign='bottom'
          text={ellipsifyIfOver(post.tags.map(tag => `#${tag.trim()}`).join(' '), 100)} 
        />
      </Layer>
    </Stage>
  )
}