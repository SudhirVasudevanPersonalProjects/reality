/**
 * 2D Scene Renderer
 *
 * Core rendering logic for the 2D canvas-based my-reality/somewhere page
 */

import { getCareVisual } from './care-visual-mapping'
import { renderPerlinNoiseBackground } from './perlin-noise-2d'
import type { Position2D } from './hexagonal-lattice-2d'

export interface Something2D {
  id: string
  x: number
  y: number
  care: number | null
  content: string
  opacity?: number
  scale?: number
  contentType?: string
  mediaUrl?: string | null
}

export interface Camera2D {
  x: number
  y: number
  zoom: number
}

export interface Abode {
  id: string
  text_content: string | null
  attributes: {
    icon?: string
    color?: string
  } | null
}

/**
 * Render the entire 2D scene
 */
export function render2DScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  somethings: Something2D[],
  camera: Camera2D,
  clearRadius: number,
  selectedId?: string | null,
  activeFilters?: string[],
  abodes?: Abode[]
) {
  // Clear canvas
  ctx.fillStyle = '#0a1628' // Dark blue space background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Render Perlin noise background
  renderPerlinNoiseBackground(ctx, canvas, camera.x, camera.y, camera.zoom, clearRadius)

  // Get filter colors mapping (if filters are active)
  const filterColors: string[] = []
  if (activeFilters && activeFilters.length > 0 && abodes) {
    activeFilters.forEach((filterId) => {
      const abode = abodes.find((a) => a.id === filterId)
      if (abode?.attributes?.color) {
        filterColors.push(abode.attributes.color)
      }
    })
  }

  // Render somethings (balls or question marks)
  somethings.forEach((something) => {
    const screenPos = worldToScreen(something, camera, canvas)
    const isSelected = selectedId === something.id

    // Skip if off-screen (with margin) - unless it's selected
    const margin = 100
    if (
      !isSelected &&
      (screenPos.x < -margin ||
      screenPos.x > canvas.width + margin ||
      screenPos.y < -margin ||
      screenPos.y > canvas.height + margin)
    ) {
      return
    }

    // Set opacity if specified (for isolation effect)
    const originalAlpha = ctx.globalAlpha
    if (something.opacity !== undefined) {
      ctx.globalAlpha = something.opacity
    }

    // Apply individual scale multiplier
    const scale = something.scale || 1.0
    const effectiveZoom = camera.zoom * scale

    if (something.care === 3) {
      // Dream - render as star
      renderStar(ctx, screenPos.x, screenPos.y, effectiveZoom, isSelected, something, filterColors)
    } else if (something.care !== null) {
      // Other care levels - render as ball
      renderBall(ctx, screenPos.x, screenPos.y, something.care, effectiveZoom, isSelected, something, filterColors)
    } else {
      // No care - render as question mark
      renderQuestionMark(ctx, screenPos.x, screenPos.y, effectiveZoom, isSelected, something, filterColors)
    }

    // Restore opacity
    ctx.globalAlpha = originalAlpha
  })
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldPos: { x: number; y: number },
  camera: Camera2D,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  return {
    x: (worldPos.x - camera.x) * camera.zoom + canvas.width / 2,
    y: (worldPos.y - camera.y) * camera.zoom + canvas.height / 2,
  }
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera2D,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  return {
    x: (screenX - canvas.width / 2) / camera.zoom + camera.x,
    y: (screenY - canvas.height / 2) / camera.zoom + camera.y,
  }
}

/**
 * Render a ball (when care is not null/0)
 */
function renderBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  care: number,
  zoom: number,
  isSelected: boolean = false,
  something?: Something2D,
  filterColors: string[] = []
) {
  const visual = getCareVisual(care)
  const radius = 20 * zoom // Scale with zoom

  // Save context for shadow
  ctx.save()

  // Apply glow effect
  if (visual.glowBlur > 0) {
    ctx.shadowColor = visual.glowColor
    ctx.shadowBlur = visual.glowBlur * zoom
  }

  // Create radial gradient
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  visual.gradientStops.forEach((stop) => {
    gradient.addColorStop(stop.offset, stop.color)
  })

  // Draw ball
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Restore context (clear shadow)
  ctx.restore()

  // Apply filter glow overlay if filters are active
  if (filterColors.length > 0) {
    const blendedColor = blendColors(filterColors)
    ctx.save()
    ctx.shadowColor = blendedColor
    ctx.shadowBlur = 30 * zoom
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2)
    ctx.fillStyle = blendedColor
    ctx.fill()
    ctx.restore()
  }

  // Note: Content is now rendered via HTML overlay in SomewhereClient, not on canvas
}

