/**
 * Hexagonal Lattice Distribution (2D)
 *
 * Distributes items on a hexagonal lattice pattern in 2D space
 */

export interface Position2D {
  x: number
  y: number
}

/**
 * Calculate the radius needed for a hexagonal lattice to fit N items
 */
export function calculateCircleRadius(maxBound: number): number {
  // Same formula as 3D version - determines the boundary radius
  return maxBound * 50 // Scale factor for spacing
}

/**
 * Distribute items on a hexagonal lattice in 2D
 * @param count Number of items to distribute
 * @param maxBound Maximum bound for distribution
 * @returns Array of 2D positions
 */
export function distributeOnHexagonalLattice(
  count: number,
  maxBound: number
): Position2D[] {
  const positions: Position2D[] = []
  const spacing = 100 // Distance between items

  // Hexagonal lattice pattern
  // Start from center and spiral outward in rings
  let ring = 0
  let itemsPlaced = 0

  // Place center item
  if (count > 0) {
    positions.push({ x: 0, y: 0 })
    itemsPlaced++
  }

  // Place items in rings around center
  while (itemsPlaced < count) {
    ring++
    const itemsInRing = Math.min(ring * 6, count - itemsPlaced)

    for (let i = 0; i < itemsInRing; i++) {
      const angle = (i / itemsInRing) * Math.PI * 2
      const radius = ring * spacing

      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      positions.push({ x, y })
      itemsPlaced++

      if (itemsPlaced >= count) break
    }
  }

  return positions
}

/**
 * Add slight random jitter to positions to make them feel more organic
 */
export function addJitter(positions: Position2D[], jitterAmount: number = 10): Position2D[] {
  return positions.map(pos => ({
    x: pos.x + (Math.random() - 0.5) * jitterAmount,
    y: pos.y + (Math.random() - 0.5) * jitterAmount,
  }))
}
