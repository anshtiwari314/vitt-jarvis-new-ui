import { config } from '../configuration.js'

export type AnamTtsChunk =
  | { type: 'audio'; chunk: string }
  | { type: 'end' }
  | { type: 'error'; message?: string }

export type AnamTtsStreamOptions = {
  text: string
  languageCode?: string
  speaker?: string
  pace?: number
  signal?: AbortSignal
  onChunk: (chunk: AnamTtsChunk) => void
}

const DEFAULT_TTS_STREAM_URL = config.ttsStreamUrl

export async function streamAnamTts({
  text,
  languageCode = 'en-IN',
  speaker = 'shruti',
  pace = 1.2,
  signal,
  onChunk,
}: AnamTtsStreamOptions): Promise<void> {
  const response = await fetch(DEFAULT_TTS_STREAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      language_code: languageCode,
      speaker,
      pace,
    }),
    signal,
  })

  if (!response.ok) {
    let detail = `TTS request failed with ${response.status}`
    try {
      const payload = await response.json()
      detail = payload?.detail || detail
    } catch {
      // ignore parse errors
    }
    throw new Error(detail)
  }

  if (!response.body) {
    throw new Error('TTS response body is missing')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6)) as AnamTtsChunk
        onChunk(data)
      } catch {
        // ignore partial SSE frames
      }
    }
  }
}
