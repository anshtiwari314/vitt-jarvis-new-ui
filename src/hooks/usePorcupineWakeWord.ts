import { useCallback, useEffect, useRef, useState } from 'react'
import { BuiltInKeyword, PorcupineWorker } from '@picovoice/porcupine-web'
import { WebVoiceProcessor } from '@picovoice/web-voice-processor'

interface UsePorcupineWakeWordOptions {
  accessKey?: string
  keyword?: BuiltInKeyword
  sensitivity?: number
  onDetection?: (e: { label: string; index: number }) => void
}

type Status = 'idle' | 'loading' | 'ready' | 'listening' | 'error'

const PORCUPINE_MODEL = { publicPath: '/porcupine/porcupine_params.pv' }

export function usePorcupineWakeWord({
  accessKey = '',
  keyword = BuiltInKeyword.Jarvis,
  sensitivity = 0.5,
  onDetection,
}: UsePorcupineWakeWordOptions = {}) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<{ label: string; index: number } | null>(null)

  const porcupineRef = useRef<PorcupineWorker | null>(null)
  const onDetectionRef = useRef(onDetection)
  const accessKeyRef = useRef(accessKey)
  const configKey = `${accessKey}|${keyword}|${sensitivity}`

  onDetectionRef.current = onDetection
  accessKeyRef.current = accessKey

  useEffect(() => {
    let cancelled = false

    async function initPorcupine() {
      if (!accessKeyRef.current.trim()) {
        setStatus('ready')
        setError('Enter a Picovoice AccessKey to start.')
        return
      }

      try {
        setStatus('loading')
        setError(null)

        if (porcupineRef.current) {
          await WebVoiceProcessor.unsubscribe(porcupineRef.current).catch(() => {})
          porcupineRef.current.terminate()
          porcupineRef.current = null
        }

        const porcupine = await PorcupineWorker.create(
          accessKeyRef.current.trim(),
          [{ builtin: keyword, sensitivity }],
          (detection) => {
            setLastDetection(detection)
            onDetectionRef.current?.(detection)
          },
          PORCUPINE_MODEL,
          {
            processErrorCallback: (err) => {
              console.error('Porcupine process error:', err)
              setError(err.message)
            },
          }
        )

        if (cancelled) {
          porcupine.terminate()
          return
        }

        porcupineRef.current = porcupine
        setStatus('ready')
      } catch (err: unknown) {
        console.error('Porcupine init failed:', err)
        if (!cancelled) {
          setStatus('error')
          setError(err instanceof Error ? err.message : 'Failed to initialize Porcupine')
        }
      }
    }

    initPorcupine()

    return () => {
      cancelled = true
      const porcupine = porcupineRef.current
      if (porcupine) {
        WebVoiceProcessor.unsubscribe(porcupine).catch(() => {})
        porcupine.release().catch(() => {})
        porcupine.terminate()
        porcupineRef.current = null
      }
      setStatus('idle')
    }
  }, [configKey, keyword, sensitivity])

  const startListening = useCallback(async () => {
    const porcupine = porcupineRef.current
    if (!porcupine) {
      setError('Porcupine not ready — check AccessKey and reload.')
      return
    }

    try {
      setError(null)
      await WebVoiceProcessor.subscribe(porcupine)
      setStatus('listening')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to start microphone')
    }
  }, [])

  const stopListening = useCallback(async () => {
    const porcupine = porcupineRef.current
    if (!porcupine) return

    try {
      await WebVoiceProcessor.unsubscribe(porcupine)
      setStatus('ready')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to stop listening')
    }
  }, [])

  return {
    status,
    error,
    lastDetection,
    startListening,
    stopListening,
  }
}