/**
 * Render a star (when care is 3 - dream)
 */
function renderStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zoom: number,
  isSelected: boolean = false,
  something?: Something2D,
  filterColors: string[] = []
) {
  const visual = getCareVisual(3) // Dream visual
  const radius = 20 * zoom // Same base size as balls
  const spikes = 5
  const outerRadius = radius
  const innerRadius = radius * 0.4

  // Save context for shadow
  ctx.save()

  // Apply glow effect
  ctx.shadowColor = visual.glowColor
  ctx.shadowBlur = visual.glowBlur * zoom

  // Create star path
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r

    if (i === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  }
  ctx.closePath()

  // Fill with gradient
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius)
  visual.gradientStops.forEach((stop) => {
    gradient.addColorStop(stop.offset, stop.color)
  })
  ctx.fillStyle = gradient
  ctx.fill()

  // Restore context (clear shadow)
  ctx.restore()

  // Apply filter glow overlay if filters are active
  if (filterColors.length > 0) {
    const blendedColor = blendColors(filterColors)
    ctx.save()
    ctx.shadowColor = blendedColor
    ctx.shadowBlur = 30 * zoom
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2)
    ctx.fillStyle = blendedColor
    ctx.fill()
    ctx.restore()
  }

  // Note: Content is now rendered via HTML overlay in SomewhereClient, not on canvas
}

/**
 * Render a question mark (when care is null or 0)
 */
function renderQuestionMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zoom: number,
  isSelected: boolean = false,
  something?: Something2D,
  filterColors: string[] = []
) {
  const size = 40 * zoom // Scale with zoom
  const radius = 20 * zoom // Match ball radius

  ctx.save()
  ctx.fillStyle = '#888888'
  ctx.font = `${size}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?', x, y)
  ctx.restore()

  // Apply filter glow overlay if filters are active
  if (filterColors.length > 0) {
    const blendedColor = blendColors(filterColors)
    ctx.save()
    ctx.shadowColor = blendedColor
    ctx.shadowBlur = 30 * zoom
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2)
    ctx.fillStyle = blendedColor
    ctx.fill()
    ctx.restore()
  }

  // Note: Content is now rendered via HTML overlay in SomewhereClient, not on canvas
}

/**
 * Detect click on something
 * Returns the ID of the clicked something, or null
 */
export function detectClick(
  screenX: number,
  screenY: number,
  somethings: Something2D[],
  camera: Camera2D,
  canvas: HTMLCanvasElement
): string | null {
  const clickRadius = 20 * camera.zoom // Same as ball/question mark radius

  for (let i = somethings.length - 1; i >= 0; i--) {
    const something = somethings[i]
    const screenPos = worldToScreen(something, camera, canvas)

    const distance = Math.sqrt(
      Math.pow(screenX - screenPos.x, 2) + Math.pow(screenY - screenPos.y, 2)
    )

    if (distance <= clickRadius) {
      return something.id
    }
  }

  return null
}

/**
 * Apply camera pan
 */
export function panCamera(
  camera: Camera2D,
  deltaX: number,
  deltaY: number
): Camera2D {
  return {
    ...camera,
    x: camera.x - deltaX / camera.zoom,
    y: camera.y - deltaY / camera.zoom,
  }
}

/**
 * Apply camera zoom
 */
export function zoomCamera(
  camera: Camera2D,
  delta: number,
  minZoom: number = 0.1,
  maxZoom: number = 50.0
): Camera2D {
  const zoomSpeed = 0.001
  const newZoom = Math.max(minZoom, Math.min(maxZoom, camera.zoom + delta * zoomSpeed))

  return {
    ...camera,
    zoom: newZoom,
  }
}

/**
 * Blend multiple hex colors using additive color mixing
 */
function blendColors(hexColors: string[]): string {
  if (hexColors.length === 0) return '#FFFFFF'
  if (hexColors.length === 1) return hexColors[0]

  // Convert hex to RGB and sum
  let r = 0, g = 0, b = 0
  hexColors.forEach((hex) => {
    const rgb = hexToRgb(hex)
    r += rgb.r
    g += rgb.g
    b += rgb.b
  })

  // Average and clamp
  r = Math.min(255, Math.round(r / hexColors.length))
  g = Math.min(255, Math.round(g / hexColors.length))
  b = Math.min(255, Math.round(b / hexColors.length))

  return rgbToHex(r, g, b)
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 }
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}
