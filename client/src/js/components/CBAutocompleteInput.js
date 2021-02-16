// react / redux
import React, {useEffect, useState} from 'react';
import uuidv4 from 'uuid/v4';
// resources
import Autocomplete from 'react-autocomplete';
import formStyle from '../../scss/_forms.scss';

export default (props) => {
  const [input, setInput] = useState('');
  let timer = null;
  const onSubmit = (event, forceVal=null) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    let toSet = forceVal;
    if (!toSet) {
      toSet = input;
    }
    if (toSet && toSet.trim() !== '') {
      props.onSelect(toSet.replace(/^#/, ''));
    }
    setInput('');
  }

  const getInput = () => {
    return input;
  }

  const onKeyDown = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    if (code === 13) {
      e.preventDefault();
      timer = setTimeout((e) => {
        if (getInput().trim() !== '') {
          onSubmit(e);
        }
      }, 100)
     
    }
  }

  return (
    <div className={`${formStyle.autocomplete} ${formStyle.inputWpr}  ${formStyle.maxWidth}`}>
      <Autocomplete
          wrapperStyle={{ display: 'block' }}
          menuStyle={{ 
            zIndex: 1, 
            textAlign: 'left',
            borderRadius: '3px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
            background: props.themeMap.autocompletBgColor,
            color: props.themeMap.color,
            padding: '2px 0',
            fontSize: '90%',
            position: 'fixed',
            overflow: 'auto',
            maxHeight: '50%'
          }}
          inputProps={{
            className: `${formStyle.input}`,
            placeholder: props.placeholder || null,
            onKeyDown: onKeyDown
          }}
          getItemValue={(item) => item}
          items={props.options}
          renderItem={(item, isHighlighted) => {
            return (
              <div style={{ background: isHighlighted ?  props.themeMap.paneColor : 'transparent' }} key={uuidv4()}>
                {item}
              </div>
            )
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSelect={(val) => {
            clearTimeout(timer);
            onSubmit(null, val);
          }}
          shouldItemRender={(item) => {
            return item.toLowerCase().trim().indexOf(input.toLowerCase().trim().replace(/^#/, '')) !== -1
          }}
        />
    </div>
  )
}