/**
 * ORT shim for vendored openwakeword + @ricky0123/vad-web.
 * Uses the self-contained WASM bundle from node_modules (do not set wasmPaths to /public).
 */
import ortImport from '../../node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs'

const ort = ortImport.default ?? ortImport

try {
  ort.env.wasm.numThreads = 1
} catch (_) {}

export const InferenceSession = ort.InferenceSession
export const Tensor = ort.Tensor
export const env = ort.env
export const registerBackend = ort.registerBackend
export default ort
