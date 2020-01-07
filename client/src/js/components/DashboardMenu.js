import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import dashboardMenuStyle from '../../scss/dashboardMenu.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';


export default ({id, page}) => {
  
  const [pageBreadCrumbData, setPageBreadCrumbData] = useState({
    'add': [
    <Link to='/dashboard'>Posts</Link>,
      'New Post'
    ],
    'edit': [
      <Link to='/dashboard'>Posts</Link>,
      'Edit Post'
    ] 
  });

  return (
    <div className={dashboardMenuStyle.dashboard}>
      <ul className={dashboardMenuStyle.dashboardMenu}>
        <li className={!page || ['add', 'edit'].indexOf(page) !== -1 ? dashboardMenuStyle.active : ''}>
          <Link to='/dashboard/'>Posts</Link>
        </li>
        <li className={page === 'settings' ? dashboardMenuStyle.active : ''}>
          <Link to='/dashboard/settings'>Settings</Link>
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
    </div>
  )
}