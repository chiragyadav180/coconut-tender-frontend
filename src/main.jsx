// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';  // Import AuthProvider
import './index.css';
import App from './App.jsx';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
      <AuthProvider>  
        <App />
      </AuthProvider>
    </BrowserRouter>

);
