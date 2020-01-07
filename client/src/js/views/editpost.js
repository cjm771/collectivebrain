import React from 'react';

export default ({ match, page }) => {
  return (
    <div>
      <h1>{page} post</h1>
      <p>This is the {page} post page for.. {match.params.id}</p>
    </div>
  );
};
