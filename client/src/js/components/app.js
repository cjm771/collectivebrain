import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import {isLoggedInAction} from '../actions/user.actions.js';
import { useDispatch } from 'react-redux';


// components
import Header from '../components/header.js';
import { toast } from 'react-toastify';

// views
import RootView from '../views/main.js';
import LoginView from '../views/login.js';
import DashboardView from '../views/dashboard.js';
import RegisterView from '../views/register.js';

// styles
import appStyle from '../../scss/app.scss';
import '!style-loader!css-loader!react-toastify/dist/ReactToastify.css';


export default () => {

  toast.configure();

  const dispatch = useDispatch();
  dispatch(isLoggedInAction());

  return (
    <div id="app" className={appStyle.app}>
      <Router>
        <Header/>
        <div className={appStyle.container}>
          <Route exact path="/" component={RootView} />
          <Route exact path="/g/:group" component={RootView} />
          <Route path="/login" component={LoginView} />
          <Route path="/register" component={RegisterView} />
          <Route path="/dashboard/:page?/:id?" component={DashboardView} />
          {/* <Route path="/dashboard/post/:id/edit"  component={EditPostView} /> */}
          {/* <Route path="/settings"  component={SettingsView} /> */}
        </div>
      </Router>
    </div>
  );
};