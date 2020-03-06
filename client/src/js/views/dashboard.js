import React, {useState, useEffect} from 'react';
import { Route, Switch } from 'react-router-dom';

// views
import EditPostView from '../views/editpost.js';
import PostsView from '../views/posts.js';
import SettingsView from '../views/settings.js';
import NotFoundView from '../views/notfound.js';

// services
import generalService from '../services/general.services.js';

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

    const [unsaved, setUnsaved] = useState(false);
    const [ignoreUnsavedChanges, setIgnoreUnsavedChanges] = useState(false);

    useEffect(() => {
      setUnsaved(false);
    }, [match])

    /*********
     * HELPERS
     ********/

     const onUnsavedChanges = (unsavedChanges) => {
      setUnsaved(unsavedChanges);
     };

     const onDiscardChanges = (e) => {
      e.preventDefault();
      setUnsaved(false);
      setIgnoreUnsavedChanges(true);
      generalService.notifySuccess('Discarded Changes, redirecting..');
      setTimeout(() => {
       window.location.href = '/dashboard';
      }, 1000);
     };

    /***********
     * RENDER
     **********/
    
    return (
      <div className={`container ${dashboardStyle.dashboard}`}>
        <DashboardMenu page={match.params.page} id={match.params.id} hasUnsavedChanges={unsaved} onDiscardChanges={onDiscardChanges} />
        <Switch>
          <Route path="/dashboard" exact component={PostsView} />
          <Route path="/dashboard/settings" component={SettingsView} />
          <Route path="/dashboard/add"  render={props => <EditPostView {...props} page="add"  />} />
          <Route path="/dashboard/edit/:id" render={props => <EditPostView {...props} page="edit" onUnsavedChanges={onUnsavedChanges} ignoreUnsavedChanges={ignoreUnsavedChanges} onDiscardChanges={onDiscardChanges} />} />
          <Route component={NotFoundView} />
        </Switch>
      </div>
    );
};