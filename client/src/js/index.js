import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/App.js';


// redux
import { createStore, compose, applyMiddleware } from 'redux';
import allReducer from './reducers/index.js';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancers = composeEnhancers(applyMiddleware(thunk));

const store = createStore(
  allReducer, 
  {},
  enhancers 
);

const app = ReactDOM.render(
    <Provider store={store}>
      <App/>
    </Provider>
, document.getElementById("app"));