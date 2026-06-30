import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/sw.js')
      .then((registration) => {
        console.log('Cozy Sheets Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('Cozy Sheets Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
