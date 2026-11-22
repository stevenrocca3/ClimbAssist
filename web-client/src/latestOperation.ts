// Tracks the one async operation whose result the page may still show.
// Starting a new operation, or cancelling, aborts the previous one, so a late
// response can tell from its own signal that it is out of date.
export type LatestOperation = {
  start: () => AbortSignal
  cancel: () => void
}

export function createLatestOperation(): LatestOperation {
  let current: AbortController | null = null

  function cancel() {
    current?.abort()
    current = null
  }

  function start() {
    cancel()
    current = new AbortController()
    return current.signal
  }

  return { start, cancel }
}
