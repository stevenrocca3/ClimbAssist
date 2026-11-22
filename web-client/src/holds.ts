export type Hold = {
  id: string
  color: string
  x: number
  y: number
  width: number
  height: number
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
