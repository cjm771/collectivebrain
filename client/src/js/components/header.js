import React from 'react';
import { useSelector } from 'react-redux';
import Gravatar from 'react-gravatar';

import classNames from 'classnames';
import headerStyle from '../../scss/header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faHome, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default () => {
  const user = useSelector(state => state.user);
  return (
    <div className = {headerStyle.header}>
      <div className = {headerStyle.left}>
        <h2><a href='/'>collectivebrain</a></h2>
      </div>
      <div className = {headerStyle.right}>
        { (user && user.loggedIn)  ? (
            <span className={classNames("dropdown", headerStyle.authDropdown)}>
              <span data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <Gravatar email={user.email} className={headerStyle.profileImage} /> {user.name}
                <FontAwesomeIcon icon={faChevronDown}  className={headerStyle.chevron} />
              </span>
              <div className={classNames("dropdown-menu dropdown-menu-right", headerStyle.dropdownMenu)} aria-labelledby="dropdownMenuButton">
                  <div className={headerStyle.dropdownMenuArrow}></div>
                  <a className="dropdown-item" href="/">
                    <FontAwesomeIcon icon={faHome} />
                    <span>Home</span>
                  </a>
                  <a className="dropdown-item" href="/dashboard">
                    <FontAwesomeIcon icon={faCog} />
                    <span>Dashboard</span>
                  </a>
                  <a className="dropdown-item" href="/logout">
                    <FontAwesomeIcon icon={faSignOutAlt} /> 
                    <span>Logout</span>
                  </a>
                </div>
            </span>
          ) : (user ? (
            <ul className = {headerStyle.unauthItems}>
              <li><a href='/login'>login</a></li>
              <li><a href='/register'>register</a></li>
            </ul>
          ) : (
            ''
          ))
        }
      </div>
    </div> 
  )
};