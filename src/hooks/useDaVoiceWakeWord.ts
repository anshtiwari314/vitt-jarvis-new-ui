import { useCallback, useEffect, useRef, useState } from 'react'
import { KeywordDetector, type ModelParam } from 'web-wake-word'

const MODELS_PATH = '/davoice/models/'
const WASM_PATH = '/davoice/wasm/'
const WORKLET_PATH = '/davoice/audio-worklet-processor.js'

interface UseDaVoiceWakeWordOptions {
  models?: Array<Pick<ModelParam, 'modelToUse' | 'threshold' | 'bufferCount'>>
  licenseKey?: string
  onDetection?: (e: { model: string; prediction: number; cntBuf: number }) => void
}

type Status = 'idle' | 'loading' | 'ready' | 'listening' | 'error'

export function useDaVoiceWakeWord({
  models = [{ modelToUse: 'need_help_now.onnx', threshold: 0.85, bufferCount: 3 }],
  licenseKey = '',
  onDetection,
}: UseDaVoiceWakeWordOptions = {}) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<{ model: string; prediction: number } | null>(null)

  const detectorRef = useRef<KeywordDetector | null>(null)
  const onDetectionRef = useRef(onDetection)
  const licenseKeyRef = useRef(licenseKey)
  const modelsKey = models.map((m) => `${m.modelToUse}:${m.threshold}:${m.bufferCount}`).join('|')

  onDetectionRef.current = onDetection
  licenseKeyRef.current = licenseKey

  useEffect(() => {
    let cancelled = false

    async function initDetector() {
      if (!licenseKeyRef.current.trim()) {
        setStatus('ready')
        setError('Enter a DaVoice license key to start.')
        return
      }

      try {
        setStatus('loading')
        setError(null)

        const modelParams: ModelParam[] = models.map((model) => ({
          ...model,
          onKeywordDetected: (result) => {
            const event = {
              model: result.model,
              prediction: result.prediction,
              cntBuf: result.cntBuf,
            }
            setLastDetection({ model: event.model, prediction: event.prediction })
            onDetectionRef.current?.(event)
          },
        }))

        const detector = new KeywordDetector(MODELS_PATH, modelParams, WASM_PATH, WORKLET_PATH)
        const licensed = await detector.setLicense(licenseKeyRef.current.trim())
        if (!licensed) {
          throw new Error('Invalid or expired DaVoice license key')
        }

        await detector.init()

        if (cancelled) {
          detector.stopListening()
          return
        }

        detectorRef.current = detector
        setStatus('ready')
      } catch (err: unknown) {
        console.error('DaVoice init failed:', err)
        if (!cancelled) {
          setStatus('error')
          setError(err instanceof Error ? err.message : 'Failed to initialize DaVoice')
        }
      }
    }

    initDetector()

    return () => {
      cancelled = true
      detectorRef.current?.stopListening()
      detectorRef.current = null
      setStatus('idle')
    }
  }, [modelsKey, licenseKey])

  const startListening = useCallback(() => {
    const detector = detectorRef.current
    if (!detector) {
      setError('Detector not ready — check license key and reload.')
      return
    }

    try {
      setError(null)
      detector.startListening()
      setStatus('listening')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to start microphone')
    }
  }, [])

  const stopListening = useCallback(() => {
    detectorRef.current?.stopListening()
    if (detectorRef.current) {
      setStatus('ready')
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
