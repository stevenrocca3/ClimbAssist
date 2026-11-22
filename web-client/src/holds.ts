export type Hold = {
  id: string
  color: string
  x: number
  y: number
  width: number
  height: number
}

// A null selection means the next click chooses a color group. An empty array
// means the user removed every hold and can keep adjusting individual holds.
export function toggleHoldSelection(
  holds: Hold[],
  selectedIds: string[] | null,
  holdId: string,
): string[] | null {
  const clickedHold = holds.find((hold) => hold.id === holdId)
  if (!clickedHold) {
    return selectedIds
  }
  if (selectedIds === null) {
    return holds.filter((hold) => hold.color === clickedHold.color).map((hold) => hold.id)
  }
  if (selectedIds.includes(holdId)) {
    return selectedIds.filter((id) => id !== holdId)
  }
  return [...selectedIds, holdId]
}

function isFraction(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

function isHold(value: unknown): value is Hold {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const hold = value as Record<string, unknown>
  if (
    typeof hold.id !== 'string' ||
    typeof hold.color !== 'string' ||
    !isFraction(hold.x) ||
    !isFraction(hold.y) ||
    !isFraction(hold.width) ||
    !isFraction(hold.height)
  ) {
    return false
  }
  return hold.x + hold.width <= 1 && hold.y + hold.height <= 1
}

export function parseHolds(value: unknown): Hold[] | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const body = value as Record<string, unknown>
  if (!Array.isArray(body.holds) || !body.holds.every(isHold)) {
    return null
  }
  return body.holds
}
