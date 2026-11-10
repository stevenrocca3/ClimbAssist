import { useEffect, useState } from 'react'

const DEFAULT_API_URL = 'http://localhost:8000'

function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  const base = configured ? configured : DEFAULT_API_URL
  return base.replace(/\/$/, '')
}

function App() {
  const [serverStatus, setServerStatus] = useState('Checking server...')

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiBaseUrl()}/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        return response.json() as Promise<unknown>
      })
      .then((body) => {
        if (
          typeof body === 'object' &&
          body !== null &&
          'status' in body &&
          typeof body.status === 'string'
        ) {
          setServerStatus(body.status)
          return
        }
        setServerStatus('Server not reachable')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setServerStatus('Server not reachable')
      })

    return () => controller.abort()
  }, [])

  return (
    <main>
      <h1>ClimbAssist</h1>
      <p>{serverStatus}</p>
    </main>
  )
}

export default App
