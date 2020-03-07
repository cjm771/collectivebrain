// react + redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginAction } from '../actions/user.actions.js';

// comoponents
import Input from '../components/Input.js';

// styles
import loginStyle from '../../scss/login.scss';
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default (props) => {

  /*************
   *   HOOKS   *
   *************/

  const [inputs, setInputs] = useState({email: '', password: ''});
  const user = useSelector((state) => { return state.user });
  const dispatch = useDispatch();

  useEffect(() => {
    focusOnEmailInput();
  }, []);

  useEffect(() => {
    if (user.loggedIn) {
      window.location.href = '/dashboard';
    }
  }, [user.loggedIn]);

  /*************
   *  HELPERS  *
   *************/

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

  const handleInputChange = (value, name) => {
    setInputs(inputs => ({ ...inputs, [name]: value}));;
  };

  const hasErrors = (field) => {
    return user.loginErrorFields && user.loginErrorFields.indexOf(field) !== -1;
  }

  const focusOnEmailInput = () => {
    document.getElementsByName('email')[0].focus();
  };

  /*************
   *  RENDER   *
   *************/

  return (
    <div className={loginStyle.login}>
    <form 
      className={`${formStyle.form} ${formStyle.maxWidth}`}
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
      <Input 
        type="text"
        name="email"
        onChange={handleInputChange} 
        error={hasErrors('email')}
        initValue={inputs.email}
      ></Input>
        <Input 
        type="password"
        name="password"
        onChange={handleInputChange} 
        error={hasErrors('password')}
        initValue={inputs.password}
      ></Input>
      <button onClick={handleSubmit} className={formStyle.button} disabled={user.loggingIn}>
        {user.loggingIn ? <span><FontAwesomeIcon icon={faSpinner} spin /> logging in..</span> : 'login'}
      </button>
    </form>
    </div>
  );
};