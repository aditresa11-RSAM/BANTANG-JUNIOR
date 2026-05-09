import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress known harmless video playback abortion errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.name === 'AbortError' && event.reason.message && event.reason.message.includes('play() request was interrupted')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
