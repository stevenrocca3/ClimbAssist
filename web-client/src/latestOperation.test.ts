import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLatestOperation } from './latestOperation.ts'

test('a new operation is current until something replaces it', () => {
  const operations = createLatestOperation()
  const signal = operations.start()
  assert.equal(signal.aborted, false)
})

test('starting a second operation invalidates the first', () => {
  const operations = createLatestOperation()
  const first = operations.start()
  const second = operations.start()
  assert.equal(first.aborted, true)
  assert.equal(second.aborted, false)
})

test('cancel invalidates the pending operation', () => {
  const operations = createLatestOperation()
  const signal = operations.start()
  operations.cancel()
  assert.equal(signal.aborted, true)
})

test('cancel with nothing pending does nothing', () => {
  const operations = createLatestOperation()
  operations.cancel()
  assert.equal(operations.start().aborted, false)
})

test('an aborted operation makes a delayed fetch reject so it can be ignored', async () => {
  const operations = createLatestOperation()
  const signal = operations.start()
  const delayed = new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason))
  })
  operations.start()
  await assert.rejects(delayed)
  assert.equal(signal.aborted, true)
})
