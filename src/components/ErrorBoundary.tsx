import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#111' }}>
            <h2>Something went wrong</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#dc2626' }}>
              {this.state.error.message}
            </pre>
          </div>
        )
      )
    }
    return this.props.children
  }
}
