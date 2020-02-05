import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import {Link} from 'react-router-dom';

// styles
import dashboardMenuStyle from '../../scss/dashboardMenu.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';


export default ({id, page}) => {


  /***********
   * HELPERS *
   ***********/

    /**
   * updates the breadcrumbs on the screen
   * @param {String=null} title name of title optional to add to breadcrumbs
   */
  const updateBreadCrumbs = (title = null) => {
    const editSettings = [
      <Link to='/dashboard'>Posts</Link>,
      'Edit Post'
    ];
    if (title) {
      editSettings.push(title);
    }
    return {
      'add': [
      <Link to='/dashboard'>Posts</Link>,
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

  const [pageBreadCrumbData, setPageBreadCrumbData] = useState(updateBreadCrumbs());
  useEffect(() => {
    
    if (postData.activeItem && page === 'edit') {
      setPageBreadCrumbData(updateBreadCrumbs(postData.activeItem.title));
    }
  }, [postData]);


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