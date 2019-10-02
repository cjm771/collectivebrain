import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginAction, clearErrorFieldAction } from '../actions/user.actions.js';

// import loginStyle from '../../scss/login.scss';
import formStyle from '../../scss/_forms.scss';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default (props) => {
  const [inputs, setInputs] = useState({email: '', password: ''});
  const user = useSelector((state) => { return state.user });
  const dispatch = useDispatch();

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    dispatch(loginAction(inputs));
    setTimeout(() => {
      focusOnEmailInput();
    }, 600);
    return null;
  }

  const handleInputChange = (event) => {
    event.persist();
    dispatch(clearErrorFieldAction(event.target.name));
    setInputs(inputs => ({ ...inputs, [event.target.name]: event.target.value }));
  };

  const focusOnEmailInput = () => {
    document.getElementsByName('email')[0].focus();
  };

  useEffect(() => {
    focusOnEmailInput();
  }, []);

  useEffect(() => {
    if (user.loggedIn) {
      window.location.href = '/';
    }
  }, [user.loggedIn]);

  return (
    <form 
      className={formStyle.form}
      onSubmit={handleSubmit}
    >
        { (user.loggedIn) ? 
        <div className={formStyle.successBox}>
          Logged in. If you're not automatically redirected, <a href='/'>click here</a> to continue.
        </div>
        : ''
      }
      { (user.loginError) ? 
        <div className={formStyle.errorBox} >
          Error: {user.loginError}
        </div>
        : ''
      }
      <input 
        type="text" 
        className={classNames(formStyle.input, (user.loginErrorFields && user.loginErrorFields.indexOf('email') !== -1) ? formStyle.hasErrors : null)} 
        onChange={handleInputChange} 
        value={inputs.email} 
        placeholder="email" 
        disabled={user.loggingIn}
        name="email"
      />
      <input 
        type="password" 
        className={classNames(formStyle.input, (user.loginErrorFields && user.loginErrorFields.indexOf('password') !== -1) ? formStyle.hasErrors : null)} 
        onChange={handleInputChange} 
        value={inputs.password} 
        placeholder="password" 
        disabled={user.loggingIn}
        name="password"
      />
      <button onClick={handleSubmit} className={formStyle.button} disabled={user.loggingIn}>
        {user.loggingIn ? <span><FontAwesomeIcon icon={faSpinner} spin /> logging in..</span> : 'login'}
      </button>
    </form>
  );
};