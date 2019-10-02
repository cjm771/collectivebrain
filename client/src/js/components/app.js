import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Header from '../components/header.js';
import RootView from '../views/index.js';
import LoginView from '../views/login.js';
import DashboardView from '../views/dashboard.js';
import RegisterView from '../views/register.js';
import {isLoggedInAction} from '../actions/index.js';
import { useDispatch } from 'react-redux';

import appStyle from '../../scss/app.scss';

export default () => {
  
  // useEffect(() => {
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
            <Route path="/dashboard" component={DashboardView} />
          </div>
        </div>
      </Router>
    </div>
  );
};