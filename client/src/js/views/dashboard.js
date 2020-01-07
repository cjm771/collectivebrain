import React from 'react';
import { Route, Switch } from 'react-router-dom';

// views
import EditPostView from '../views/editpost.js';
import PostsView from '../views/posts.js';
import SettingsView from '../views/settings.js';
import NotFoundView from '../views/notfound.js';

// components
import DashboardMenu from '../components/DashboardMenu.js';

// styles
import dashboardStyle from '../../scss/dashboard.scss';


export default ({match}) => {
    /*********
     * VARS
     *********/

    /*********
     * HOOKS
     ********/

    /*********
     * HELPERS
     ********/

    /***********
     * RENDER
     **********/


    
    return (
      <div className={`container ${dashboardStyle.dashboard}`}>
        <DashboardMenu page={match.params.page} id={match.params.id} />
        <Switch>
          <Route path="/dashboard" exact component={PostsView} />
          <Route path="/dashboard/settings" component={SettingsView} />
          <Route path="/dashboard/add"  render={props => <EditPostView {...props} page="add" />} />
          <Route path="/dashboard/edit/:id" render={props => <EditPostView {...props} page="edit" />} />
          <Route component={NotFoundView} />
        </Switch>
      </div>
    );
};