import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import './index.css';

window.our = `~${window.ship}`;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('app')
);
