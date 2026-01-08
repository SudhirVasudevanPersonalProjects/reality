/**
 * Camera Animation Utilities
 */

import type { Something2D, Camera2D } from './render-2d-scene'

/**
 * Calculate the centroid (center point) of a set of somethings
 */
export function calculateCentroid(somethings: Something2D[]): { x: number; y: number } {
  if (somethings.length === 0) return { x: 0, y: 0 }

  const sum = somethings.reduce(
    (acc, s) => ({ x: acc.x + s.x, y: acc.y + s.y }),
    { x: 0, y: 0 }
  )

  return {
    x: sum.x / somethings.length,
    y: sum.y / somethings.length,
  }
}

/**
 * Easing function for smooth animation (cubic ease-in-out)
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Animate camera pan to target position
 * Returns cleanup function
 */
export function animateCameraPan(
  fromCamera: Camera2D,
  toPosition: { x: number; y: number },
  duration: number,
  onUpdate: (camera: Camera2D) => void,
  onComplete: () => void
): () => void {
  const startTime = Date.now()
  let animationFrameId: number

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)

    const newCamera: Camera2D = {
      x: fromCamera.x + (toPosition.x - fromCamera.x) * eased,
      y: fromCamera.y + (toPosition.y - fromCamera.y) * eased,
      zoom: fromCamera.zoom,
    }

    onUpdate(newCamera)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      onComplete()
    }
  }

  animationFrameId = requestAnimationFrame(animate)

  // Return cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}
