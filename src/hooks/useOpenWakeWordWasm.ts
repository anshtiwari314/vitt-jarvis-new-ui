import { useCallback, useEffect, useRef, useState } from 'react'
import WakeWordEngine from '../lib/openwakeword-wasm/WakeWordEngine.js'

interface UseOpenWakeWordWasmOptions {
  keywords?: string[]
  threshold?: number
  cooldownMs?: number
  onDetection?: (e: { keyword: string; score: number }) => void
}

type Status = 'idle' | 'loading' | 'ready' | 'listening' | 'error'

const BASE_ASSET_URL = '/openwakeword/models'

let activeEngine: WakeWordEngine | null = null
let activeReleasePromise: Promise<void> | null = null

async function disposeActiveEngine() {
  if (!activeEngine) return
  const engine = activeEngine
  activeEngine = null
  await engine.release()
}

export function useOpenWakeWordWasm({
  keywords = ['hey_jarvis'],
  threshold = 0.5,
  cooldownMs = 2000,
  onDetection,
}: UseOpenWakeWordWasmOptions = {}) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<{ keyword: string; score: number } | null>(null)
  const [speechActive, setSpeechActive] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [sampleRate, setSampleRate] = useState<number | null>(null)

  const engineRef = useRef<WakeWordEngine | null>(null)
  const unsubsRef = useRef<Array<() => void>>([])
  const onDetectionRef = useRef(onDetection)
  const keywordsKey = keywords.join(',')

  onDetectionRef.current = onDetection

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.config.detectionThreshold = threshold
      engineRef.current.config.cooldownMs = cooldownMs
    }
  }, [threshold, cooldownMs])

  const attachListeners = useCallback((engine: WakeWordEngine) => {
    for (const unsub of unsubsRef.current) unsub()
    unsubsRef.current = [
      engine.on('speech-start', () => setSpeechActive(true)),
      engine.on('speech-end', () => setSpeechActive(false)),
      engine.on('score', ({ keyword, score }) => {
        setScores((prev) => ({ ...prev, [keyword]: score }))
      }),
      engine.on('detect', ({ keyword, score }) => {
        const event = { keyword, score }
        setLastDetection(event)
        onDetectionRef.current?.(event)
      }),
      engine.on('error', (err) => {
        console.error('OpenWakeWord WASM error:', err)
        setError(err instanceof Error ? err.message : 'Wake word engine error')
      }),
    ]
  }, [])

  const ensureEngine = useCallback(async () => {
    if (activeReleasePromise) {
      await activeReleasePromise
    }

    if (engineRef.current) {
      engineRef.current.config.detectionThreshold = threshold
      engineRef.current.config.cooldownMs = cooldownMs
      return engineRef.current
    }

    if (activeEngine) {
      engineRef.current = activeEngine
      attachListeners(activeEngine)
      return activeEngine
    }

    const engine = new WakeWordEngine({
      baseAssetUrl: BASE_ASSET_URL,
      keywords,
      detectionThreshold: threshold,
      cooldownMs,
    })

    attachListeners(engine)
    await engine.load()
    activeEngine = engine
    engineRef.current = engine
    return engine
  }, [attachListeners, cooldownMs, keywords, threshold])

  useEffect(() => {
    return () => {
      for (const unsub of unsubsRef.current) unsub()
      unsubsRef.current = []

      const engine = engineRef.current
      engineRef.current = null
      if (!engine) return

      activeReleasePromise = (async () => {
        await engine.stop()
        if (activeEngine === engine) {
          await disposeActiveEngine()
        }
        activeReleasePromise = null
      })()
    }
  }, [keywordsKey])

  const startListening = useCallback(async () => {
    try {
      setStatus('loading')
      setError(null)
      const engine = await ensureEngine()
      engine.config.detectionThreshold = threshold
      await engine.start()
      setSampleRate(engine.sampleRate)
      setStatus('listening')
    } catch (err: unknown) {
      console.error('OpenWakeWord WASM start failed:', err)
      setStatus(engineRef.current ? 'ready' : 'error')
      setError(err instanceof Error ? err.message : 'Failed to start wake word engine')
    }
  }, [ensureEngine, threshold])

  const stopListening = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return

    try {
      await engine.stop()
      setSpeechActive(false)
      setSampleRate(null)
      setScores({})
      setStatus('ready')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to stop listening')
    }
  }, [])

  return {
    status,
    error,
    lastDetection,
    speechActive,
    scores,
    sampleRate,
    startListening,
    stopListening,
  }
}
