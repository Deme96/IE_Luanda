import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import './index.css'
import './i18n'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', fontFamily: 'system-ui', padding: 32, textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginBottom: 8 }}>
            Ocorreu um erro na aplicação
          </h1>
          <p style={{ color: '#666', marginBottom: 24, maxWidth: 480 }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'hsl(69,44%,22%)', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600
            }}
          >
            Recarregar página
          </button>
          <details style={{ marginTop: 24, textAlign: 'left', maxWidth: 600, width: '100%' }}>
            <summary style={{ cursor: 'pointer', color: '#999', fontSize: '0.85rem' }}>Detalhes técnicos</summary>
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: '0.75rem', marginTop: 8 }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="gestao-igreja-theme">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
