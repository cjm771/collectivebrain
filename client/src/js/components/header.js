// react / redux
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

// resources
import Gravatar from 'react-gravatar';

// styles
import classNames from 'classnames';
import headerStyle from '../../scss/header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faHome, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default (props) => {
  const location = useLocation();

  useEffect(() => {
    if (shouldBeFixed(location.pathname)) {
      document.querySelector('body').classList.add('fixed');
    } else {
      document.querySelector('body').classList.remove('fixed');
    }
  }, [location.pathname]);

  const user = useSelector(state => state.user);

  const shouldBeFixed = (path) => {
    const FIXED_ROUTES = [
      /^\/$/,
      /^\/g\//,
      /^\/login/,
      /^\/register/,
    ];
    let makeFixed = false;
    FIXED_ROUTES.forEach((routeRegex) => {
      if (routeRegex.test(path)) {
        makeFixed = true;
      }
    });
    return makeFixed;
  };

  return (
    <div className={`${headerStyle.header} ${shouldBeFixed(location.pathname) ? headerStyle.fixed : ''}`}>
      <div className={headerStyle.left}>
        <h2><a href={user.activeGroup ? `/g/${user.activeGroup.name}` : '/'}>collective<b>BRAIN</b></a></h2>
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
                  <a className="dropdown-item" href={user.activeGroup ? `/g/${user.activeGroup.name}` : '/'}>
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

              <li><Link to='/login'>login</Link></li>
              <li><Link to='/register'>register</Link></li>
            </ul>
          ) : (
            ''
          ))
        }
      </div>
    </div> 
  )
};