import { useEffect, useState } from 'react'
import { WakeWordDemoShell } from '../components/WakeWordDemoShell'
import { useDaVoiceWakeWord } from '../hooks/useDaVoiceWakeWord'

const LICENSE_STORAGE_KEY = 'davoice-license-key'

export default function DaVoiceWakeWordPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [threshold, setThreshold] = useState(0.85)
  const [licenseKey, setLicenseKey] = useState(() => localStorage.getItem(LICENSE_STORAGE_KEY) ?? '')

  useEffect(() => {
    localStorage.setItem(LICENSE_STORAGE_KEY, licenseKey)
  }, [licenseKey])

  const addLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 30))
  }

  const { status, error, lastDetection, startListening, stopListening } = useDaVoiceWakeWord({
    licenseKey,
    models: [{ modelToUse: 'need_help_now.onnx', threshold, bufferCount: 3 }],
    onDetection: ({ model, prediction }) => {
      addLog(`Detected "${model}" (score ${prediction.toFixed(3)})`)
    },
  })

  const isListening = status === 'listening'

  return (
    <WakeWordDemoShell
      title="DaVoice Wake Word Demo"
      subtitle={
        <>
          Uses <strong>web-wake-word</strong>. Demo model: say <strong>"need help now"</strong>.
          Requires a DaVoice license key from{' '}
          <a href="https://davoice.io" target="_blank" rel="noreferrer">
            davoice.io
          </a>
          .
        </>
      }
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
        <div><strong>Status:</strong> {status}</div>
        {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
      </div>

      <label style={{ display: 'block', marginBottom: 16 }}>
        DaVoice license key
        <input
          type="password"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste license key from DaVoice"
          style={{ width: '100%', marginTop: 8, padding: 8, boxSizing: 'border-box' }}
        />
      </label>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          disabled={status === 'loading' || status === 'listening' || !licenseKey.trim()}
          onClick={() => startListening()}
          style={{ padding: '10px 16px', cursor: 'pointer' }}
        >
          {status === 'loading' ? 'Loading models…' : 'Start Listening'}
        </button>
        <button
          type="button"
          disabled={!isListening}
          onClick={() => stopListening()}
          style={{ padding: '10px 16px', cursor: 'pointer' }}
        >
          Stop
        </button>
      </div>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Threshold: {threshold.toFixed(2)}
        <input
          type="range"
          min={0.5}
          max={0.99}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: '100%', marginTop: 8 }}
        />
      </label>

      {lastDetection && (
        <div style={{ marginBottom: 16, padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
          Last detection: <strong>{lastDetection.model}</strong> ({lastDetection.prediction.toFixed(3)})
        </div>
      )}

      <h3>Event log</h3>
      {logs.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: 14 }}>Detections will appear here.</p>
      ) : (
        <ul style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 20 }}>
          {logs.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </WakeWordDemoShell>
  )
}
