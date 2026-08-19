import React,{ StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import ReduxProvider from "./store/Providers";
import Routing from './Routing';
import AuthContext from './context/AuthContext';
import { registerSW } from 'virtual:pwa-register'

if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log('New version available')
    },
    onOfflineReady() {
      console.log('App ready for offline use')
    },
  })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ReduxProvider>
      <AuthContext>
        <Routing/>
      </AuthContext>
    </ReduxProvider>
  </StrictMode>,
)
