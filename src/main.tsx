/**
 * @file The main entry point for the SovereigntyOS AI Lab React application.
 * This file is responsible for initializing the React root and rendering the
 * main `App` component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * The root DOM element where the React application will be mounted.
 * It's fetched from the `index.html` file.
 * @type {HTMLElement}
 */
const root = document.getElementById('root');
if (!root) {
  throw new Error(
    'Fatal Error: The root element with ID "root" was not found in the DOM. ' +
    'The application cannot be mounted.'
  );
}

/**
 * Creates the React root using the new concurrent rendering API and renders the application.
 * `React.StrictMode` is enabled to activate additional checks and warnings for its descendants,
 * helping to identify potential problems in the application during development.
 */
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);