import React from 'react';
export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>This is a webpack/babel/react app boilerplate2</h1>
        <p>If using webpack-dev-server, Editing any sinnnnnngle portion of this and saving will automatically
        rebundle this bad boy</p>
      </div>
    );
  }
};