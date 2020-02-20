import React from 'react';

import DashboardMenu from '../components/DashboardMenu.js';

import axios from 'axios';
import uuidv4 from 'uuid/v4';

import settingsStyle from '../../scss/settings.scss';
import formStyle from '../../scss/_forms.scss';

const changeTheme = (theme) => {
  axios.get( `/?theme=${theme}&cb=${uuidv4()}`);
  // hacky for now
  let $body = document.querySelector('body');
  $body.className = '';
  $body.classList.add(`theme-${theme}`);
}

export default () => {
    return (
      <div  className={settingsStyle.settings}>
        <h1>Settings</h1>
        <p>This is the settings page...(more coming soon).</p>
        <div className={formStyle.form}>
            Change Theme: 
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