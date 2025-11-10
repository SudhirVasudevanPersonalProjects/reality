/**
 * Content positioning logic for /ur-reality
 * Ensures content stays on screen
 */

export interface ContentPosition {
  top: number // pixels from top
  left: number // pixels from left
  maxWidth: number // max width in pixels
}

export interface ViewportDimensions {
  width: number
  height: number
}

/**
 * Calculate content position underneath question mark
 * With edge detection to keep content on-screen
 */
export function calculateContentPosition(
  questionMarkX: number, // % of viewport width
  questionMarkY: number, // % of viewport height
  questionMarkSize: number, // pixels
  viewport: ViewportDimensions,
  contentMaxWidth = 400, // max content width
  contentEstimatedHeight = 200 // estimated content height
): ContentPosition {
  // Convert % to pixels
  const qmLeft = (questionMarkX / 100) * viewport.width
  const qmTop = (questionMarkY / 100) * viewport.height

  // Default: Position underneath question mark
  let top = qmTop + questionMarkSize + 10
  let left = qmLeft - contentMaxWidth / 2 // Center under question mark

  // Edge detection: Right side
  if (left + contentMaxWidth > viewport.width - 20) {
    left = viewport.width - contentMaxWidth - 20
  }

  // Edge detection: Left side
  if (left < 20) {
    left = 20
  }

  // Edge detection: Bottom (if content would go off-screen, show above)
  if (top + contentEstimatedHeight > viewport.height - 20) {
    top = qmTop - contentEstimatedHeight - 10
    // If still off-screen (very top), just clamp
    if (top < 20) {
      top = 20
    }
  }

  return {
    top,
    left,
    maxWidth: Math.min(contentMaxWidth, viewport.width - 40)
  }
}
