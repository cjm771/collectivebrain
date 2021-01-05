// react + redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { registerAction } from '../actions/user.actions.js';

// comoponents
import Input from '../components/Input.js';

// styles
import registerStyle from '../../scss/register.scss';
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
export default (props) => {
  
  /*************
   *   VARS    *
   *************/

  const searchParams = new URLSearchParams(props.location.search);

  /*************
   *   HOOKS    *
   *************/

  const [inputs, setInputs] = useState({
    email: searchParams.get('email') || '', 
    name: searchParams.get('name') || '',
    password: '',
    passwordConfirm: '', 
    inviteToken: searchParams.get('inviteToken') || '',
  });
  const user = useSelector((state) => { return state.user });
  const dispatch = useDispatch();

  useEffect(() => {
    focusOnInviteTokenInput();
  }, []);

  useEffect(() => {
    if (user.registered) {
      window.location.href = '/dashboard';
    }
  }, [user.registered]);
  
  /*************
   *  HELPERS  *
   *************/

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    dispatch(registerAction(inputs));
    setTimeout(() => {
      focusOnInviteTokenInput();
    }, 600);
    return null;
  }

  const handleInputChange = (value, name) => {
    setInputs(inputs => ({ ...inputs, [name]: value}));
  };

  const hasErrors = (field) => {
    return user.registerErrorFields && user.registerErrorFields.indexOf(field) !== -1;
  }

  const focusOnInviteTokenInput = () => {
    document.getElementsByName('inviteToken')[0].focus();
  };

   /*************
   *  RENDER   *
   *************/
  
   return (
    <div className={registerStyle.register}>
      <form 
        className={`${formStyle.form} ${formStyle.maxWidth}`}
        onSubmit={handleSubmit}
      >
          { (user.registered) ? 
          <div className={formStyle.successBox}>
            Logged in. If you're not automatically redirected, <a href='/'>click here</a> to continue.
          </div>
          : ''
        }
        { (user.registerError) ? 
          <div className={formStyle.errorBox} >
            Error: {user.registerError}
          </div>
          : ''
        }
        <Input 
          type="text"
          name="inviteToken"
          placeholder="invite token"
          onChange={handleInputChange} 
          error={hasErrors('inviteToken')}
          initValue={inputs.inviteToken}
        ></Input>
        <Input 
          type="text"
          name="name"
          placeholder="name"
          onChange={handleInputChange} 
          error={hasErrors('name')}
          initValue={inputs.name}
        ></Input>
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
         <Input 
          type="password"
          name="passwordConfirm"
          placeholder="confirm Password"
          onChange={handleInputChange} 
          error={hasErrors('passwordConfirm')}
          initValue={inputs.passwordConfirm}
        ></Input>
        <button onClick={handleSubmit} className={formStyle.button} disabled={user.registering}>
          {user.registering ? <span><FontAwesomeIcon icon={faSpinner} spin /> registering..</span> : 'register'}
        </button>
      </form>
    </div>
  );
}