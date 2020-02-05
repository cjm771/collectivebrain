import React, {useState} from 'react';

// styles
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';

export default ({type, name, options, disabled, error, initValue, onChange}) => {

  /********
   * VARS
   ********/

  onChange = onChange || ((val, name) => {});

  /********
   * HOOKS
   *******/

  const [value, setValue] = useState(initValue);

  /*********
   * HELPERS
   ********/

  const handleInputChange = (event, nameOverride=false, valueOverride=false) => {
    event.persist();
    console.log(valueOverride);
    setValue(valueOverride || event.target.value);
    onChange(valueOverride || event.target.value, nameOverride || name);
  };



  switch(type) {
    default:
    case 'text':
      return  (
        <div>
          <div className={`${formStyle.inputWpr} ${value ? formStyle.filled : ''}`}>
            <input 
              type="text" 
              className={classNames(formStyle.input, error ? formStyle.hasErrors : null)} 
              onChange={handleInputChange} 
              value={value} 
              placeholder={name} 
              disabled={disabled}
              name={name}
            />
            <label>{name}</label>
          </div>
        </div>
      );
    case 'checkbox':
      return  (
        <div>
          <div className={`${formStyle.inputWpr} ${ formStyle.switch} ${value ? formStyle.filled : ''}`}  onClick={(e) => {handleInputChange(e, name, !value)}} >
            <div className={`${formStyle.fakeCheckBox} ${value ? formStyle.checked : '' }`}></div>
            <label>{name}</label>
          </div>
        </div>
      );
    case 'dropdown':
      if (!(options && typeof options === 'object')) {
        options = {[initValue]: initValue};
      }
      return (
        <div>
          <div className={classNames(formStyle.inputWpr, formStyle.dropdown, error ? formStyle.hasErrors : null, formStyle.filled)}>
            <select 
              onChange={handleInputChange}
              className={classNames('form-control')} 
              value={value}
            >
              {
                Object.keys(options).map((key, index) => {
                  const val = options[key];
                  return (
                    <option value={val} key={index}>{key}</option>
                  )
                })
              }
            </select>
            <div className={formStyle.arrow}><FontAwesomeIcon icon={faCaretDown} /></div>
            <label>{name}</label>
          </div>
        </div>
      );
    case 'textarea':
      return (
        <div>
          <div className={`${formStyle.inputWpr} ${value ? formStyle.filled : ''}`}>
            <textarea 
              className={classNames(formStyle.input, error ? formStyle.hasErrors : null)} 
              onChange={handleInputChange} 
              placeholder={name} 
              value={value}
              disabled={disabled}
              name={name}
            ></textarea>
            <label>{name}</label>
          </div>
        </div>
      );
  }
};  