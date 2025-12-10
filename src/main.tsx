import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
import ReduxProvider from "./store/Providers";
import Routing from './Routing';
import AuthContext from './context/AuthContext';
 
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReduxProvider>
      <AuthContext>
        <Routing/>
        {/* <App/> */}
      </AuthContext>
    </ReduxProvider>
  </React.StrictMode>,
)


