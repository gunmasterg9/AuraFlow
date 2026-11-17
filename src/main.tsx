// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

console.log('[AuraFlow/renderer] React initialized and mounted successfully.');

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('[AuraFlow/renderer] Failed to find root element.');
}
