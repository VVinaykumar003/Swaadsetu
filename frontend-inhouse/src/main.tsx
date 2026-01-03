
// main.tsx or index.tsx (Vite/CRA)
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { BrowserRouter } from 'react-router-dom';  // Add this import back
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>   {/*// Add StrictMode */}
    <HelmetProvider>
      <BrowserRouter>  {/* // ✅ Wrap App in router (for useNavigate) */}
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

