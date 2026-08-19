declare module '../lib/openwakeword-wasm/WakeWordEngine.js' {
  export const MODEL_FILE_MAP: Record<string, string>

  export type WakeWordEngineOptions = {
    keywords?: string[]
    modelFiles?: Record<string, string>
    baseAssetUrl?: string
    workletUrl?: string
    frameSize?: number
    sampleRate?: number
    vadHangoverFrames?: number
    detectionThreshold?: number
    cooldownMs?: number
    executionProviders?: string[]
    embeddingWindowSize?: number
    debug?: boolean
  }

  export type DetectEvent = {
    keyword: string
    score: number
    at: number
  }

  export class WakeWordEngine {
    config: WakeWordEngineOptions & {
      keywords: string[]
      detectionThreshold: number
      cooldownMs: number
    }

    constructor(options?: WakeWordEngineOptions)
    on(event: 'score', handler: (payload: { keyword: string; score: number }) => void): () => void
    on(event: 'detect', handler: (payload: DetectEvent) => void): () => void
    on(event: 'ready' | 'speech-start' | 'speech-end', handler: () => void): () => void
    on(event: 'error', handler: (err: unknown) => void): () => void
    on(event: string, handler: (...args: unknown[]) => void): () => void
    off(event: string, handler: (...args: unknown[]) => void): void
    load(): Promise<void>
    start(options?: { deviceId?: string; gain?: number }): Promise<void>
    stop(): Promise<void>
    release(): Promise<void>
    readonly sampleRate: number | null
    setGain(value: number): void
    setActiveKeywords(keywords: string[]): void
    runWav(buffer: ArrayBuffer): Promise<number>
  }

  export default WakeWordEngine
}
