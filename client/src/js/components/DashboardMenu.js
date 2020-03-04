import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import {Link} from 'react-router-dom';

// styles
import dashboardMenuStyle from '../../scss/dashboardMenu.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';


export default ({id, page, hasUnsavedChanges, onDiscardChanges}) => {

  /***********
   * HELPERS *
   ***********/

    /**
   * updates the breadcrumbs on the screen
   * @param {String=null} title name of title optional to add to breadcrumbs
   */
  const updateBreadCrumbs = (title = null, hasUnsavedChanges) => {
    const editSettings = [
      <Link to='/dashboard' className={hasUnsavedChanges ? dashboardMenuStyle.disabledLink : ''}>Posts</Link>,
      'Edit Post'
    ];
    if (title) {
      editSettings.push(title);
    }
    return {
      'add': [
      <Link to='/dashboard'  className={hasUnsavedChanges ? dashboardMenuStyle.disabledLink : ''}>Posts</Link>,
        'New Post'
      ],
      'edit': editSettings
    }
  }


  /*********
   * HOOKS *
   *********/

  const postData = useSelector((state) => {
    return state.posts
  });

  const [pageBreadCrumbData, setPageBreadCrumbData] = useState(updateBreadCrumbs(null, hasUnsavedChanges));
  useEffect(() => {
    
    if (postData.activeItem && page === 'edit') {
      setPageBreadCrumbData(updateBreadCrumbs(postData.activeItem.title, hasUnsavedChanges));
    }
  }, [postData, hasUnsavedChanges]);


  return (
    <div className={dashboardMenuStyle.dashboard}>
      <ul className={dashboardMenuStyle.dashboardMenu}>
        <li className={!page || ['add', 'edit'].indexOf(page) !== -1 ? dashboardMenuStyle.active : ''}>
          <Link to='/dashboard/'  className={hasUnsavedChanges ? dashboardMenuStyle.disabledLink : ''}>Posts</Link>
        </li>
        <li className={page === 'settings' ? dashboardMenuStyle.active : ''}>
          <Link to='/dashboard/settings'  className={hasUnsavedChanges ? dashboardMenuStyle.disabledLink : ''}>Settings</Link>
        </li>
      </ul>
      {
        pageBreadCrumbData && pageBreadCrumbData[page] ? (
          <ul className={dashboardMenuStyle.breadCrumbs}>
          {
            pageBreadCrumbData[page].map((crumb, index) => {
              return (
                <li key={index}>{ crumb }
                {
                  index < pageBreadCrumbData[page].length - 1 ? 
                  <FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon>
                  :
                  ''
                }
                </li>
              )
            })
          }
        </ul>
        ) : ''
      }
      {
        hasUnsavedChanges ? <div className={dashboardMenuStyle.warningBox}>Unsaved changes! Make sure to save before leaving. Or click here to <a href='/dashboard' onClick={onDiscardChanges}>discard changes</a>.</div> : ''
      }
    </div>
  )
}