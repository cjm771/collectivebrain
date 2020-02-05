import React from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export default  ({children, tooltipId, tooltipText}) => {
  return (
    <OverlayTrigger overlay={<Tooltip id={"tooltip-" + tooltipId}>{tooltipText }</Tooltip>}>
      { children }
    </OverlayTrigger>
  )
};