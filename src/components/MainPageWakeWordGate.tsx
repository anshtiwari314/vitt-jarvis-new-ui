import { lazy, Suspense } from 'react'
import { useVad } from '../context/VadWrapper'
import { ErrorBoundary } from './ErrorBoundary'

const MainPageWakeWordListener = lazy(() => import('./MainPageWakeWordListener'))

/**
 * Loads wake-word code only while mic is active — avoids ORT/VAD conflict on page load.
 */
export default function MainPageWakeWordGate() {
  const { manualVadStatus } = useVad() as { manualVadStatus: boolean }

  if (!manualVadStatus) {
    return null
  }

  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <MainPageWakeWordListener />
      </Suspense>
    </ErrorBoundary>
  )
}
