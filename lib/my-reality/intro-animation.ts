/**
 * Intro animation for /my-reality/somewhere page
 * Animates camera from zoomed-out view to default home view
 */

import { Camera2D } from './render-2d-scene'

/**
 * Easing function for smooth animation (ease-in-out cubic)
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Animate camera zoom from far away to default home view
 *
 * @param setCamera - State setter function for camera
 * @param onComplete - Callback when animation completes
 * @returns Cleanup function to cancel animation
 */
export function animateIntroZoom(
  setCamera: React.Dispatch<React.SetStateAction<Camera2D>>,
  onComplete: () => void
): () => void {
  const startZoom = 0.1 // Very zoomed out (shows full Perlin noise - the Unknown)
  const endZoom = 1.0 // Default home view
  const pauseDuration = 1500 // 2.5 seconds - pause on Unknown
  const zoomDuration = 3000 // 3 seconds - slower transition to home
  const totalDuration = pauseDuration + zoomDuration // 5.5 seconds total
  const startTime = Date.now()

  let animationFrameId: number

  function animate() {
    const elapsed = Date.now() - startTime

    if (elapsed < pauseDuration) {
      // Pause phase - stay at startZoom
      setCamera((prev) => ({
        ...prev,
        zoom: startZoom,
      }))
      animationFrameId = requestAnimationFrame(animate)
    } else if (elapsed < totalDuration) {
      // Zoom phase - transition from startZoom to endZoom
      const zoomElapsed = elapsed - pauseDuration
      const progress = Math.min(zoomElapsed / zoomDuration, 1)
      const eased = easeInOutCubic(progress)

      // Interpolate zoom level
      const currentZoom = startZoom + (endZoom - startZoom) * eased

      setCamera((prev) => ({
        ...prev,
        zoom: currentZoom,
      }))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    } else {
      // Animation complete
      onComplete()
    }
  }

  // Start animation
  animationFrameId = requestAnimationFrame(animate)

  // Return cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}
