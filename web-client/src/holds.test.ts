import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseHolds } from './holds.ts'

const inside = {
  id: 'h1',
  color: 'yellow',
  x: 0.42,
  y: 0.83,
  width: 0.09,
  height: 0.06,
}

test('keeps a hold whose box stays inside the photo', () => {
  assert.deepEqual(parseHolds({ holds: [inside] }), [inside])
})

test('keeps an empty hold list so the page can ask for a retake', () => {
  assert.deepEqual(parseHolds({ holds: [] }), [])
})

test('rejects a box that starts past the right edge', () => {
  const holds = parseHolds({
    holds: [{ ...inside, id: 'bad', x: 1.2 }],
  })
  assert.equal(holds, null)
})

test('rejects a box that extends past the photo', () => {
  const holds = parseHolds({
    holds: [{ ...inside, id: 'bad', x: 0.95, width: 0.1 }],
  })
  assert.equal(holds, null)
})

test('rejects a negative coordinate', () => {
  const holds = parseHolds({
    holds: [{ ...inside, id: 'bad', y: -0.1 }],
  })
  assert.equal(holds, null)
})

test('reads the checked-in sample wall', () => {
  const body = JSON.parse(
    readFileSync(new URL('../public/fixtures/sample-holds.json', import.meta.url), 'utf8'),
  )
  const holds = parseHolds(body)
  assert.ok(holds)
  assert.equal(holds.length, 10)
})
