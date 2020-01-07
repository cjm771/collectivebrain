import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Header from '../components/header.js';
import RootView from '../views/main.js';
import LoginView from '../views/login.js';
import DashboardView from '../views/dashboard.js';
// import EditPostView from '../views/editpost.js';
// import SettingsView from '../views/settings.js';
import RegisterView from '../views/register.js';
import {isLoggedInAction} from '../actions/user.actions.js';
import { useDispatch } from 'react-redux';

import appStyle from '../../scss/app.scss';

export default () => {

  const dispatch = useDispatch();
  dispatch(isLoggedInAction());

  return (
    <div id="app" className={appStyle.app}>
      <Router>
        <Header/>
        <div className={appStyle.container}>
          <div className={appStyle.main}>
            <Route exact path="/" component={RootView} />
            <Route path="/login" component={LoginView} />
            <Route path="/register" component={RegisterView} />
            <Route path="/dashboard/:page?/:id?" component={DashboardView} />
            {/* <Route path="/dashboard/post/:id/edit"  component={EditPostView} /> */}
            {/* <Route path="/settings"  component={SettingsView} /> */}
          </div>
        </div>
      </Router>
    </div>
  );
};