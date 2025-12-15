import React from 'react'
import ReactDOM from 'react-dom/client'
import "./main.css"
import App from './App'
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
import ReduxProvider from "./store/Providers";
import MobileMeetingApp from './pages/MobileMeetingPage';
import DataWrapper from './context/DataWrapper';
import { VadWrapper } from './context/VadWrapper';
import AuthContext from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReduxProvider>
      <App/>
    {/* <AuthContext>
      <DataWrapper>

                <VadWrapper>
                  <MobileMeetingApp/>
                </VadWrapper> 
              </DataWrapper>
      </AuthContext> */}
    </ReduxProvider>

    
    
  </React.StrictMode>,
)
