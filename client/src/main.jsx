import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css'; // without this the map tiles render scrambled
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Toasts styled to match the design system (white card, slate border, theme colours)
const toastOptions = {
  duration: 3500,
  style: {
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    boxShadow: '0 10px 15px -3px rgb(15 23 42 / 0.08)',
  },
  success: { iconTheme: { primary: '#059669', secondary: '#ffffff' } },
  error: { iconTheme: { primary: '#e11d48', secondary: '#ffffff' } },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Opt in to React Router v7 behaviour early (also silences console warnings) */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        {/* top offset keeps toasts below the sticky navbar; zIndex above it */}
        <Toaster position="top-right" toastOptions={toastOptions} containerStyle={{ top: 76, zIndex: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
