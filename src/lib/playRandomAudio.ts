const MANIFEST_URL = '/audio/manifest.json'
const AUDIO_BASE = '/audio/'
const PLAYBACK_COOLDOWN_MS = 2500
const DEFAULT_AUDIO_FILES = ['wake-chime-1.wav', 'wake-chime-2.wav', 'wake-chime-3.wav']

let manifestPromise: Promise<string[]> | null = null
let lastPlayedAt = 0
let currentAudio: HTMLAudioElement | null = null

function playFallbackBeep(): boolean {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
    osc.onended = () => void ctx.close()
    return true
  } catch {
    return false
  }
}

async function loadAudioManifest(): Promise<string[]> {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`manifest ${res.status}`)
        return res.json()
      })
      .then((data: { files?: string[] }) => {
        const listed = Array.isArray(data.files) ? data.files.filter(Boolean) : []
        return listed.length > 0 ? listed : DEFAULT_AUDIO_FILES
      })
      .catch((err) => {
        console.warn('[playRandomAudio] Failed to load manifest, using defaults:', err)
        return DEFAULT_AUDIO_FILES
      })
  }
  return manifestPromise
}

/** Pick and play a random clip from `public/audio/` (listed in manifest.json). */
export async function playRandomAudioFromDir(): Promise<string | null> {
  const now = Date.now()
  if (now - lastPlayedAt < PLAYBACK_COOLDOWN_MS) {
    return null
  }

  const files = await loadAudioManifest()
  if (files.length === 0) {
    lastPlayedAt = now
    playFallbackBeep()
    return null
  }

  const pick = files[Math.floor(Math.random() * files.length)]!
  const url = pick.startsWith('/') ? pick : `${AUDIO_BASE}${pick}`

  try {
    currentAudio?.pause()
    const audio = new Audio(url)
    currentAudio = audio
    lastPlayedAt = now
    await audio.play()
    return url
  } catch (err) {
    console.warn('[playRandomAudio] Playback failed:', url, err)
    return null
  }
}
