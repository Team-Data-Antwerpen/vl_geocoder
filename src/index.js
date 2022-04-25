import React from 'react';

import * as ReactDOMClient from 'react-dom/client';
import './index.css';
import App from './components/App/App';

navigator.serviceWorker.register(
    new URL('service-worker.js', import.meta.url),
    {type: 'module'}
  );

const root = ReactDOMClient.createRoot( document.getElementById('root') );
root.render(<App />);
