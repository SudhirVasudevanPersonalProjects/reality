/**
 * Distribution algorithm for question marks on /ur-reality mystery map
 */

export interface QuestionMarkPosition {
  x: number // x position as % of viewport width
  y: number // y position as % of viewport height
  size: number // size in pixels
}

interface DistributedQuestionMark<T> {
  item: T
  position: QuestionMarkPosition
}

/**
 * Calculate Euclidean distance between two positions
 */
function distance(pos1: QuestionMarkPosition, pos2: QuestionMarkPosition): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Check if a position collides with existing positions
 */
function hasCollision(
  newPos: QuestionMarkPosition,
  existing: QuestionMarkPosition[],
  minSeparation: number
): boolean {
  return existing.some(pos => distance(newPos, pos) < minSeparation)
}

/**
 * Generate random position with collision avoidance
 */
function generateRandomPosition(
  size: number,
  existing: QuestionMarkPosition[],
  minSeparation: number,
  maxAttempts = 10
): QuestionMarkPosition {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pos: QuestionMarkPosition = {
      x: 10 + Math.random() * 80, // Keep away from edges (10-90%)
      y: 10 + Math.random() * 80,
      size
    }

    if (!hasCollision(pos, existing, minSeparation)) {
      return pos
    }
  }

  // If all attempts fail, just return the last position (rare)
  return {
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size
  }
}

/**
 * Distribute question marks based on count
 */
export function distributeQuestionMarks<T>(items: T[]): DistributedQuestionMark<T>[] {
  const count = items.length

  // Predefined patterns for 1-5 items
  if (count === 1) {
    return [{ item: items[0], position: { x: 50, y: 50, size: 120 } }]
  }

  if (count === 2) {
    return [
      { item: items[0], position: { x: 30, y: 50, size: 100 } },
      { item: items[1], position: { x: 70, y: 50, size: 100 } }
    ]
  }

  if (count === 3) {
    return [
      { item: items[0], position: { x: 25, y: 50, size: 80 } },
      { item: items[1], position: { x: 50, y: 50, size: 80 } },
      { item: items[2], position: { x: 75, y: 50, size: 80 } }
    ]
  }

  if (count === 4) {
    return [
      { item: items[0], position: { x: 30, y: 30, size: 70 } },
      { item: items[1], position: { x: 70, y: 30, size: 70 } },
      { item: items[2], position: { x: 30, y: 70, size: 70 } },
      { item: items[3], position: { x: 70, y: 70, size: 70 } }
    ]
  }

  if (count === 5) {
    return [
      { item: items[0], position: { x: 25, y: 25, size: 60 } },
      { item: items[1], position: { x: 75, y: 25, size: 60 } },
      { item: items[2], position: { x: 50, y: 50, size: 60 } },
      { item: items[3], position: { x: 25, y: 75, size: 60 } },
      { item: items[4], position: { x: 75, y: 75, size: 60 } }
    ]
  }

  // For 6+ items: Random spread with collision avoidance
  const baseSize = Math.max(30, 100 - count * 2) // Decrease size as count increases
  const minSeparation = baseSize + 10

  const positions: QuestionMarkPosition[] = []
  const distributed: DistributedQuestionMark<T>[] = []

  for (const item of items) {
    const position = generateRandomPosition(baseSize, positions, minSeparation)
    positions.push(position)
    distributed.push({ item, position })
  }

  return distributed
}
