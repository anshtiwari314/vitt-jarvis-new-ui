import { lazy } from 'react'

export const LazyLogin2 = lazy(() => import('../pages/Login2'))
export const LazyLeadDashboard = lazy(() =>
  import('../pages/LeadDashboard').then((m) => ({ default: m.LeadDashboard }))
)
export const LazyMainPageRoute = lazy(() => import('./MainPageRoute'))
export const LazyWakeWordPage = lazy(() => import('../pages/WakeWordPage'))
export const LazyOpenWakeWordWasmPage = lazy(() => import('../pages/OpenWakeWordWasmPage'))
export const LazyDaVoiceWakeWordPage = lazy(() => import('../pages/DaVoiceWakeWordPage'))
export const LazyPorcupineWakeWordPage = lazy(() => import('../pages/PorcupineWakeWordPage'))
export const LazyErrorPage = lazy(() => import('../pages/ErrorPage'))
