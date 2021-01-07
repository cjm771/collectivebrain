// react / redux
import React, {useEffect, useState} from 'react';

// resources
import Autocomplete from 'react-autocomplete';
import formStyle from '../../scss/_forms.scss';

export default (props) => {

  const [input, setInput] = useState('');

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
      props.onSelect(toSet);
    }
    setInput('');
  }

  const onKeyDown = (e) => {

    const code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) { 
      onSubmit(e);
    }
  }

  return (
    <div className={`${formStyle.autocomplete} ${formStyle.inputWpr}`}>
      <Autocomplete
          inputProps={{
            className: `${formStyle.input}`,
            placeholder: props.placeholder || null,
            onKeyDown: onKeyDown
          }}
          getItemValue={(item) => item}
          items={props.options}
          renderItem={(item, isHighlighted) =>
            <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
              {item}
            </div>
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}

          onSelect={(val) => {onSubmit(null, val)}}
          shouldItemRender={(item) => {
            return item.toLowerCase().trim().indexOf(input.toLowerCase().trim()) !== -1
          }}
        />
    </div>
  )
}