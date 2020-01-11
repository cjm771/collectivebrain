import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

import AsyncHandlerStyle from '../../scss/asyncHandler.scss';

export default ({ processing, error, children }) => {
  
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  }

  return processing ? (
    <div className={AsyncHandlerStyle.processing}>
      <h1>Please wait</h1>
      <p>
        <FontAwesomeIcon icon={faSpinner} spin /> Loading..
      </p>
    </div>
  ) : error ? (
    <div className={AsyncHandlerStyle.error}>
      <h1>Error</h1>
      <p>An error ocurred. Please try again and if problem persists, please contact admin.
        <span className={AsyncHandlerStyle.moreInfo} onClick={handleClick}>
        More info 
        {!expanded ? 
          <FontAwesomeIcon icon={faCaretRight}></FontAwesomeIcon> :
          <FontAwesomeIcon icon={faCaretDown}></FontAwesomeIcon>
        }
        </span>
        
        
      </p>
      { 
        expanded ? (
          <pre>
            {error}
          </pre>
        ): ''
      }
    </div>
  ) : (
    children
  );
};
