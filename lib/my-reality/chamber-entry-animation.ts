/**
 * Chamber Entry Animation
 * Handles spaceship flight, zoom out, fade to black, and blink effects
 */

export interface Position {
  x: number
  y: number
}

export interface SpaceshipState extends Position {
  rotation: number
  scale: number
}

/**
 * Easing function for smooth animation
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * Animates spaceship flight from start to end position using bezier curve
 * @param startPos Starting position
 * @param endPos Target position
 * @param onUpdate Callback for each frame with current position and rotation
 * @param onComplete Callback when animation completes
 * @returns Cleanup function to cancel animation
 */
export function animateSpaceshipFlight(
  startPos: Position,
  endPos: Position,
  onUpdate: (state: SpaceshipState) => void,
  onComplete: () => void,
): () => void {
  const duration = 1800 // 1.8 seconds
  const startTime = Date.now()

  // Calculate control point for bezier curve (creates upward arc)
  const controlPoint: Position = {
    x: (startPos.x + endPos.x) / 2,
    y: Math.min(startPos.y, endPos.y) - 100, // Arc upward
  }

  let rafId: number

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutQuad(progress)

    // Quadratic Bezier curve: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const t = eased
    const x =
      Math.pow(1 - t, 2) * startPos.x +
      2 * (1 - t) * t * controlPoint.x +
      Math.pow(t, 2) * endPos.x
    const y =
      Math.pow(1 - t, 2) * startPos.y +
      2 * (1 - t) * t * controlPoint.y +
      Math.pow(t, 2) * endPos.y

    // Calculate rotation based on direction of travel
    const dx = endPos.x - startPos.x
    const dy = endPos.y - startPos.y
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 180

    onUpdate({ x, y, rotation, scale: 1 })

    if (progress < 1) {
      rafId = requestAnimationFrame(animate)
    } else {
      onComplete()
    }
  }

  rafId = requestAnimationFrame(animate)

  // Cleanup function
  return () => cancelAnimationFrame(rafId)
}

/**
 * Animates spaceship zoom out and screen fade to black
 * @param currentPos Current spaceship position
 * @param currentRotation Current spaceship rotation
 * @param onUpdateSpaceship Callback to update spaceship scale
 * @param onUpdateFade Callback to update fade overlay opacity
 * @param onComplete Callback when animation completes
 * @returns Cleanup function to cancel animation
 */
export function animateZoomOutAndFade(
  currentPos: Position,
  currentRotation: number,
  onUpdateSpaceship: (state: SpaceshipState) => void,
  onUpdateFade: (opacity: number) => void,
  onComplete: () => void
): () => void {
  const fadeDuration = 1500 // 1.5 seconds fade
  const holdDuration = 500 // 0.5 seconds hold
  const totalDuration = fadeDuration + holdDuration
  const startTime = Date.now()

  let rafId: number

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / totalDuration, 1)

    if (elapsed < fadeDuration) {
      // Fade and zoom out phase
      const fadeProgress = elapsed / fadeDuration
      const eased = easeInOutQuad(fadeProgress)

      // Scale down spaceship (1.0 → 0)
      const scale = 1 - eased

      onUpdateSpaceship({
        x: currentPos.x,
        y: currentPos.y,
        rotation: currentRotation,
        scale,
      })

      // Fade to black (0 → 1)
      onUpdateFade(eased)
    } else {
      // Hold phase - keep everything at final state
      onUpdateSpaceship({
        x: currentPos.x,
        y: currentPos.y,
        rotation: currentRotation,
        scale: 0,
      })
      onUpdateFade(1)
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(animate)
    } else {
      onComplete()
    }
  }

  rafId = requestAnimationFrame(animate)

  // Cleanup function
  return () => cancelAnimationFrame(rafId)
}

/**
 * Animates screen blink from black to visible
 * @param onUpdateFade Callback to update fade overlay opacity
 * @param onComplete Callback when animation completes
 * @returns Cleanup function to cancel animation
 */
export function blinkToChamberView(
  onUpdateFade: (opacity: number) => void,
  onComplete: () => void
): () => void {
  const duration = 200 // 200ms quick blink
  const startTime = Date.now()

  let rafId: number

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Fade from black (1 → 0)
    onUpdateFade(1 - progress)

    if (progress < 1) {
      rafId = requestAnimationFrame(animate)
    } else {
      onComplete()
    }
  }

  rafId = requestAnimationFrame(animate)

  // Cleanup function
  return () => cancelAnimationFrame(rafId)
}
