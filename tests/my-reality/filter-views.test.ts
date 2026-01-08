/**
 * Tests for Filter Views & Dimensional Travel functionality
 */

import { describe, it, expect } from 'vitest'
import { calculateCentroid } from '@/lib/my-reality/camera-animation'
import { calculateDepth, calculateAllDepths } from '@/lib/my-reality/depth-calculation'
import type { Something2D } from '@/lib/my-reality/render-2d-scene'

describe('Filter Matching Logic', () => {
  it('should match something with parent_id in active filters', () => {
    const something = {
      id: '1',
      parent_id: 'abode-beauty',
      text_content: 'Test',
    }
    const activeFilters = ['abode-beauty']

    // Simplified filter logic: check if parent_id is in activeFilters
    const matches = activeFilters.includes(something.parent_id || '')

    expect(matches).toBe(true)
  })

  it('should not match something without parent_id', () => {
    const something = {
      id: '1',
      parent_id: null,
      text_content: 'Test',
    }
    const activeFilters = ['abode-beauty']

    const matches = activeFilters.includes(something.parent_id || '')

    expect(matches).toBe(false)
  })

  it('should show all somethings when no filters active', () => {
    const somethings = [
      { id: '1', parent_id: 'abode-beauty' },
      { id: '2', parent_id: 'abode-ugly' },
      { id: '3', parent_id: null },
    ]
    const activeFilters: string[] = []

    // When no filters, all should be shown
    const filtered =
      activeFilters.length === 0
        ? somethings
        : somethings.filter((s) => activeFilters.includes(s.parent_id || ''))

    expect(filtered).toHaveLength(3)
  })

  it('should match OR logic for multiple filters (current implementation)', () => {
    const somethings = [
      { id: '1', parent_id: 'abode-beauty' },
      { id: '2', parent_id: 'abode-ugly' },
      { id: '3', parent_id: null },
    ]
    const activeFilters = ['abode-beauty', 'abode-ugly']

    const filtered = somethings.filter((s) => activeFilters.includes(s.parent_id || ''))

    expect(filtered).toHaveLength(2)
    expect(filtered.map((s) => s.id)).toEqual(['1', '2'])
  })
})

describe('Centroid Calculation', () => {
  it('should calculate centroid of multiple somethings', () => {
    const somethings: Something2D[] = [
      { id: '1', x: 0, y: 0, care: null, content: '', opacity: 1 },
      { id: '2', x: 10, y: 10, care: null, content: '', opacity: 1 },
      { id: '3', x: 20, y: 20, care: null, content: '', opacity: 1 },
    ]

    const centroid = calculateCentroid(somethings)

    expect(centroid.x).toBe(10)
    expect(centroid.y).toBe(10)
  })

  it('should return (0, 0) for empty array', () => {
    const somethings: Something2D[] = []

    const centroid = calculateCentroid(somethings)

    expect(centroid.x).toBe(0)
    expect(centroid.y).toBe(0)
  })

  it('should handle single something', () => {
    const somethings: Something2D[] = [
      { id: '1', x: 5, y: 15, care: null, content: '', opacity: 1 },
    ]

    const centroid = calculateCentroid(somethings)

    expect(centroid.x).toBe(5)
    expect(centroid.y).toBe(15)
  })

  it('should calculate centroid with negative coordinates', () => {
    const somethings: Something2D[] = [
      { id: '1', x: -10, y: -10, care: null, content: '', opacity: 1 },
      { id: '2', x: 10, y: 10, care: null, content: '', opacity: 1 },
    ]

    const centroid = calculateCentroid(somethings)

    expect(centroid.x).toBe(0)
    expect(centroid.y).toBe(0)
  })
})

describe('Depth Calculation', () => {
  it('should calculate depth 0 for something with no parent', () => {
    const somethings = [{ id: '1', parent_id: null }]

    const depth = calculateDepth('1', somethings)

    expect(depth).toBe(0)
  })

  it('should calculate depth 1 for something with one parent', () => {
    const somethings = [
      { id: '1', parent_id: null },
      { id: '2', parent_id: '1' },
    ]

    const depth = calculateDepth('2', somethings)

    expect(depth).toBe(1)
  })

  it('should calculate depth N for nested chain', () => {
    const somethings = [
      { id: '1', parent_id: null },
      { id: '2', parent_id: '1' },
      { id: '3', parent_id: '2' },
      { id: '4', parent_id: '3' },
    ]

    const depth = calculateDepth('4', somethings)

    expect(depth).toBe(3)
  })

  it('should handle circular references (sanity check)', () => {
    const somethings = [
      { id: '1', parent_id: '2' },
      { id: '2', parent_id: '1' },
    ]

    // Should break at depth limit (100)
    const depth = calculateDepth('1', somethings)

    expect(depth).toBeGreaterThan(0)
    expect(depth).toBeLessThanOrEqual(100)
  })

  it('should calculate all depths correctly', () => {
    const somethings = [
      { id: '1', parent_id: null },
      { id: '2', parent_id: '1' },
      { id: '3', parent_id: null },
    ]

    const depthMap = calculateAllDepths(somethings)

    expect(depthMap.get('1')).toBe(0)
    expect(depthMap.get('2')).toBe(1)
    expect(depthMap.get('3')).toBe(0)
  })
})
