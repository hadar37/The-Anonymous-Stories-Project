

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // מביא את App שמכיל את AuthProvider ו-MainApp

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);