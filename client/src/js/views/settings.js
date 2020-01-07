import React from 'react';

import DashboardMenu from '../components/DashboardMenu.js';

import settingsStyle from '../../scss/settings.scss';

export default () => {
    return (
      <div  className={settingsStyle.settings}>
        <h1>Settings</h1>
        <p>This is the settings page..coming soon.</p>
      </div>
    );
};