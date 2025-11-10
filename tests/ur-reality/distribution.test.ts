/**
 * Unit Tests: Question mark distribution algorithm for /ur-reality
 */

import { distributeQuestionMarks } from '@/lib/ur-reality/distribute-question-marks'

describe('Question Mark Distribution Algorithm', () => {
  // Helper to create mock items
  const createItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({ id: `item-${i}` }))
  }

  describe('Predefined patterns (1-5 items)', () => {
    it('should center single item with large size', () => {
      const items = createItems(1)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(1)
      expect(distributed[0].position).toEqual({ x: 50, y: 50, size: 120 })
      expect(distributed[0].item.id).toBe('item-0')
    })

    it('should distribute 2 items left and right', () => {
      const items = createItems(2)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(2)
      expect(distributed[0].position).toEqual({ x: 30, y: 50, size: 100 })
      expect(distributed[1].position).toEqual({ x: 70, y: 50, size: 100 })
    })

    it('should distribute 3 items in thirds', () => {
      const items = createItems(3)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(3)
      expect(distributed[0].position).toEqual({ x: 25, y: 50, size: 80 })
      expect(distributed[1].position).toEqual({ x: 50, y: 50, size: 80 })
      expect(distributed[2].position).toEqual({ x: 75, y: 50, size: 80 })
    })

    it('should distribute 4 items in quadrants', () => {
      const items = createItems(4)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(4)
      expect(distributed[0].position).toEqual({ x: 30, y: 30, size: 70 })
      expect(distributed[1].position).toEqual({ x: 70, y: 30, size: 70 })
      expect(distributed[2].position).toEqual({ x: 30, y: 70, size: 70 })
      expect(distributed[3].position).toEqual({ x: 70, y: 70, size: 70 })
    })

    it('should distribute 5 items in quadrants + center', () => {
      const items = createItems(5)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(5)
      expect(distributed[0].position).toEqual({ x: 25, y: 25, size: 60 })
      expect(distributed[1].position).toEqual({ x: 75, y: 25, size: 60 })
      expect(distributed[2].position).toEqual({ x: 50, y: 50, size: 60 })
      expect(distributed[3].position).toEqual({ x: 25, y: 75, size: 60 })
      expect(distributed[4].position).toEqual({ x: 75, y: 75, size: 60 })
    })
  })

  describe('Random spread (6+ items)', () => {
    it('should distribute 6 items with smaller size', () => {
      const items = createItems(6)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(6)
      distributed.forEach(d => {
        expect(d.position.size).toBeLessThan(100)
      })
    })

    it('should distribute 10 items without overlap', () => {
      const items = createItems(10)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(10)

      // Check no exact overlaps (simplified check)
      const positions = distributed.map(d => `${d.position.x},${d.position.y}`)
      const uniquePositions = new Set(positions)
      expect(uniquePositions.size).toBe(10)
    })

    it('should scale down size as count increases', () => {
      const items10 = createItems(10)
      const items20 = createItems(20)

      const distributed10 = distributeQuestionMarks(items10)
      const distributed20 = distributeQuestionMarks(items20)

      const avgSize10 = distributed10.reduce((sum, d) => sum + d.position.size, 0) / 10
      const avgSize20 = distributed20.reduce((sum, d) => sum + d.position.size, 0) / 20

      expect(avgSize20).toBeLessThan(avgSize10)
    })

    it('should keep positions within boundaries (10-90%)', () => {
      const items = createItems(20)
      const distributed = distributeQuestionMarks(items)

      distributed.forEach(d => {
        expect(d.position.x).toBeGreaterThanOrEqual(10)
        expect(d.position.x).toBeLessThanOrEqual(90)
        expect(d.position.y).toBeGreaterThanOrEqual(10)
        expect(d.position.y).toBeLessThanOrEqual(90)
      })
    })

    it('should maintain minimum size threshold', () => {
      const items = createItems(50)
      const distributed = distributeQuestionMarks(items)

      distributed.forEach(d => {
        expect(d.position.size).toBeGreaterThanOrEqual(30)
      })
    })
  })

  describe('Item association', () => {
    it('should preserve item data in distributed output', () => {
      const items = [
        { id: 'a', data: 'foo' },
        { id: 'b', data: 'bar' },
        { id: 'c', data: 'baz' }
      ]

      const distributed = distributeQuestionMarks(items)

      expect(distributed[0].item).toEqual({ id: 'a', data: 'foo' })
      expect(distributed[1].item).toEqual({ id: 'b', data: 'bar' })
      expect(distributed[2].item).toEqual({ id: 'c', data: 'baz' })
    })

    it('should maintain item order in output', () => {
      const items = createItems(5)
      const distributed = distributeQuestionMarks(items)

      distributed.forEach((d, i) => {
        expect(d.item.id).toBe(`item-${i}`)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const distributed = distributeQuestionMarks([])
      expect(distributed).toHaveLength(0)
    })

    it('should handle large numbers gracefully', () => {
      const items = createItems(100)
      const distributed = distributeQuestionMarks(items)

      expect(distributed).toHaveLength(100)
      // Should not throw or hang
    })
  })
})
