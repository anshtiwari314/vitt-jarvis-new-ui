import { utils } from '@ricky0123/vad-react'

const VAD_SPEECH_SAMPLE_RATE_HZ = 16000
const SHORT_CLIP_THRESHOLD_SEC = 3
const WHISPER_MODEL_ID = 'Xenova/whisper-tiny.en'
const YAMNET_MODEL_URL = 'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1'

let whisperPipelinePromise: Promise<any> | null = null
let tfPromise: Promise<any> | null = null
let yamnetModelPromise: Promise<any> | null = null
let remainingTimingLogs = 10
export const ENABLE_YAMNET_FILTER = false
export const ENABLE_WHISPER_SEMANTIC_FILTER = false

function getSpeechSegmentDurationSec(audio: Float32Array) {
  return audio.length / VAD_SPEECH_SAMPLE_RATE_HZ
}

export function getMetaDataOfSpeechSegment(audio: Float32Array) {
  if (!(audio instanceof Float32Array)) {
    console.warn('getMetaDataOfSpeechSegment: expected Float32Array', audio)
    return
  }

  const sampleRate = VAD_SPEECH_SAMPLE_RATE_HZ
  const sampleCount = audio.length
  const durationSec = sampleCount / sampleRate
  const pcmByteLength = audio.byteLength
  const wavBuffer = utils.encodeWAV(audio)
  const wavByteLength = wavBuffer.byteLength

  let min = Infinity
  let max = -Infinity
  let sumSq = 0
  for (let i = 0; i < audio.length; i++) {
    const v = audio[i]
    if (v < min) min = v
    if (v > max) max = v
    sumSq += v * v
  }
  const rms = audio.length > 0 ? Math.sqrt(sumSq / audio.length) : 0

  console.log('[speech segment metadata]', {
    sampleCount,
    sampleRateHz: sampleRate,
    channels: 1,
    durationSec: Number(durationSec.toFixed(4)),
    durationMs: Math.round(durationSec * 1000),
    pcmByteLength,
    wavByteLength,
    float32Min: Number(min.toFixed(6)),
    float32Max: Number(max.toFixed(6)),
    rms,
  })
}

async function getWhisperPipeline() {
  if (!whisperPipelinePromise) {
    whisperPipelinePromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers')
      env.allowLocalModels = false
      // Quantized Whisper is generally faster for short on-device inference.
      return pipeline('automatic-speech-recognition', WHISPER_MODEL_ID, { quantized: true })
    })()
  }
  return whisperPipelinePromise
}

async function getTfjs() {
  if (!tfPromise) {
    tfPromise = import('@tensorflow/tfjs')
  }
  return tfPromise
}

async function getYamnetModel() {
  if (!yamnetModelPromise) {
    yamnetModelPromise = (async () => {
      const tf = await getTfjs()
      return tf.loadGraphModel(YAMNET_MODEL_URL, { fromTFHub: true })
    })()
  }
  return yamnetModelPromise
}

