import { useEffect } from 'react'
import { useWakeWord } from '../hooks/useWakeWord'

/** Minimum threshold — same as WakeWord demo slider min. */
const WAKE_WORD_THRESHOLD = 0.3

/**
 * OpenWakeWord on main page — independent of the mic toggle.
 * Starts listening as soon as models are ready. Does not load OWW's own Silero VAD.
 */
export default function MainPageWakeWordListener() {
  const { status, startListening } = useWakeWord({
    wakewordModels: ['hey_jarvis'],
    threshold: WAKE_WORD_THRESHOLD,
    onDetection: (e) => {
      console.log('[wake-word] detected:', e.label, e.score)
    },
  })

  useEffect(() => {
    if (status === 'ready') {
      void startListening()
    }
  }, [status, startListening])

  return null
}
