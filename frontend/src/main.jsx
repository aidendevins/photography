import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './Admin';
import Privacy from './Privacy';
import './index.css';

function Root() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/admin') return <Admin />;
  if (path === '/privacy') return <Privacy />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
);