function isSemanticFillerText(text: string) {
  const raw = text.toLowerCase().trim()
  const normalized = raw.replace(/[.,!?]/g, '')
  if (!normalized) return true

  // Hard guard requested: if transcript contains cough/throat, filter out.
  if (raw.includes('cough') || raw.includes('throat')) return true

  // Filter out cheering/crowd cheering style non-speech annotations.
  if (raw.includes('cheer') || raw.includes('cheering')) return true
  if (raw.includes('scream') || raw.includes('screaming')) return true
  if (raw.includes('buzz') || raw.includes('buzzing')) return true
  // Block common non-speech annotations that Whisper often emits.

  // Block non-speech music annotations like "(dramatic music)" or "[music]".
  if (
    raw.includes('[music]') ||
    raw.includes('(music)') ||
    raw.includes('dramatic music') ||
    /\(([^)]*music[^)]*)\)/.test(raw) ||
    /\[([^\]]*music[^\]]*)\]/.test(raw)
  ) {
    return true
  }

  // Block common non-speech ASR annotations.
  if (
    raw.includes('grunt') ||
    raw.includes('(grunts)') ||
    raw.includes('[inaudible]') ||
    raw.includes('inaudible') ||
    raw.includes('(laughing)') ||
    raw.includes('[laughing]') ||
    raw.includes('laughing') ||
    raw.includes('grunts')
  ) {
    return true
  }

  // Include user requested wording variants.
  if (
    raw.includes('[clear throat]') ||
    raw.includes('[clears throat]') ||
    raw.includes('[throat clearing]') ||
    raw.includes('[throat-clear]')
  ) {
    return true
  }

  const nonSpeechTags = [
    'cough', 'sneeze', 'breath', 'breathing', 'throat clear', 'throat clearing',
    'sniff', 'snort', 'wheeze', 'ahem', 'sigh', 'yawn', 'hiccup', 'cry', 'gasp',
    'lip smack', 'tongue click', 'swallow', 'gulp', 'teeth chatter'
  ]
  const nonSpeechTagPatterns = [
    /clear(s|ed|ing)?\s+throat/,
    /throat[\s-]?clear(s|ed|ing)?/
  ]
  const bracketTagMatch = raw.match(/\[([^\]]+)\]/g) || []
  const hasNonSpeechTag = bracketTagMatch.some((tag) =>
    nonSpeechTags.some((keyword) => tag.includes(keyword)) ||
    nonSpeechTagPatterns.some((pattern) => pattern.test(tag))
  )
  if (hasNonSpeechTag) return true

  const tokens = normalized.split(/\s+/).filter(Boolean)
  const fillerWords = new Set([
    'hmm', 'hm', 'mhm', 'uh', 'umm', 'um', 'ah', 'ugh', 'er', 'huh', 'eh',
    'mm', 'mmm', 'uhh', 'oh', 'argh', 'oof', 'phew', 'oops', 'whoops'
  ])
  const isSingleFiller = tokens.length <= 3 && tokens.every((token) => fillerWords.has(token))
  const isFillerPattern = /^(h+m+|m+h+m+|u+h+|u+m+|a+h+|u+g+h+|a+r+g+h+|o+f+|p+h+e+w+|o+o+p+s+|w+h+o+o+p+s+|e+r+|e+h+|m+)$/.test(normalized)
  return isSingleFiller || isFillerPattern
}

async function detectSemanticFillerWithWhisper(audio: Float32Array) {
  if (!ENABLE_WHISPER_SEMANTIC_FILTER) {
    return { isSemanticFiller: false, transcript: '' }
  }
  const asr = await getWhisperPipeline()
  const result = await asr(audio, {
    chunk_length_s: 30,
    stride_length_s: 5
  })
  const transcript = typeof result?.text === 'string' ? result.text : ''
  const isSemanticFiller = isSemanticFillerText(transcript)
  return { isSemanticFiller, transcript }
}

async function detectAcousticNoiseWithYamnet(audio: Float32Array) {
  const tf = await getTfjs()
  const model = await getYamnetModel()
  const waveform = tf.tensor(audio)
  let topClassIdx = -1
  let topScore = 0
  try {
    const [scores, embeddings, spectrogram] = model.predict(waveform)
    const meanScores = scores.mean(0)
    topClassIdx = meanScores.argMax().dataSync()[0]
    topScore = meanScores.max().dataSync()[0]
    tf.dispose([scores, embeddings, spectrogram, meanScores])
  } finally {
    waveform.dispose()
  }

  const blockedClasses = new Set([
    13, // Laughter
    11, // Screaming
    125, // Buzzing / Buzz
    21, 56, 57, 58, 59, 61, 64, 65, 66, 68, 69, 71, 73
  ])
  return { isAcousticNoise: blockedClasses.has(topClassIdx), topClassIdx, topScore }
}

export async function prewarmSpeechSegmentFilters() {
  const tasks: Promise<any>[] = []

  if (ENABLE_YAMNET_FILTER) {
    tasks.push(prewarmYamnetModel())
  }
  if (ENABLE_WHISPER_SEMANTIC_FILTER) {
    tasks.push(prewarmWhisperModel())
  }

  // Case: both disabled. Nothing should be downloaded.
  if (tasks.length === 0) return

  await Promise.all(tasks)
}

export async function prewarmYamnetModel() {
  if (!ENABLE_YAMNET_FILTER) return
  await getYamnetModel()
}

export async function prewarmWhisperModel() {
  if (!ENABLE_WHISPER_SEMANTIC_FILTER) return
  await getWhisperPipeline()
}

