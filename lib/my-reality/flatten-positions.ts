/**
 * Flatten 3D positions to 2D
 * Maps 3D hexagonal lattice positions (x, y, z) to 2D coordinates (x, y)
 * We use a top-down view: x remains x, z becomes y
 */

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface Position2D {
  x: number
  y: number
}

/**
 * Flatten a single 3D position to 2D (top-down view)
 */
export function flatten3DTo2D(pos: Position3D): Position2D {
  return {
    x: pos.x,
    y: pos.z, // Z-axis becomes Y-axis in 2D
  }
}

/**
 * Flatten an array of 3D positions to 2D
 */
export function flattenPositions(positions: Position3D[]): Position2D[] {
  return positions.map(flatten3DTo2D)
}
