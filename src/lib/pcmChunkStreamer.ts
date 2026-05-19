const DEFAULT_TARGET_SAMPLE_RATE = 16000
const DEFAULT_CHUNK_SIZE_BYTES = 8000

function concatUint8Arrays(a: Uint8Array, b: Uint8Array) {
  const merged = new Uint8Array(a.length + b.length)
  merged.set(a, 0)
  merged.set(b, a.length)
  return merged
}

function downsampleFloat32Buffer(input: Float32Array, inputSampleRate: number, outputSampleRate: number) {
  if (inputSampleRate === outputSampleRate) {
    return input
  }

  if (outputSampleRate > inputSampleRate) {
    throw new Error("Output sample rate must be less than or equal to input sample rate.")
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate
  const outputLength = Math.round(input.length / sampleRateRatio)
  const output = new Float32Array(outputLength)

  let outputIndex = 0
  let inputIndex = 0

  while (outputIndex < outputLength) {
    const nextInputIndex = Math.round((outputIndex + 1) * sampleRateRatio)
    let accumulated = 0
    let sampleCount = 0

    for (let i = inputIndex; i < nextInputIndex && i < input.length; i += 1) {
      accumulated += input[i] ?? 0
      sampleCount += 1
    }

    output[outputIndex] = sampleCount > 0 ? accumulated / sampleCount : 0
    outputIndex += 1
    inputIndex = nextInputIndex
  }

  return output
}

function float32ToPcm16Bytes(input: Float32Array) {
  const buffer = new ArrayBuffer(input.length * 2)
  const view = new DataView(buffer)

  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i] ?? 0))
    const pcmValue = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    view.setInt16(i * 2, pcmValue, true)
  }

  return new Uint8Array(buffer)
}

function uint8ArrayToBase64(bytes: Uint8Array) {
  let binary = ""
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

export function encodeFloat32ToPcm16Base64Chunks(
  input: Float32Array,
  options?: {
    inputSampleRate?: number
    outputSampleRate?: number
    chunkSizeBytes?: number
  }
) {
  const inputSampleRate = options?.inputSampleRate ?? DEFAULT_TARGET_SAMPLE_RATE
  const outputSampleRate = options?.outputSampleRate ?? DEFAULT_TARGET_SAMPLE_RATE
  const chunkSizeBytes = options?.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE_BYTES

  const downsampled =
    inputSampleRate === outputSampleRate
      ? input
      : downsampleFloat32Buffer(input, inputSampleRate, outputSampleRate)

  const pcmBytes = float32ToPcm16Bytes(downsampled)
  const chunks: string[] = []

  for (let offset = 0; offset < pcmBytes.length; offset += chunkSizeBytes) {
    const chunk = pcmBytes.subarray(offset, Math.min(offset + chunkSizeBytes, pcmBytes.length))
    chunks.push(uint8ArrayToBase64(chunk))
  }

  return chunks
}

export function createPcmChunkStreamer(options: {
  stream: MediaStream
  onChunk: (chunkBase64: string, meta: { byteLength: number; isFinal: boolean }) => void | Promise<void>
  onError?: (error: unknown) => void
  outputSampleRate?: number
  chunkSizeBytes?: number
}) {
  const outputSampleRate = options.outputSampleRate ?? DEFAULT_TARGET_SAMPLE_RATE
  const chunkSizeBytes = options.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE_BYTES
  const audioContext = new AudioContext()
  const source = audioContext.createMediaStreamSource(options.stream)
  const processor = audioContext.createScriptProcessor(4096, 1, 1)
  const silentGain = audioContext.createGain()
  silentGain.gain.value = 0

  let pendingBytes = new Uint8Array(0)
  let isStopped = false

  async function emitChunk(bytes: Uint8Array, isFinal: boolean) {
    if (bytes.length === 0) return
    await options.onChunk(uint8ArrayToBase64(bytes), {
      byteLength: bytes.length,
      isFinal,
    })
  }

  processor.onaudioprocess = async (event) => {
    if (isStopped) return

    try {
      const input = event.inputBuffer.getChannelData(0)
      const downsampled = downsampleFloat32Buffer(input, audioContext.sampleRate, outputSampleRate)
      const pcmBytes = float32ToPcm16Bytes(downsampled)
      pendingBytes = concatUint8Arrays(pendingBytes, pcmBytes)

      while (pendingBytes.length >= chunkSizeBytes) {
        const nextChunk = pendingBytes.slice(0, chunkSizeBytes)
        pendingBytes = pendingBytes.slice(chunkSizeBytes)
        await emitChunk(nextChunk, false)
      }
    } catch (error) {
      options.onError?.(error)
    }
  }

  source.connect(processor)
  processor.connect(silentGain)
  silentGain.connect(audioContext.destination)

  return {
    async stop() {
      if (isStopped) return
      isStopped = true

      processor.disconnect()
      source.disconnect()
      silentGain.disconnect()

      if (pendingBytes.length > 0) {
        await emitChunk(pendingBytes, true)
        pendingBytes = new Uint8Array(0)
      }

      await audioContext.close()
    },
  }
}
