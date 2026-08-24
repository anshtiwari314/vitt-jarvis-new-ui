import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type MainPageWakeWordStatus = 'idle' | 'loading' | 'ready' | 'listening' | 'error'

type MainPageWakeWordContextValue = {
  status: MainPageWakeWordStatus
  setStatus: (status: MainPageWakeWordStatus) => void
}

const MainPageWakeWordContext = createContext<MainPageWakeWordContextValue>({
  status: 'idle',
  setStatus: () => {},
})

export function MainPageWakeWordProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MainPageWakeWordStatus>('idle')
  const value = useMemo(() => ({ status, setStatus }), [status])
  return (
    <MainPageWakeWordContext.Provider value={value}>{children}</MainPageWakeWordContext.Provider>
  )
}

export function useMainPageWakeWord() {
  return useContext(MainPageWakeWordContext)
}

/** True while mic is on but wake-word is not listening yet. */
export function isWakeWordModelLoading(
  micOn: boolean,
  status: MainPageWakeWordStatus
): boolean {
  return micOn && (status === 'idle' || status === 'loading' || status === 'ready')
}
