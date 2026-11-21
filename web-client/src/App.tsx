import { useEffect, useState } from 'react'
import { HoldOverlay, type Hold } from './HoldOverlay'

const DEFAULT_API_URL = 'http://localhost:8000'

function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  const base = configured ? configured : DEFAULT_API_URL
  return base.replace(/\/$/, '')
}

function App() {
  const [serverStatus, setServerStatus] = useState('Checking server...')
  const [demoImageUrl, setDemoImageUrl] = useState('')
  const [holds, setHolds] = useState<Hold[]>([])
  const [demoMessage, setDemoMessage] = useState('')
  const isDemo = window.location.hash === '#hold-detection-demo'

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
      {isDemo && (
        <section className="hold-demo" aria-label="Hold detection demo">
          <label htmlFor="hold-image">Choose an image for the Issue #4 demo</label>
          <input
            id="hold-image"
            type="file"
            accept="image/jpeg,image/png"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setDemoMessage('Detecting holds...')
              if (demoImageUrl) URL.revokeObjectURL(demoImageUrl)
              const imageUrl = URL.createObjectURL(file)
              setDemoImageUrl(imageUrl)

              const form = new FormData()
              form.append('file', file)
              const response = await fetch(`${apiBaseUrl()}/api/holds/detect`, {
                method: 'POST',
                body: form,
              })
              const body = await response.json() as { holds?: Hold[]; detail?: string }
              if (!response.ok) {
                setHolds([])
                setDemoMessage(body.detail || `Detection failed (${response.status})`)
                return
              }
              const detected = body.holds || []
              setHolds(detected)
              setDemoMessage(detected.length ? `${detected.length} hold(s) detected` : 'No holds found. Retake the photo.')
            }}
          />
          {demoImageUrl && <HoldOverlay imageUrl={demoImageUrl} holds={holds} alt="Uploaded climbing wall" />}
          {demoMessage && <p role="status">{demoMessage}</p>}
        </section>
      )}
    </main>
  )
}

export default App
