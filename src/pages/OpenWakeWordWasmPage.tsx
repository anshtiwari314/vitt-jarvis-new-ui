import { useState } from 'react'
import { WakeWordDemoShell } from '../components/WakeWordDemoShell'
import { useOpenWakeWordWasm } from '../hooks/useOpenWakeWordWasm'

export default function OpenWakeWordWasmPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [threshold, setThreshold] = useState(0.45)

  const addLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 30))
  }

  const {
    status,
    error,
    lastDetection,
    speechActive,
    scores,
    sampleRate,
    startListening,
    stopListening,
  } = useOpenWakeWordWasm({
    keywords: ['hey_jarvis'],
    threshold,
    onDetection: ({ keyword, score }) => {
      addLog(`Detected "${keyword}" (score ${score.toFixed(2)})`)
    },
  })

  const isListening = status === 'listening'
  const heyJarvisScore = scores.hey_jarvis ?? 0
  const canStart = status === 'idle' || status === 'ready' || status === 'error'

  return (
    <WakeWordDemoShell
      title="OpenWakeWord WASM Demo"
      subtitle={
        <>
          Uses <strong>openwakeword-wasm-browser</strong>. Pretrained model: say <strong>&quot;hey jarvis&quot;</strong>{' '}
          (for &quot;jarvis&quot; alone, use the Porcupine tab).
        </>
      }
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
        <div><strong>Status:</strong> {status}</div>
        {sampleRate != null && <div style={{ marginTop: 4 }}>Mic context rate: {sampleRate} Hz (resampled to 16 kHz)</div>}
        {isListening && (
          <div style={{ marginTop: 4 }}>
            VAD: {speechActive ? 'speech detected' : 'silence'}
          </div>
        )}
        {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          disabled={!canStart || status === 'loading'}
          onClick={() => startListening()}
          style={{ padding: '10px 16px', cursor: canStart ? 'pointer' : 'not-allowed' }}
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
          min={0.25}
          max={0.9}
          step={0.05}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: '100%', marginTop: 8 }}
        />
      </label>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>hey_jarvis</strong> score: {heyJarvisScore.toFixed(3)}
        </div>
        <div
          style={{
            height: 12,
            background: '#e2e8f0',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, heyJarvisScore * 100)}%`,
              background: heyJarvisScore >= threshold ? '#16a34a' : '#0284c7',
              transition: 'width 80ms linear',
            }}
          />
        </div>
        {isListening && heyJarvisScore < 0.05 && speechActive && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
            VAD hears speech but score is low — speak clearly: &quot;hey jarvis&quot;.
          </p>
        )}
        {isListening && !speechActive && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
            Wake word only triggers while VAD shows speech. Say &quot;hey jarvis&quot; now.
          </p>
        )}
      </div>

      {!isListening && status === 'idle' && (
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Press Start Listening to load ONNX models and open the mic.
        </p>
      )}

      {!isListening && status === 'ready' && (
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Stopped. Press Start Listening again to reopen the mic.
        </p>
      )}

      {lastDetection && (
        <div style={{ marginBottom: 16, padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
          Last detection: <strong>{lastDetection.keyword}</strong> ({lastDetection.score.toFixed(2)})
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
