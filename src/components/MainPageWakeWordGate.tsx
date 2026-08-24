import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

const MainPageWakeWordListener = lazy(() => import('./MainPageWakeWordListener'))

/** Loads wake-word listener on main page — independent of mic state. */
export default function MainPageWakeWordGate() {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <MainPageWakeWordListener />
      </Suspense>
    </ErrorBoundary>
  )
}
