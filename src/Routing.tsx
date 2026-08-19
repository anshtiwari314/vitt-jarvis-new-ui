
import { Suspense, useEffect } from 'react';

import PrivateRoute from './components/PrivateRoute'
import GlobalRoute from './components/GlobalRoute'
import {HashRouter as Router ,Routes,Route} from 'react-router-dom'
import { useAuth } from './context/AuthContext';
import {v4 as uuidv4} from 'uuid'
import { ErrorBoundary } from './components/ErrorBoundary'
import {
  LazyLogin2,
  LazyLeadDashboard,
  LazyMainPageRoute,
  LazyWakeWordPage,
  LazyOpenWakeWordWasmPage,
  LazyDaVoiceWakeWordPage,
  LazyPorcupineWakeWordPage,
  LazyErrorPage,
} from './routes/lazyRoutes'

function RouteFallback() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#111' }}>
      Loading…
    </div>
  )
}

export default function RenderChildren(){
  
  const {currentUser, setCurrentUser,isAuthenticated,setIsAuthenticated}= useAuth()
  

  useEffect(()=>{
  try {
    const raw = localStorage.getItem('insurance-auth')
    const insuranceAuthKey = raw ? JSON.parse(raw) : null
    if(insuranceAuthKey && insuranceAuthKey.userid){
      setCurrentUser({userid:insuranceAuthKey.userid,sessionuid:uuidv4()})
    }
  } catch (e) {
    console.warn('Failed to parse insurance-auth from localStorage', e)
  }
  setIsAuthenticated(true)
  },[]) 

  if(!isAuthenticated){
    return <RouteFallback />
  }
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* @ts-ignore */}
            <Route path='/' element={<GlobalRoute component={<LazyLogin2/>}/>}/>
            {/* @ts-ignore */}
            <Route path='/lead-management' element={<PrivateRoute component={<LazyLeadDashboard/>}/>}/>
            {/* @ts-ignore */}
            <Route path='/mainpage' element={<PrivateRoute component={<LazyMainPageRoute/>}/>}/>
            <Route path="/wakeword" element={
              <ErrorBoundary fallback={
                <div style={{ padding: 24, color: '#111' }}>Wake word page failed to load.</div>
              }>
                <LazyWakeWordPage />
              </ErrorBoundary>
            } />
            <Route path="/wakeword-wasm" element={
              <ErrorBoundary fallback={
                <div style={{ padding: 24, color: '#111' }}>OpenWakeWord WASM page failed to load.</div>
              }>
                <LazyOpenWakeWordWasmPage />
              </ErrorBoundary>
            } />
            <Route path="/wakeword-davoice" element={
              <ErrorBoundary fallback={
                <div style={{ padding: 24, color: '#111' }}>DaVoice wake word page failed to load.</div>
              }>
                <LazyDaVoiceWakeWordPage />
              </ErrorBoundary>
            } />
            <Route path="/wakeword-porcupine" element={
              <ErrorBoundary fallback={
                <div style={{ padding: 24, color: '#111' }}>Porcupine wake word page failed to load.</div>
              }>
                <LazyPorcupineWakeWordPage />
              </ErrorBoundary>
            } />
            <Route path='*' element={<LazyErrorPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}
