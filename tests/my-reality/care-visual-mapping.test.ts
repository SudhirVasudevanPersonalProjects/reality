/**
 * Tests for Care Visual Mapping
 */

import { describe, it, expect } from 'vitest'
import { getCareVisual, getCareLabel } from '@/lib/my-reality/care-visual-mapping'

describe('care-visual-mapping', () => {
  describe('getCareVisual', () => {
    it('should return neutral visual for null care', () => {
      const visual = getCareVisual(null)
      expect(visual.fillColor).toBe('#888888')
      expect(visual.glowBlur).toBe(0)
    })

    it('should return neutral visual for 0 care', () => {
      const visual = getCareVisual(0)
      expect(visual.fillColor).toBe('#888888')
      expect(visual.glowBlur).toBe(0)
    })

    it('should return dark radiant visual for -2 care', () => {
      const visual = getCareVisual(-2)
      expect(visual.fillColor).toBe('#1a0a2e')
      expect(visual.glowColor).toBe('#1a0a2e')
      expect(visual.glowBlur).toBe(20)
      expect(visual.gradientStops).toHaveLength(2)
    })

    it('should return dim dark visual for -1 care', () => {
      const visual = getCareVisual(-1)
      expect(visual.fillColor).toBe('#3a3a3a')
      expect(visual.glowBlur).toBe(5)
    })

    it('should return dim bright visual for +1 care', () => {
      const visual = getCareVisual(1)
      expect(visual.fillColor).toBe('#ffffcc')
      expect(visual.glowBlur).toBe(10)
    })

    it('should return bright radiant visual for +2 care', () => {
      const visual = getCareVisual(2)
      expect(visual.fillColor).toBe('#ffffff')
      expect(visual.glowColor).toBe('#ffffff')
      expect(visual.glowBlur).toBe(25)
      expect(visual.gradientStops).toHaveLength(2)
    })

    it('should have gradient stops for all care levels', () => {
      const careLevels = [-2, -1, 0, 1, 2, null]

      careLevels.forEach((care) => {
        const visual = getCareVisual(care)
        expect(visual.gradientStops).toBeDefined()
        expect(visual.gradientStops.length).toBeGreaterThan(0)
        visual.gradientStops.forEach((stop) => {
          expect(stop.offset).toBeGreaterThanOrEqual(0)
          expect(stop.offset).toBeLessThanOrEqual(1)
          expect(typeof stop.color).toBe('string')
        })
      })
    })
  })

  describe('getCareLabel', () => {
    it('should return correct label for -2', () => {
      const { label, description } = getCareLabel(-2)
      expect(label).toBe('Most Ugly')
      expect(description).toBe('Strong negative feeling')
    })

    it('should return correct label for -1', () => {
      const { label, description } = getCareLabel(-1)
      expect(label).toBe('Ugly')
      expect(description).toBe('Mild negative feeling')
    })

    it('should return correct label for 0', () => {
      const { label, description } = getCareLabel(0)
      expect(label).toBe('Neutral')
      expect(description).toBe('No strong feeling')
    })

    it('should return correct label for +1', () => {
      const { label, description } = getCareLabel(1)
      expect(label).toBe('Beauty')
      expect(description).toBe('Mild positive feeling')
    })

    it('should return correct label for +2', () => {
      const { label, description } = getCareLabel(2)
      expect(label).toBe('Most Beauty')
      expect(description).toBe('Strong positive feeling')
    })

    it('should handle invalid values with fallback to neutral', () => {
      const { label } = getCareLabel(999 as any)
      expect(label).toBe('Neutral')
    })
  })
})
