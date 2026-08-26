import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import ReduxProvider from "./store/Providers";
import Routing from './Routing';
import AuthContext from './context/AuthContext';
import './css/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ReduxProvider>
      <AuthContext>
        <Routing />
      </AuthContext>
    </ReduxProvider>
  </StrictMode>,
)
