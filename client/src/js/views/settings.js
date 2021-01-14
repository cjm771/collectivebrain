// react / redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addInviteAction, 
  changeUserThemeAction, 
  getUserSettingsAction, 
  resendInviteAction, 
  clearResendInviteAction, 
  updateActiveGroupAction 
} from '../actions/user.actions.js';
import { getGroupsAction } from '../actions/group.actions.js';
import { clearPostsAction } from '../actions/posts.actions.js';

// resources
import axios from 'axios';
import uuidv4 from 'uuid/v4';
import copy from 'copy-to-clipboard';

// services
import UserService from '../services/users.services.js';
import GeneralService from '../services/general.services.js';

// components
import SimpleForm from '../components/SimpleForm.js';
import Tooltipify from '../components/Tooltipify.js';
import Input from '../components/Input.js';

// styles
import settingsStyle from '../../scss/settings.scss';
import formStyle from '../../scss/_forms.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBan, faCopy, faRedo, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';

export default () => {
  /*************
   *   VARS    *
   *************/
  
  /*************
   *   HOOKS   *
   *************/

  const userData = useSelector((state) => { 
    return state.user;
  });
  const groupsData = useSelector((state) => {
    state.groups.options = {};
    state.groups.items.forEach((option) => {
      state.groups.options[option.name] = option.id;
    });
    return state.groups;
  });

  const themeOptions = {
    'karry': 'karry',
    'dark': 'dark',
    'light': 'light',
  };
  const [inviteMode, setInviteMode] = useState(false);
  const [invitableRoles, setInvitableRoles] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserSettingsAction());
    dispatch(getGroupsAction());
  }, []);

  useEffect(() => {
    if (userData.resendInvite) {
      if (userData.resendInvite.success) {
        GeneralService.notifySuccess('Successfully resent invitation');
        dispatch(clearResendInviteAction());
      } else if (userData.resendInvite.error) {
        GeneralService.notifyError(userData.resendInvite.error);
        dispatch(clearResendInviteAction());
      }
    }
  }, [userData.resendInvite]);

  useEffect(() => {
    if (userData && userData.userSettings) {
      const _invitableRoles = {};
      userData.userSettings.canInvite.forEach((roleIndex) => {
        _invitableRoles[UserService.getRoleName(roleIndex)] = roleIndex;
      })
      setInvitableRoles(_invitableRoles);
    }
  }, [userData.userSettings]);

  /*************
   *  HELPERS  *
   *************/

  const toggleInviteMode = () => {
    setInviteMode(!inviteMode);
  };

  const resendInvite = (token) => {
    dispatch(resendInviteAction({token}));
  };

  const copyToClipboard = (text) => {
    copy(text);
    GeneralService.notifyInfo('Invite url copied to clipboard!');
  };

  const handleInvitedSuccess = () => {
    setInviteMode(false);
    GeneralService.notifySuccess('Successfully invited!');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleThemeChange = (theme) => {
    if (theme) {
      axios.get( `/?theme=${theme}&cb=${uuidv4()}`);
      dispatch(changeUserThemeAction(theme));
      // hacky for now
      let $body = document.querySelector('body');
      $body.className = '';
      $body.classList.add(`theme-${theme}`);
    }
  }

  const handleGroupsChange = (groupId) => {
    if (!userData.activeGroup || (userData.activeGroup.id !== groupId)) {
      dispatch(updateActiveGroupAction({activeGroup: groupId}));
      dispatch(clearPostsAction());
    }
  };

  /*************
   *  RENDER   *
  *************/
  
    const RoleBadge = ({role}) => {
      const badgeType = role  === 0 ? 'badge-secondary' : (role  === 1 ? 'badge-success' : 'badge-danger');
      return (
        <span className={`badge ${badgeType}`}>
          { role  === 0 ? 'user' : (role  === 1 ? 'moderator' : 'admin') }
        </span>
      )
    }

    const GroupBadge = ({group}) => {
      return (!group ? '' : 
        <span className={`badge badge-light`}>&nbsp;
          <FontAwesomeIcon icon={faUsers} />&nbsp;
          { group }
        </span> 
      )
    }

    const InviteStatus = ({status}) => {
      const statusClass = status  === 0 ? settingsStyle.inviteStatusInvited : (status  === 1 ? settingsStyle.inviteStatusAccepted : settingsStyle.inviteStatusRemoved);
      return (
        <span className={statusClass}>
          { status === 0 ? 'invited' : (status  === 1 ? 'accepted' : 'removed') }
        </span>
      )
    }

    return (
      <div  className={settingsStyle.settings}>
        {/* group section */}
        <div>
          <h5>Active Group</h5>
          {
            groupsData && groupsData.items.length ? 
            <Input 
              type="dropdown"
              name="group"
              onChange={handleGroupsChange}
              options={groupsData.options}
              disabled={userData.role !== 2}
              initValue={(userData.activeGroup && userData.activeGroup.id) || groupsData.items[0].id}
            ></Input> :
            ''
          }
        </div>
        {/* you section */}
        <div className={settingsStyle.youSection}>
          <h5> You <RoleBadge role={userData.role} /><i className={settingsStyle.note}> Editing Coming Soon</i></h5>
          {
          userData ? 
              <SimpleForm 
                hideSubmit={true}
                fields={ {
                  name: { type: 'text', initValue: userData.name, disabled: true  },
                  email: { type: 'text', initValue: userData.email, disabled: true },
                  password: { type: 'password', initValue: 'password', disabled: true }
                } }
              /> :
              ''
          }
        </div>
        {/*  invites section  */}
        <div className={settingsStyle.inviteSection}>
          { userData.role > 0 ||  (userData.userSettings && userData.userSettings.invites && userData.userSettings.invites.length)  ? 
            <h5> 
              Invites {userData.userSettings && userData.userSettings.invites && userData.userSettings.invites.length ? `(${userData.userSettings.invites.length})` : ''}
              {
                userData.role > 0 ? 
                  <button onClick={toggleInviteMode} className={`${formStyle.buttonLink} ${settingsStyle.inviteUserButton}`}>
                  <FontAwesomeIcon icon={inviteMode ? faBan : faPlus} /> {inviteMode ? 'Cancel Invitation' : 'Invite User'}
                  </button> :
                ''
              }
            </h5> : 
            ''
          }
          {/* new invite */}
          {
            inviteMode && userData.role > 0 ? 
              <div className={settingsStyle.newInvite}>
                <SimpleForm 
                  action={addInviteAction}
                  processing={userData.inviteProcessing}
                  error={userData.inviteError}
                  errorFields={userData.inviteErrorFields}
                  submitted={userData.invited}
                  ctaButtonText={'invite'}
                  ctaButtonProcessingText={'inviting..'}
                  onSubmit={handleInvitedSuccess}
                  fields={ {
                    name: { type: 'text', errorFieldName: 'metaData.name' },
                    email: { type: 'text', errorFieldName: 'metaData.email' },
                    role: {
                      type: 'dropdown',
                      errorFieldName: 'metaData.role',
                      options: invitableRoles,
                      cast: Number,
                      initValue: invitableRoles ? invitableRoles[Object.keys(invitableRoles)[0]] : '',
                    },
                    group: {
                      type: 'dropdown',
                      errorFieldName: 'metaData.group',
                      options: groupsData.options,
                      disabled: userData.role !== 2,
                      initValue: (userData.activeGroup && userData.activeGroup.id) || groupsData.items[0].id
                    }
                  } }
                />
              </div>
              :
              ''
          }
          {/* existing invites */}
          { userData.userSettings && userData.userSettings.invites && userData.userSettings.invites.length ?  
            <div className={settingsStyle.invites}>{
              userData.userSettings.invites.map((invite, index) => (
                  <div className={settingsStyle.invite}  key={index}>
                    <div className={settingsStyle.colUser}>

                      <span className={settingsStyle.name}>
                        { invite.metaData.user ? (
                          <span>
                            <b>{invite.metaData.user.name}</b>
                            <i> ({invite.metaData.user.email})</i>
                          </span>
                        ) : (
                          <span>
                          <b>{invite.metaData.name || invite.metaData.email}</b>
                          <i>{(invite.metaData.email && invite.metaData.name) ?  ` (${invite.metaData.email})` : ''}</i>
                        </span>
                        )}
                      </span>
                      <GroupBadge group={(invite.metaData.group && invite.metaData.group.name) || null} />&nbsp;
                      <RoleBadge role={invite.metaData.role} />
                      {
                        invite.status === UserService.INVITE_STATUS.INVITED ? 
                        <span>
                          <span className={settingsStyle.actionIcon} onClick={(e) => copyToClipboard(invite.url)}>
                            <Tooltipify tooltipId='' tooltipText='copy invite url'>
                              <FontAwesomeIcon icon={faCopy} />
                            </Tooltipify>
                          </span>
                          { userData.resendInvite && userData.resendInvite.processing ? 
                          (<span className={`${settingsStyle.actionIcon} ${settingsStyle.persist}`}>
                              <FontAwesomeIcon icon={faSpinner} />
                          </span>) : (
                          <span className={settingsStyle.actionIcon} onClick={(e) => resendInvite(invite.token)}>
                            <Tooltipify tooltipId='' tooltipText='resend'>
                              <FontAwesomeIcon icon={faRedo} />
                            </Tooltipify>
                          </span>
                          )}
                        </span>
                        : 
                        ''
                      }
                    </div>
                    <div className={settingsStyle.colStatus}>
                      <InviteStatus status={invite.status} />
                    </div>
                  </div>
              ))
            }</div>
            : ''
          }
        </div>
        {/* theme section */}
        <div className={settingsStyle.themeSection}>
          <h5> Change Theme </h5>
          <div className={formStyle.form}>
            <Input 
              type="dropdown"
              name="theme"
              onChange={handleThemeChange}
              options={themeOptions}
              initValue={(userData && userData.theme) || themeOptions[0]}
            ></Input>
          </div>
        </div>
      </div>
    );
};