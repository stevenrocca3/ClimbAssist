import { useEffect, useState, type ChangeEvent } from 'react'
import { parseHolds, type Hold } from './holds'
import { createLatestOperation } from './latestOperation'

const DEFAULT_API_URL = 'http://localhost:8000'
const SAMPLE_IMAGE = '/fixtures/sample-wall.png'
const SAMPLE_HOLDS = '/fixtures/sample-holds.json'
const MAX_BYTES = 10 * 1024 * 1024

function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  const base = configured ? configured : DEFAULT_API_URL
  return base.replace(/\/$/, '')
}

function isJpegOrPng(file: File): boolean {
  return file.type === 'image/jpeg' || file.type === 'image/png'
}

async function loadSampleHolds(signal: AbortSignal): Promise<Hold[]> {
  const response = await fetch(SAMPLE_HOLDS, { signal })
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
    if (typeof payload === 'object' && payload !== null) {
      const body = payload as Record<string, unknown>
      if (typeof body.detail === 'string') {
        return Promise.resolve(body.detail)
      }
      if (typeof body.error === 'string') {
        return Promise.resolve(body.error)
      }
    }
  } catch {
    // The server did not return JSON.
  }
  return 'Only JPEG and PNG up to 10 MB are accepted.'
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [holds, setHolds] = useState<Hold[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Only the operation started most recently may change what the page shows.
  const [operations] = useState(createLatestOperation)

  useEffect(
    () => () => {
      operations.cancel()
      // Also covers React StrictMode's simulated unmount in development, where the state survives.
      setBusy(false)
    },
    [operations],
  )

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
    operations.cancel()
    setBusy(false)
    setError(null)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    resetResult()
  }

  async function showSample(message: string, signal: AbortSignal) {
    const sample = await loadSampleHolds(signal)
    signal.throwIfAborted()
    setHolds(sample)
    setImageSrc(SAMPLE_IMAGE)
    setNotice(message)
  }

  async function onAnalyze() {
    if (!file || !previewUrl) {
      setError('Choose a JPEG or PNG first.')
      return
    }
    const signal = operations.start()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch(`${apiBaseUrl()}/api/holds/detect`, {
        method: 'POST',
        body,
        signal,
      })
      if (
        response.status === 400 ||
        response.status === 413 ||
        response.status === 415 ||
        response.status === 422
      ) {
        const message = await readError(response)
        signal.throwIfAborted()
        setError(message)
        return
      }
      if (!response.ok) {
        await showSample(
          'Sample holds. The detection service is not available yet, so this is the demo wall rather than your photo.',
          signal,
        )
        return
      }
      const detected = parseHolds(await response.json())
      signal.throwIfAborted()
      if (!detected) {
        await showSample(
          'Sample holds. The server response was not a hold list, so this is the demo wall rather than your photo.',
          signal,
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
      // An outdated request ends in an abort; ignore it instead of showing sample data or an error.
      if (signal.aborted) {
        return
      }
      try {
        await showSample(
          'Sample holds. The server could not be reached, so this is the demo wall rather than your photo.',
          signal,
        )
      } catch {
        if (!signal.aborted) {
          setError('The sample holds could not be loaded.')
        }
      }
    } finally {
      if (!signal.aborted) {
        setBusy(false)
      }
    }
  }

  async function onUseSample() {
    const signal = operations.start()
    setBusy(true)
    setError(null)
    try {
      await showSample('Sample holds. These boxes are demo data, not detected from a photo.', signal)
    } catch {
      if (!signal.aborted) {
        setError('The sample holds could not be loaded.')
      }
    } finally {
      if (!signal.aborted) {
        setBusy(false)
      }
    }
  }

  function onStartOver() {
    operations.cancel()
    setBusy(false)
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
      <p className="intro">
        Upload a photo of the wall. Detected holds are outlined so you can see what the photo contains.
      </p>

      <section className="card">
        <label className="file-label" htmlFor="wall-photo">
          Wall photo
          <input
            id="wall-photo"
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            onChange={onFile}
          />
        </label>
        <p className="hint">JPEG or PNG, up to 10 MB. You can replace the photo before detecting holds.</p>

        {error ? <p className="error">{error}</p> : null}

        <div className="actions">
          <button type="button" onClick={onAnalyze} disabled={busy || !file}>
            {busy ? 'Working...' : 'Detect holds'}
          </button>
          <button type="button" className="secondary" onClick={onUseSample} disabled={busy}>
            Use sample wall
          </button>
        </div>

        {previewUrl && !holds ? (
          <img className="preview" src={previewUrl} alt="Selected wall" />
        ) : null}

        {holds && imageSrc ? (
          <div className="result">
            {notice ? <p className="notice">{notice}</p> : null}
            <div className="stage">
              <img src={imageSrc} alt="Climbing wall with outlined holds" />
              {holds.map((hold) => (
                <span
                  key={hold.id}
                  className="hold"
                  style={{
                    left: `${hold.x * 100}%`,
                    top: `${hold.y * 100}%`,
                    width: `${hold.width * 100}%`,
                    height: `${hold.height * 100}%`,
                    borderColor: hold.color,
                  }}
                  title={`${hold.id} ${hold.color}`}
                >
                  <span className="hold-id">{hold.id}</span>
                </span>
              ))}
            </div>
            <p className="summary">
              {holds.length === 0 ? 'No holds outlined.' : `${holds.length} holds outlined.`}
            </p>
            <div className="actions">
              <button type="button" className="secondary" onClick={onStartOver}>
                Start over
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default App
