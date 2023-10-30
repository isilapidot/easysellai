import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

let reactHost = document.querySelector('#react-host');
if (!reactHost) {
  reactHost = document.createElement('div');
  reactHost.id = 'react-host';
  reactHost.style.position = 'fixed';
  reactHost.style.top = '0';
  reactHost.style.right = '0';
  reactHost.style.width = '25%';
  reactHost.style.height = '100vh';
  reactHost.style.overflow = 'auto';
  reactHost.style.zIndex = '1000';
  document.body.appendChild(reactHost);
}

createRoot(reactHost).render(<App />);