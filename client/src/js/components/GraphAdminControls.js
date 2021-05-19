// react / redux
import React, { useState } from 'react';
import {useDispatch} from 'react-redux';

// actions
import {updateGroupSettingsAction} from '../actions/group.actions.js';

// services
import GraphService from '../services/graph.services.js';
import GeneralService from '../services/general.services.js';

// components
import Input from '../components/Input.js';

// styles
import controlsStyle from '../../scss/graphAdminControls.scss';
import formStyle from '../../scss/_forms.scss';
export default ({ activeGroup }) => {
  /*********
   * VARS
   *********/
  
  const editableValues = [
    'velocityDecay2D',
    'velocityDecay3D'
  ];

  /*********
   * HOOKS
   ********/

  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();

  /***********
   * HELPERS
   **********/

  const handleInputChange = (val, name) => {
    // TODO if we start having non number settings, need to change
    if (typeof val === 'string' && val.trim() === "") {
      val = null;
    }
    if ((isNaN(val) && val !== null) || activeGroup.graphSettings[name] === val) {
      return false;
    }
    GeneralService.debounce('updateGraphSettings', () => {
      dispatch(updateGroupSettingsAction({
        id: activeGroup.id,
        graphSettings: {
          [name]: parseFloat(val)
        }
      })); 
    }, 1000);
  };


  /**********
   * RENDER *
   **********/


  return (
    <div className={controlsStyle.graphAdminControls}>
    {
      !expanded ? 
      <button className={formStyle.buttonLink}  onClick={() => setExpanded(true)}>
        Admin Controls
      </button> : 
      <div className={controlsStyle.graphAdminControlsInner}>
        {
        editableValues.map((key, index) => (
          <Input
            key={index}
            name={key}
            placeholder={`${key}: default ${GraphService.DEFAULTS[key]}`}
            initValue={activeGroup.graphSettings[key]}
            onChange={handleInputChange}
          ></Input>
        ))
        }
          <button className={formStyle.buttonLink} onClick={() => setExpanded(false)}>
            Close Admin Controls
          </button> 
      </div>
    }
    </div>
  )
}