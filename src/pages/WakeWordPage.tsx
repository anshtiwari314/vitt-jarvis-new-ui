import { useState } from 'react'
import { WakeWordDemoShell } from '../components/WakeWordDemoShell'
import { useWakeWord } from '../hooks/useWakeWord'

export default function WakeWordPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [threshold, setThreshold] = useState(0.5)

  const addLog = (msg: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev].slice(0, 30))
  }

  const {
    status,
    error,
    lastDetection,
    scores,
    sampleRate,
    frameCount,
    startListening,
    stopListening,
  } = useWakeWord({
    wakewordModels: ['hey_jarvis'],
    threshold,
    onDetection: ({ label, score }) => {
      addLog(`Detected "${label}" (score ${score.toFixed(2)})`)
    },
    onUtterance: ({ label, audio }) => {
      const seconds = (audio.length / 16000).toFixed(1)
      addLog(`Utterance after "${label}": ${seconds}s captured`)
    },
  })

  const heyJarvisScore = scores.hey_jarvis ?? 0
  const isListening = status === 'listening'

  return (
    <WakeWordDemoShell
      title="OpenWakeWord Web Demo"
      subtitle={
        <>
          Uses <strong>openwakeword-web</strong>. Pretrained model: say <strong>&quot;hey jarvis&quot;</strong>{' '}
          (not &quot;jarvis&quot; alone — use the Porcupine tab for that).
        </>
      }
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
        <div><strong>Status:</strong> {status}</div>
        {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
        {sampleRate != null && <div style={{ marginTop: 4 }}>Mic sample rate: {sampleRate} Hz</div>}
        {isListening && <div style={{ marginTop: 4 }}>Frames processed: {frameCount}</div>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          disabled={status === 'loading' || status === 'listening'}
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
          min={0.3}
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
        {!isListening && status === 'ready' && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
            Models loaded. Press Start Listening to open the mic — the score bar will move when audio is detected.
          </p>
        )}
        {isListening && heyJarvisScore < 0.05 && frameCount > 20 && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
            Mic is active but scores are low. Speak clearly: "hey jarvis".
          </p>
        )}
      </div>

      {lastDetection && (
        <div style={{ marginBottom: 16, padding: 12, background: '#ecfdf5', borderRadius: 8 }}>
          Last detection: <strong>{lastDetection.label}</strong> ({lastDetection.score.toFixed(2)})
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
