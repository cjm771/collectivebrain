import React from 'react';

// styles
import notFoundStyle from '../../scss/notFound.scss';

export default () => {
    return (
      <div className={notFoundStyle.notFound}>
        <div>
          <h1>Not Found</h1>
          <p>Sorry this page was not found.</p>
        </div>
      </div>
    );
};