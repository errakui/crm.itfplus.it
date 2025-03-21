import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Aggiungo un handler globale per gli errori di ResizeObserver
const originalConsoleError = console.error;
console.error = function(msg, ...args) {
  if (typeof msg === 'string' && msg.includes('ResizeObserver loop')) {
    // Ignora gli errori di ResizeObserver loop
    return;
  }
  originalConsoleError(msg, ...args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // Rimuovo StrictMode che può causare doppi render e problemi con ResizeObserver
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
