import { useEffect, useState } from 'react'
import { HoldOverlay, type Hold } from './HoldOverlay'

const DEFAULT_API_URL = 'http://localhost:8000'
const SAMPLE_IMAGE = '/fixtures/sample-wall.png'
const SAMPLE_HOLDS = '/fixtures/sample-holds.json'
const MAX_BYTES = 10 * 1024 * 1024

type Hold = {
  id: string
  color: string
  x: number
  y: number
  width: number
  height: number
}

function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  const base = configured ? configured : DEFAULT_API_URL
  return base.replace(/\/$/, '')
}

function isJpegOrPng(file: File): boolean {
  return file.type === 'image/jpeg' || file.type === 'image/png'
}

function isUnit(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isHold(value: unknown): value is Hold {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const hold = value as Record<string, unknown>
  return (
    typeof hold.id === 'string' &&
    typeof hold.color === 'string' &&
    isUnit(hold.x) &&
    isUnit(hold.y) &&
    isUnit(hold.width) &&
    isUnit(hold.height)
  )
}

function parseHolds(value: unknown): Hold[] | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const body = value as Record<string, unknown>
  if (!Array.isArray(body.holds) || !body.holds.every(isHold)) {
    return null
  }
  return body.holds
}

async function loadSampleHolds(): Promise<Hold[]> {
  const response = await fetch(SAMPLE_HOLDS)
  if (!response.ok) {
    throw new Error('Sample holds are missing')
  }
  const holds = parseHolds(await response.json())
  if (!holds) {
    throw new Error('Sample holds are invalid')
  }
  return holds
}

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
    ) {
      return payload.error
    }
  } catch {
    // The server did not return JSON.
  }
  return 'Only JPEG and PNG up to 10 MB are accepted.'
}

function App() {
  const [serverStatus, setServerStatus] = useState('Checking server...')
  const [demoImageUrl, setDemoImageUrl] = useState('')
  const [holds, setHolds] = useState<Hold[]>([])
  const [demoMessage, setDemoMessage] = useState('')
  const isDemo = window.location.hash === '#hold-detection-demo'

  useEffect(() => {
    if (!previewUrl) {
      return
    }
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function resetResult() {
    setHolds(null)
    setImageSrc(null)
    setNotice(null)
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) {
      return
    }
    if (!isJpegOrPng(selected)) {
      setError('Only JPEG and PNG files are accepted.')
      event.target.value = ''
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('Images must be 10 MB or smaller.')
      event.target.value = ''
      return
    }
    setError(null)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    resetResult()
  }

  async function showSample(message: string) {
    const sample = await loadSampleHolds()
    setHolds(sample)
    setImageSrc(SAMPLE_IMAGE)
    setNotice(message)
  }

  async function onAnalyze() {
    if (!file || !previewUrl) {
      setError('Choose a JPEG or PNG first.')
      return
    }
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch(`${apiBaseUrl()}/api/holds/detect`, {
        method: 'POST',
        body,
      })
      if (response.status === 400 || response.status === 413) {
        setError(await readError(response))
        return
      }
      if (!response.ok) {
        await showSample(
          'Sample holds. The detection service is not available yet, so this is the demo wall rather than your photo.',
        )
        return
      }
      const detected = parseHolds(await response.json())
      if (!detected) {
        await showSample(
          'Sample holds. The server response was not a hold list, so this is the demo wall rather than your photo.',
        )
        return
      }
      setHolds(detected)
      setImageSrc(previewUrl)
      setNotice(
        detected.length === 0
          ? 'No holds found. Retake the photo.'
          : null,
      )
    } catch {
      try {
        await showSample(
          'Sample holds. The server could not be reached, so this is the demo wall rather than your photo.',
        )
      } catch {
        setError('The sample holds could not be loaded.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function onUseSample() {
    setBusy(true)
    setError(null)
    try {
      await showSample('Sample holds. These boxes are demo data, not detected from a photo.')
    } catch {
      setError('The sample holds could not be loaded.')
    } finally {
      setBusy(false)
    }
  }

  function onStartOver() {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    resetResult()
    const input = document.getElementById('wall-photo')
    if (input instanceof HTMLInputElement) {
      input.value = ''
    }
  }

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
