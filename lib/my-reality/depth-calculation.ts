/**
 * Depth Calculation for Somethings
 *
 * Calculates how deeply nested a something is based on parent chain
 */

interface Something {
  id: string
  parent_id: string | null
}

/**
 * Calculate depth by walking parent chain
 * Depth 0 = no parent (raw something)
 * Depth 1 = one parent level
 * Depth N = N parent levels
 */
export function calculateDepth(
  somethingId: string,
  allSomethings: Something[]
): number {
  let depth = 0
  let currentId: string | null = somethingId

  // Walk up the parent chain
  while (currentId) {
    const something = allSomethings.find((s) => s.id === currentId)

    if (!something || !something.parent_id) break

    depth++
    currentId = something.parent_id

    // Prevent infinite loops (sanity check)
    if (depth >= 100) {
      console.warn(`Depth calculation exceeded 100 levels for something ${somethingId}`)
      break
    }
  }

  return depth
}

/**
 * Calculate depth for all somethings
 * Returns a map of something ID to depth
 */
export function calculateAllDepths(
  somethings: Something[]
): Map<string, number> {
  const depthMap = new Map<string, number>()

  somethings.forEach((something) => {
    const depth = calculateDepth(something.id, somethings)
    depthMap.set(something.id, depth)
  })

  return depthMap
}
