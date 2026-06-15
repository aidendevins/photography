import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './Admin';
import Privacy from './Privacy';
import Hidden from './Hidden';
import './index.css';

function Root() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/admin') return <Admin />;
  if (path === '/privacy') return <Privacy />;
  if (path === '/hidden') return <Hidden />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
);
