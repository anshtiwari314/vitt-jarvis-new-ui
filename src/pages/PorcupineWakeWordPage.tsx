import { useEffect, useState } from 'react'
import { BuiltInKeyword } from '@picovoice/porcupine-web'
import { WakeWordDemoShell } from '../components/WakeWordDemoShell'
import { usePorcupineWakeWord } from '../hooks/usePorcupineWakeWord'

const ACCESS_KEY_STORAGE = 'picovoice-access-key'

export default function PorcupineWakeWordPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [accessKey, setAccessKey] = useState(() => localStorage.getItem(ACCESS_KEY_STORAGE) ?? '')
  const [sensitivity, setSensitivity] = useState(0.5)

  useEffect(() => {
    localStorage.setItem(ACCESS_KEY_STORAGE, accessKey)
  }, [accessKey])

  const addLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 30))
  }

  const { status, error, lastDetection, startListening, stopListening } = usePorcupineWakeWord({
    accessKey,
    keyword: BuiltInKeyword.Jarvis,
    sensitivity,
    onDetection: ({ label, index }) => {
      addLog(`Detected "${label}" (index ${index})`)
    },
  })

  const isListening = status === 'listening'

  return (
    <WakeWordDemoShell
      title="Porcupine — Jarvis"
      subtitle={
        <>
          Detects the word <strong>&quot;jarvis&quot;</strong> only (built-in Porcupine keyword).
          Requires a free AccessKey from{' '}
          <a href="https://console.picovoice.ai/" target="_blank" rel="noreferrer">
            Picovoice Console
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
        Picovoice AccessKey
        <input
          type="password"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          placeholder="Paste AccessKey from console.picovoice.ai"
          style={{ width: '100%', marginTop: 8, padding: 8, boxSizing: 'border-box' }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Sensitivity: {sensitivity.toFixed(2)}
        <input
          type="range"
          min={0.3}
          max={0.9}
          step={0.05}
          value={sensitivity}
          onChange={(e) => setSensitivity(Number(e.target.value))}
          disabled={isListening}
          style={{ width: '100%', marginTop: 8 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          disabled={status === 'loading' || status === 'listening' || !accessKey.trim()}
          onClick={() => startListening()}
          style={{ padding: '10px 16px', cursor: 'pointer' }}
        >
          {status === 'loading' ? 'Loading Porcupine…' : 'Start Listening'}
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

      {!isListening && status === 'ready' && (
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Engine ready. Press Start and say <strong>jarvis</strong>.
        </p>
      )}

      {lastDetection && (
        <div style={{ marginBottom: 16, padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
          Last detection: <strong>{lastDetection.label}</strong> (index {lastDetection.index})
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
