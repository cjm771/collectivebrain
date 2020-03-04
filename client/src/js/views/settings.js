import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addInviteAction, getUserSettingsAction } from '../actions/user.actions.js';

import axios from 'axios';
import uuidv4 from 'uuid/v4';

import settingsStyle from '../../scss/settings.scss';
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default () => {
  /*************
   *   VARS    *
   *************/


  
  /*************
   *   HOOKS   *
   *************/

  const userData = useSelector((state) => { 
    return state.user;
  });
  const [inviteMode, setInviteMode] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserSettingsAction());
  }, []);

  /*************
   *  HELPERS  *
   *************/

  const changeTheme = (theme) => {
    axios.get( `/?theme=${theme}&cb=${uuidv4()}`);
    // hacky for now
    let $body = document.querySelector('body');
    $body.className = '';
    $body.classList.add(`theme-${theme}`);
  };

  const handleSendInvite = (event) => {
    if (event) {
      event.preventDefault();
    }
    dispatch(addInviteAction(inputs));
    setTimeout(() => {
      focusOnInviteTokenInput();
    }, 600);
    return null;
  }

  /*************
   *  RENDER   *
  *************/

    return (
      <div  className={settingsStyle.settings}>
        <h1>Settings</h1>
        <h5> You </h5>
        <h5> Invites <button className={formStyle.buttonLink}><FontAwesomeIcon icon={faPlus} />Invite User</button></h5>
        { userData.userSettings && userData.userSettings.invites && userData.userSettings.invites.length ?  
          userData.userSettings.invites.map((invite, index) => (
            <div className={settingsStyle.invites} key={index}>
              <div className={settingsStyle.colUser}>
                { invite.metaData.user ? `${invite.metaData.user.name} (${invite.metaData.user.email})` : `${ invite.metaData.name } ${(invite.metaData.email && invite.metaData.name) ?  `(${invite.metaData.email})` : invite.metaData.email}` }
                { invite.metaData.role  === 0 ? 'user' : (invite.metaData.role  === 1 ? 'moderator' : 'admin') }
                { invite.status === 1 ? 'accepted' : 'invited' }
              </div>
            </div>
           ))
          : ''
        }
        <h5> Change Theme </h5>
        <div className={formStyle.form}>
          <div>
            <button onClick={(e) => {changeTheme('light')}} className={formStyle.buttonSecondary}>Light Mode</button>
          </div>
          <div>
            <button onClick={(e) => {changeTheme('dark')}} className={formStyle.buttonSecondary}>Dark mode</button>                
          </div>
        </div>

      </div>
    );
};