export async function shouldSkipSpeechSegment(audio: Float32Array) {
  const durationSec = getSpeechSegmentDurationSec(audio)
  if (durationSec >= SHORT_CLIP_THRESHOLD_SEC) {
    return {
      skip: false,
      reason: `duration_gte_${SHORT_CLIP_THRESHOLD_SEC}s_direct_send`,
      details: { durationSec: Number(durationSec.toFixed(3)) }
    }
  }

  // Case: both disabled => fallback to old logic (send to server).
  if (!ENABLE_YAMNET_FILTER && !ENABLE_WHISPER_SEMANTIC_FILTER) {
    return {
      skip: false,
      reason: 'short_segment_no_filters_enabled',
      details: { durationSec: Number(durationSec.toFixed(3)) }
    }
  }

  try {
    // Case 3: only Whisper enabled.
    if (!ENABLE_YAMNET_FILTER && ENABLE_WHISPER_SEMANTIC_FILTER) {
      const whisperStart = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const semanticResult = await detectSemanticFillerWithWhisper(audio)
      const whisperMs =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - whisperStart

      if (remainingTimingLogs > 0) {
        remainingTimingLogs -= 1
        console.log('[speech filter timing]', {
          durationSec: Number(durationSec.toFixed(3)),
          yamnetMs: 0,
          whisperMs: Math.round(whisperMs),
          verdict: semanticResult.isSemanticFiller ? 'semantic_filler' : 'clean_short_whisper'
        })
      }

      if (semanticResult.isSemanticFiller) {
        return {
          skip: true,
          reason: 'semantic_filler_detected_whisper',
          details: { ...semanticResult, durationSec: Number(durationSec.toFixed(3)) }
        }
      }

      return {
        skip: false,
        reason: 'short_segment_valid_speech_send',
        details: { ...semanticResult, durationSec: Number(durationSec.toFixed(3)) }
      }
    }

    // Case 4: only YAMNet enabled.
    if (ENABLE_YAMNET_FILTER && !ENABLE_WHISPER_SEMANTIC_FILTER) {
      const acousticStart = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const acousticResult = await detectAcousticNoiseWithYamnet(audio)
      const acousticMs =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - acousticStart

      if (remainingTimingLogs > 0) {
        remainingTimingLogs -= 1
        console.log('[speech filter timing]', {
          durationSec: Number(durationSec.toFixed(3)),
          yamnetMs: Math.round(acousticMs),
          whisperMs: 0,
          verdict: acousticResult.isAcousticNoise ? 'acoustic_noise' : 'clean_short_yamnet'
        })
      }

      if (acousticResult.isAcousticNoise) {
        return {
          skip: true,
          reason: 'acoustic_noise_detected_yamnet',
          details: { ...acousticResult, durationSec: Number(durationSec.toFixed(3)) }
        }
      }

      return {
        skip: false,
        reason: 'short_segment_valid_speech_send',
        details: { ...acousticResult, durationSec: Number(durationSec.toFixed(3)) }
      }
    }

    // Case 2 + Case 5: both enabled.
    // Concurrent execution + early reject on YAMNet result.
    const yamnetPromise = detectAcousticNoiseWithYamnet(audio)
    const whisperPromise = detectSemanticFillerWithWhisper(audio)

    const acousticStart = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const acousticResult = await yamnetPromise
    const acousticMs =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - acousticStart

    if (acousticResult.isAcousticNoise) {
      if (remainingTimingLogs > 0) {
        remainingTimingLogs -= 1
        console.log('[speech filter timing]', {
          durationSec: Number(durationSec.toFixed(3)),
          yamnetMs: Math.round(acousticMs),
          whisperMs: 0,
          verdict: 'acoustic_noise'
        })
      }

      // Early reject: do not wait for Whisper.
      return {
        skip: true,
        reason: 'acoustic_noise_detected_yamnet',
        details: { ...acousticResult, durationSec: Number(durationSec.toFixed(3)) }
      }
    }

    const semanticStart = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const semanticResult = await whisperPromise
    const semanticMs =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - semanticStart

    if (remainingTimingLogs > 0) {
      remainingTimingLogs -= 1
      console.log('[speech filter timing]', {
        durationSec: Number(durationSec.toFixed(3)),
        yamnetMs: Math.round(acousticMs),
        whisperMs: Math.round(semanticMs),
        verdict: semanticResult.isSemanticFiller ? 'semantic_filler' : 'clean_short_both'
      })
    }

    if (semanticResult.isSemanticFiller) {
      return {
        skip: true,
        reason: 'semantic_filler_detected_whisper',
        details: { ...semanticResult, durationSec: Number(durationSec.toFixed(3)) }
      }
    }

    return {
      skip: false,
      reason: 'short_segment_valid_speech_send',
      details: {
        ...acousticResult,
        ...semanticResult,
        durationSec: Number(durationSec.toFixed(3))
      }
    }
  } catch (err) {
    console.warn('speech filter model check failed, allowing audio', err)
    return { skip: false, reason: 'model_check_failed_allowing_audio', details: { durationSec: Number(durationSec.toFixed(3)) } }
  }
}
