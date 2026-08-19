import { useEffect } from 'react'
import { useMainPageWakeWord } from '../context/MainPageWakeWordContext'
import { useVad } from '../context/VadWrapper'
import { useWakeWord } from '../hooks/useWakeWord'
import { playRandomAudioFromDir } from '../lib/playRandomAudio'

/** Minimum threshold — same as WakeWord demo slider min. */
const WAKE_WORD_THRESHOLD = 0.3

/**
 * OpenWakeWord (OWW Web) on main page — runs only while mic icon is active.
 * On detection, plays a random file from public/audio/.
 */
export default function MainPageWakeWordListener() {
  const { manualVadStatus } = useVad() as { manualVadStatus: boolean }
  const { setStatus: setWakeWordContextStatus } = useMainPageWakeWord()

  const { status, startListening, stopListening } = useWakeWord({
    wakewordModels: ['hey_jarvis'],
    threshold: WAKE_WORD_THRESHOLD,
    onDetection: () => {
      void playRandomAudioFromDir()
    },
  })

  useEffect(() => {
    setWakeWordContextStatus(status)
  }, [status, setWakeWordContextStatus])

  useEffect(() => {
    return () => setWakeWordContextStatus('idle')
  }, [setWakeWordContextStatus])

  useEffect(() => {
    if (!manualVadStatus) {
      void stopListening()
      return
    }
    if (status === 'ready') {
      void startListening()
    }
  }, [manualVadStatus, status, startListening, stopListening])

  return null
}
