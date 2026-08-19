import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

const ROUTES = [
  { path: '/wakeword', label: 'OWW Web' },
  { path: '/wakeword-wasm', label: 'OWW WASM' },
  { path: '/wakeword-davoice', label: 'DaVoice' },
  { path: '/wakeword-porcupine', label: 'Porcupine' },
] as const

type WakeWordDemoShellProps = {
  title: string
  subtitle: ReactNode
  children: ReactNode
}

export function WakeWordDemoShell({ title, subtitle, children }: WakeWordDemoShellProps) {
  const location = useLocation()

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 720,
        margin: '0 auto',
        fontFamily: 'sans-serif',
        height: '100%',
        overflow: 'auto',
        boxSizing: 'border-box',
        background: '#fff',
        color: '#111',
      }}
    >
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {ROUTES.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: location.pathname === path ? '#0284c7' : '#f1f5f9',
              color: location.pathname === path ? '#fff' : '#334155',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </div>
  )
}
