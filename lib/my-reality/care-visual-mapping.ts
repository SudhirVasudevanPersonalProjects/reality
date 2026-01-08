/**
 * Care Level to Visual Appearance Mapping
 *
 * Maps care values (-2 to +2) to visual properties
 */

export interface CareVisual {
  fillColor: string
  glowColor: string
  glowBlur: number
  gradientStops: Array<{ offset: number; color: string }>
}

/**
 * Get visual appearance based on care level
 */
export function getCareVisual(care: number | null): CareVisual {
  if (care === null || care === 0) {
    // Neutral - grey ball or question mark
    return {
      fillColor: '#888888',
      glowColor: '#888888',
      glowBlur: 0,
      gradientStops: [
        { offset: 0, color: '#888888' },
        { offset: 1, color: '#555555' },
      ],
    }
  }

  if (care === -2) {
    // Most Ugly - Radiant dark ball
    return {
      fillColor: '#1a0a2e',
      glowColor: '#1a0a2e',
      glowBlur: 20,
      gradientStops: [
        { offset: 0, color: '#1a0a2e' }, // Dark purple core
        { offset: 1, color: '#000000' }, // Black edge
      ],
    }
  }

  if (care === -1) {
    // Ugly - Dim dark ball
    return {
      fillColor: '#3a3a3a',
      glowColor: '#3a3a3a',
      glowBlur: 5,
      gradientStops: [
        { offset: 0, color: '#3a3a3a' },
        { offset: 1, color: '#1a1a1a' },
      ],
    }
  }

  if (care === 1) {
    // Beauty - Dim bright ball
    return {
      fillColor: '#ffffcc',
      glowColor: '#ffffcc',
      glowBlur: 10,
      gradientStops: [
        { offset: 0, color: '#ffffcc' }, // Light yellow
        { offset: 1, color: '#ffff99' },
      ],
    }
  }

  if (care === 2) {
    // Most Beauty - Radiant bright ball
    return {
      fillColor: '#ffffff',
      glowColor: '#ffffff',
      glowBlur: 25,
      gradientStops: [
        { offset: 0, color: '#ffffff' }, // Bright white core
        { offset: 1, color: '#ffff66' }, // Yellow edge
      ],
    }
  }

  if (care === 3) {
    // Dream - Literal star (brightest, most radiant)
    return {
      fillColor: '#ffffff',
      glowColor: '#ffffaa',
      glowBlur: 40,
      gradientStops: [
        { offset: 0, color: '#ffffff' }, // Bright white core
        { offset: 0.5, color: '#ffff99' }, // Yellow mid
        { offset: 1, color: '#ffdd44' }, // Golden edge
      ],
    }
  }

  // Fallback to neutral
  return {
    fillColor: '#888888',
    glowColor: '#888888',
    glowBlur: 0,
    gradientStops: [
      { offset: 0, color: '#888888' },
      { offset: 1, color: '#555555' },
    ],
  }
}

/**
 * Get label and description for care level (for picker UI)
 */
export function getCareLabel(care: number): { label: string; description: string } {
  const labels: Record<string, { label: string; description: string }> = {
    '-2': { label: 'hate', description: 'Strong negative feeling' },
    '-1': { label: 'dislike', description: 'Mild negative feeling' },
    '0': { label: 'just care', description: 'No strong feeling' },
    '1': { label: 'like', description: 'Mild positive feeling' },
    '2': { label: 'love', description: 'Strong positive feeling' },
    '3': { label: 'dream', description: 'Deepest aspiration' },
  }

  return labels[care.toString()] || labels['0']
}
