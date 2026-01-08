/**
 * Tests for 2D Hexagonal Lattice Distribution
 */

import { describe, it, expect } from 'vitest'
import {
  distributeOnHexagonalLattice,
  calculateCircleRadius,
  addJitter,
} from '@/lib/my-reality/hexagonal-lattice-2d'

describe('hexagonal-lattice-2d', () => {
  describe('calculateCircleRadius', () => {
    it('should calculate radius based on maxBound', () => {
      expect(calculateCircleRadius(10)).toBe(500)
      expect(calculateCircleRadius(20)).toBe(1000)
      expect(calculateCircleRadius(100)).toBe(5000)
    })
  })

  describe('distributeOnHexagonalLattice', () => {
    it('should return empty array for 0 items', () => {
      const positions = distributeOnHexagonalLattice(0, 100)
      expect(positions).toEqual([])
    })

    it('should place first item at center', () => {
      const positions = distributeOnHexagonalLattice(1, 100)
      expect(positions).toHaveLength(1)
      expect(positions[0]).toEqual({ x: 0, y: 0 })
    })

    it('should create correct number of positions', () => {
      const positions = distributeOnHexagonalLattice(10, 100)
      expect(positions).toHaveLength(10)
    })

    it('should distribute items around center in rings', () => {
      const positions = distributeOnHexagonalLattice(7, 100)
      expect(positions).toHaveLength(7)

      // First position should be at center
      expect(positions[0]).toEqual({ x: 0, y: 0 })

      // Other positions should be in first ring
      for (let i = 1; i < 7; i++) {
        const distance = Math.sqrt(positions[i].x ** 2 + positions[i].y ** 2)
        expect(distance).toBeGreaterThan(0)
        expect(distance).toBeLessThanOrEqual(150) // Within first ring spacing
      }
    })

    it('should handle large numbers of items', () => {
      const positions = distributeOnHexagonalLattice(100, 100)
      expect(positions).toHaveLength(100)

      // All positions should have x and y coordinates
      positions.forEach((pos) => {
        expect(typeof pos.x).toBe('number')
        expect(typeof pos.y).toBe('number')
        expect(isNaN(pos.x)).toBe(false)
        expect(isNaN(pos.y)).toBe(false)
      })
    })
  })

  describe('addJitter', () => {
    it('should add random variation to positions', () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ]

      const jittered = addJitter(positions, 10)

      expect(jittered).toHaveLength(2)

      // Positions should be slightly different but close to originals
      expect(Math.abs(jittered[0].x - 0)).toBeLessThanOrEqual(5)
      expect(Math.abs(jittered[0].y - 0)).toBeLessThanOrEqual(5)
      expect(Math.abs(jittered[1].x - 100)).toBeLessThanOrEqual(5)
      expect(Math.abs(jittered[1].y - 100)).toBeLessThanOrEqual(5)
    })

    it('should not modify original array', () => {
      const positions = [{ x: 0, y: 0 }]
      const original = [...positions]

      addJitter(positions, 10)

      expect(positions).toEqual(original)
    })
  })
})
