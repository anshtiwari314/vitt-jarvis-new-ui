/**
 * ORT shim for vendored openwakeword.
 * Prefers window.ort (CDN on /#/mainpage for VAD) when available; otherwise bundled WASM.
 */
import ortImport from '../../node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs'

function getOrtRuntime() {
  const g = globalThis
  if (g.ort?.InferenceSession?.create) {
    try {
      g.ort.env.wasm.numThreads = 1
    } catch (_) {}
    return g.ort
  }
  const bundled = ortImport.default ?? ortImport
  try {
    bundled.env.wasm.numThreads = 1
  } catch (_) {}
  return bundled
}

export const InferenceSession = new Proxy(
  {},
  {
    get(_, prop) {
      const IS = getOrtRuntime().InferenceSession
      const val = IS[prop]
      return typeof val === 'function' ? val.bind(IS) : val
    },
  }
)

export const Tensor = new Proxy(
  function Tensor() {},
  {
    construct(_, args) {
      return new (getOrtRuntime().Tensor)(...args)
    },
    apply(_, __, args) {
      return new (getOrtRuntime().Tensor)(...args)
    },
  }
)

export const env = new Proxy(
  {},
  {
    get(_, prop) {
      const envObj = getOrtRuntime().env
      const val = envObj[prop]
      if (typeof val === 'object' && val !== null) {
        return new Proxy(val, {
          get(target, p) {
            const v = target[p]
            return typeof v === 'function' ? v.bind(target) : v
          },
          set(target, p, value) {
            target[p] = value
            return true
          },
        })
      }
      return val
    },
    set(_, prop, value) {
      getOrtRuntime().env[prop] = value
      return true
    },
  }
)

export function registerBackend(...args) {
  return getOrtRuntime().registerBackend(...args)
}

export default new Proxy(
  {},
  {
    get(_, prop) {
      if (prop === 'InferenceSession') return InferenceSession
      if (prop === 'Tensor') return Tensor
      if (prop === 'env') return env
      const ort = getOrtRuntime()
      const val = ort[prop]
      return typeof val === 'function' ? val.bind(ort) : val
    },
  }
)
