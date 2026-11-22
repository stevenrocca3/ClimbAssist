import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseHolds, toggleHoldSelection } from './holds.ts'

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

const routeHolds = [
  { ...inside, id: 'yellow-1' },
  { ...inside, id: 'yellow-2' },
  { ...inside, id: 'blue-1', color: 'blue' },
  { ...inside, id: 'blue-2', color: 'blue' },
]

test('the first click selects all holds of the clicked color', () => {
  assert.deepEqual(toggleHoldSelection(routeHolds, null, 'yellow-1'), ['yellow-1', 'yellow-2'])
  assert.deepEqual(toggleHoldSelection(routeHolds, null, 'blue-1'), ['blue-1', 'blue-2'])
})

test('clicking a selected hold removes only that hold', () => {
  const selected = ['yellow-1', 'yellow-2']
  assert.deepEqual(toggleHoldSelection(routeHolds, selected, 'yellow-1'), ['yellow-2'])
  assert.deepEqual(selected, ['yellow-1', 'yellow-2'])
})

test('manual corrections can add just one hold of another color', () => {
  const selected = ['yellow-1', 'yellow-2']
  assert.deepEqual(toggleHoldSelection(routeHolds, selected, 'blue-1'), [
    'yellow-1', 'yellow-2', 'blue-1',
  ])
  assert.deepEqual(selected, ['yellow-1', 'yellow-2'])
})

test('removing every hold keeps individual selection active', () => {
  const selected = toggleHoldSelection(routeHolds, ['yellow-1'], 'yellow-1')
  assert.deepEqual(selected, [])
  assert.deepEqual(toggleHoldSelection(routeHolds, selected, 'blue-1'), ['blue-1'])
})

test('unknown IDs and empty detection results leave the selection unchanged', () => {
  const selected = ['yellow-1']
  assert.equal(toggleHoldSelection(routeHolds, selected, 'missing'), selected)
  assert.equal(toggleHoldSelection(routeHolds, null, 'missing'), null)
  assert.equal(toggleHoldSelection([], null, 'missing'), null)
})
