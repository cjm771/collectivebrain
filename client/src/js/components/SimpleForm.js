// react-redux
import React, {useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';

// components
import  Input from './Input.js';

// styles
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSpinner } from '@fortawesome/free-solid-svg-icons';


export default ({
    fields,
    action,
    hideSubmit,
    focusOn,
    processing, 
    error, 
    ctaButtonText,
    ctaButtonProcessingText,
    submitted, 
    errorFields, 
    onProcessing, 
    onSubmit, 
    onError
  }) => {


  /*************
   *   VARS    *
   *************/

   
  /*************
  *   HOOKS    *
  *************/
   
   const [inputProps, setInputProps] = useState([]);
   const [inputs, setInputs] = useState({});

   useEffect(() => {
    formInit();
   }, [fields]);

   const dispatch = useDispatch();

   useEffect(() => {
    focusOnInput(focusOn);
  }, []);

  useEffect(() => {
    if (processing && onProcessing) {
      onProcessing();
    }
  }, [processing]);

  useEffect(() => {
    if (submitted && onSubmit) {
      onSubmit();
    }
  }, [submitted]);

  useEffect(() => {
    if (error && onError) {
      onError();
    }
  }, [error]);

  /*************
   *  HELPERS  *
   *************/

  const formInit = () => {
    const inputProps = [];
    const initInputValues = {};

    for (let [fieldName, fieldObj] of Object.entries(fields)) {
      initInputValues[fieldName] = fieldObj.initValue !== undefined ? fieldObj.initValue : '';
      inputProps.push({
        name: fieldName, 
        type: fieldObj.type,
        cast: fieldObj.cast,
        errorFieldName: fieldObj.errorFieldName,
        placeholder: fieldObj.placeholder,
        options: fieldObj.options,
        disabled: fieldObj.disabled
      });
     }

     setInputs(initInputValues);
     setInputProps(inputProps);
  };

  const handleInputChange = (value, name) => {
    setInputs(inputs => ({ ...inputs, [name]: value}));
  };

  const focusOnInput = (name) => {
    if (name) {
      document.getElementsByName(name)[0].focus();
    }
  };

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    dispatch(action(inputs));
    setTimeout(() => {
      focusOnInput(focusOn);
    }, 600);
    return null;
  };

  const hasErrors = (field) => {
    return errorFields && errorFields.indexOf(field) !== -1;
  }


  /*************
   *  RENDER   *
  *************/
  return (
    <form 
    className={`${formStyle.form} ${formStyle.fullWidth}`}
      onSubmit={handleSubmit}
    >
    { error ? 
      <div className={formStyle.errorBox} >
        Error: {error}
      </div>
      : ''
    }
    {
      inputProps.map((setOfProps, index) => (
        <Input 
          {...setOfProps}
          key={index}
          onChange={handleInputChange} 
          error={hasErrors(setOfProps.errorFieldName || setOfProps.name)}
          initValue={inputs[setOfProps.name]}
      ></Input>
      ))
    }
    {hideSubmit ? '' : (
      <button onClick={handleSubmit} className={formStyle.button} disabled={processing}>
        {processing ? <span><FontAwesomeIcon icon={faSpinner} spin /> {ctaButtonProcessingText || 'processing'}..</span> : (ctaButtonText || 'submit')}
      </button>
     )}

  </form>
  )

};