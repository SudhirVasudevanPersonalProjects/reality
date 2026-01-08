/**
 * 2D Perlin Noise Background Generator
 *
 * Creates a Perlin noise texture for canvas background
 */

import { createNoise2D } from 'simplex-noise'

/**
 * Generate a Perlin noise pattern on a canvas
 * @param canvas Canvas element to draw on
 * @param centerX Center X coordinate (in world space)
 * @param centerY Center Y coordinate (in world space)
 * @param zoom Zoom level
 * @param clearRadius Radius around center to keep clear
 */
export function renderPerlinNoiseBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  zoom: number,
  clearRadius: number
) {
  const noise2D = createNoise2D()

  // Create image data for the noise
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data

  const scale = 0.01 / zoom // Scale with zoom for consistent appearance
  const opacity = 0.6

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Convert screen coordinates to world coordinates
      const worldX = (x - canvas.width / 2) / zoom + centerX
      const worldY = (y - canvas.height / 2) / zoom + centerY

      // Distance from center
      const distFromCenter = Math.sqrt(worldX * worldX + worldY * worldY)

      // Calculate fade based on distance from center
      const fadeStart = clearRadius
      const fadeEnd = clearRadius + clearRadius * 0.15
      const alpha = distFromCenter < fadeStart
        ? 0
        : distFromCenter < fadeEnd
          ? ((distFromCenter - fadeStart) / (fadeEnd - fadeStart)) * opacity
          : opacity

      // Generate noise value (-1 to 1)
      const noiseValue = noise2D(worldX * scale, worldY * scale)

      // Convert to grayscale (0-255)
      const gray = ((noiseValue + 1) / 2) * 255

      const index = (y * canvas.width + x) * 4
      data[index] = gray     // R
      data[index + 1] = gray // G
      data[index + 2] = gray // B
      data[index + 3] = alpha * 255 // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Simpler gradient background (fallback if noise is too expensive)
 */
export function renderGradientBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  zoom: number,
  clearRadius: number
) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Create radial gradient from center outward
  const screenCenterX = canvas.width / 2 - centerX * zoom
  const screenCenterY = canvas.height / 2 - centerY * zoom
  const maxRadius = Math.max(canvas.width, canvas.height) * 1.5

  const gradient = ctx.createRadialGradient(
    screenCenterX,
    screenCenterY,
    clearRadius * zoom,
    screenCenterX,
    screenCenterY,
    maxRadius
  )

  gradient.addColorStop(0, 'rgba(100, 100, 100, 0)')
  gradient.addColorStop(0.3, 'rgba(100, 100, 100, 0.3)')
  gradient.addColorStop(1, 'rgba(150, 150, 150, 0.6)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}
