import { useCallback, useEffect, useRef, useState } from 'react'

interface UseWakeWordOptions {
  /** When false, models are not loaded (e.g. mic off on main page). */
  enabled?: boolean
  wakewordModels?: string[]
  threshold?: number
  onDetection?: (e: { label: string; score: number }) => void
  onUtterance?: (e: { label: string; audio: Int16Array }) => void
}

type Status = 'idle' | 'loading' | 'ready' | 'listening' | 'error'

export function useWakeWord({
  enabled = true,
  wakewordModels = ['hey_jarvis'],
  threshold = 0.5,
  onDetection,
  onUtterance,
}: UseWakeWordOptions = {}) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<{ label: string; score: number } | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [sampleRate, setSampleRate] = useState<number | null>(null)
  const [frameCount, setFrameCount] = useState(0)

  const owwRef = useRef<any>(null)
  const micRef = useRef<any>(null)
  const MicrophoneRef = useRef<any>(null)
  const thresholdRef = useRef(threshold)
  const onDetectionRef = useRef(onDetection)
  const onUtteranceRef = useRef(onUtterance)
  const modelsKey = wakewordModels.join(',')

  thresholdRef.current = threshold
  onDetectionRef.current = onDetection
  onUtteranceRef.current = onUtterance

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false

    async function loadModels() {
      try {
        setStatus('loading')
        setError(null)

        const { OpenWakeWord, configureOrt } = await import('../lib/openwakeword/openwakeword.js')
        const { Microphone } = await import('../lib/openwakeword/microphone.js')

        configureOrt({ numThreads: 1 })

        const oww = await OpenWakeWord.create({
          baseUrl: '/openwakeword/models/',
          wakewordModels,
          threshold: thresholdRef.current,
          ort: { numThreads: 1 },
          onDetection: (e: { label: string; score: number }) => {
            setLastDetection(e)
            onDetectionRef.current?.(e)
          },
          onUtterance: onUtteranceRef.current
            ? (e: { label: string; audio: Int16Array }) => onUtteranceRef.current!(e)
            : undefined,
        })

        if (cancelled) {
          oww.reset()
          return
        }

        owwRef.current = oww
        MicrophoneRef.current = Microphone
        setStatus('ready')
      } catch (err: unknown) {
        console.error('Wake word model load failed:', err)
        if (!cancelled) {
          setStatus('error')
          setError(err instanceof Error ? err.message : 'Failed to load wake word models')
        }
      }
    }

    loadModels()

    return () => {
      cancelled = true
      micRef.current?.stop?.()
      micRef.current = null
      owwRef.current?.reset?.()
      owwRef.current = null
      MicrophoneRef.current = null
      setStatus('idle')
      setScores({})
      setSampleRate(null)
      setFrameCount(0)
    }
  }, [modelsKey, enabled])

  useEffect(() => {
    if (owwRef.current) {
      owwRef.current.threshold = threshold
    }
  }, [threshold])

  const stopListening = useCallback(async () => {
    await micRef.current?.stop?.()
    micRef.current = null
    setSampleRate(null)
    setFrameCount(0)
    if (owwRef.current) {
      await owwRef.current.reset?.()
      setStatus('ready')
    } else {
      setStatus('idle')
    }
  }, [])

  const startListening = useCallback(async () => {
    const oww = owwRef.current
    const Microphone = MicrophoneRef.current
    if (!oww || !Microphone) {
      setError('Models not loaded yet — wait for status "ready"')
      return
    }

    try {
      setError(null)
      oww.threshold = thresholdRef.current
      oww.onDetection = (e: { label: string; score: number }) => {
        setLastDetection(e)
        onDetectionRef.current?.(e)
      }
      if (onUtteranceRef.current) {
        oww.onUtterance = (e: { label: string; audio: Int16Array }) =>
          onUtteranceRef.current!(e)
      }

      await micRef.current?.stop?.()

      const mic = new Microphone(
        async (frame: Int16Array) => {
          const result = await oww.predict(frame)
          setScores(result)
          setFrameCount((n) => n + 1)
        },
        { workletUrl: '/openwakeword/mic-worklet.js' },
      )

      await mic.start()
      micRef.current = mic
      setSampleRate(mic.sampleRate)
      setStatus('listening')
    } catch (err: unknown) {
      console.error('Wake word mic start failed:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Microphone failed to start')
    }
  }, [])

  return {
    status,
    error,
    lastDetection,
    scores,
    sampleRate,
    frameCount,
    startListening,
    stopListening,
  }
}
