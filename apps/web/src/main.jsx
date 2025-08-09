import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'
import { AuthProvider } from './context/AuthContext.jsx'; 

if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(
      <AuthProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </AuthProvider>
    );
  }
}