/**
 * Unit Tests: Content positioning logic for /ur-reality
 */

import { calculateContentPosition, ViewportDimensions } from '@/lib/ur-reality/position-content'

describe('Content Positioning Logic', () => {
  const viewport: ViewportDimensions = {
    width: 1920,
    height: 1080
  }

  describe('Basic positioning', () => {
    it('should position content underneath question mark by default', () => {
      const pos = calculateContentPosition(
        50, // x (center)
        50, // y (center)
        100, // size
        viewport
      )

      expect(pos.top).toBeGreaterThan(viewport.height / 2) // Below center
      expect(pos.left).toBeGreaterThan(0)
      expect(pos.left).toBeLessThan(viewport.width)
    })

    it('should center content horizontally under question mark', () => {
      const pos = calculateContentPosition(
        50, // x (center)
        30, // y
        80, // size
        viewport,
        400 // contentMaxWidth
      )

      const qmCenterX = (50 / 100) * viewport.width
      const expectedLeft = qmCenterX - 400 / 2

      expect(pos.left).toBeCloseTo(expectedLeft, 0)
    })

    it('should add offset below question mark', () => {
      const qmY = 40
      const qmSize = 100
      const qmBottomPixels = (qmY / 100) * viewport.height + qmSize

      const pos = calculateContentPosition(qmY, 40, qmSize, viewport)

      expect(pos.top).toBeGreaterThan(qmBottomPixels)
    })
  })

  describe('Edge detection - horizontal', () => {
    it('should shift left when content would overflow right edge', () => {
      const pos = calculateContentPosition(
        95, // x (far right)
        50, // y
        80, // size
        viewport,
        400 // contentMaxWidth
      )

      // Should not overflow right edge
      expect(pos.left + 400).toBeLessThanOrEqual(viewport.width - 20)
    })

    it('should shift right when content would overflow left edge', () => {
      const pos = calculateContentPosition(
        5, // x (far left)
        50, // y
        80, // size
        viewport,
        400 // contentMaxWidth
      )

      // Should not overflow left edge
      expect(pos.left).toBeGreaterThanOrEqual(20)
    })

    it('should keep content within horizontal bounds', () => {
      const positions = [10, 30, 50, 70, 90]

      positions.forEach(x => {
        const pos = calculateContentPosition(x, 50, 100, viewport, 400)

        expect(pos.left).toBeGreaterThanOrEqual(20)
        expect(pos.left + pos.maxWidth).toBeLessThanOrEqual(viewport.width - 20)
      })
    })
  })

  describe('Edge detection - vertical', () => {
    it('should position above question mark when near bottom', () => {
      const qmY = 90 // Near bottom
      const qmSize = 80
      const qmTopPixels = (qmY / 100) * viewport.height

      const pos = calculateContentPosition(
        50, // x
        qmY, // y (near bottom)
        qmSize,
        viewport,
        400,
        300 // contentEstimatedHeight
      )

      // Should be above question mark
      expect(pos.top).toBeLessThan(qmTopPixels)
    })

    it('should clamp to top if content would overflow top', () => {
      const pos = calculateContentPosition(
        50, // x
        5, // y (very top)
        80, // size
        viewport,
        400,
        800 // very tall content
      )

      expect(pos.top).toBeGreaterThanOrEqual(20)
    })
  })

  describe('Content width adaptation', () => {
    it('should use maxWidth parameter when viewport is large', () => {
      const pos = calculateContentPosition(
        50, // x
        50, // y
        100, // size
        viewport,
        400 // contentMaxWidth
      )

      expect(pos.maxWidth).toBe(400)
    })

    it('should reduce maxWidth for small viewports', () => {
      const smallViewport: ViewportDimensions = {
        width: 600,
        height: 800
      }

      const pos = calculateContentPosition(
        50, // x
        50, // y
        100, // size
        smallViewport,
        400 // contentMaxWidth
      )

      // Should be smaller than requested (viewport.width - 40)
      expect(pos.maxWidth).toBeLessThan(400)
      expect(pos.maxWidth).toBe(smallViewport.width - 40)
    })
  })

  describe('Different question mark sizes', () => {
    it('should adjust position based on question mark size', () => {
      const smallQM = calculateContentPosition(50, 50, 50, viewport)
      const largeQM = calculateContentPosition(50, 50, 150, viewport)

      // Larger QM should push content further down
      expect(largeQM.top).toBeGreaterThan(smallQM.top)
    })
  })

  describe('Multiple viewport sizes', () => {
    const viewports: ViewportDimensions[] = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ]

    viewports.forEach(vp => {
      it(`should handle ${vp.width}x${vp.height} viewport`, () => {
        const pos = calculateContentPosition(
          50, // x
          50, // y
          80, // size
          vp,
          400
        )

        // Should stay within bounds
        expect(pos.left).toBeGreaterThanOrEqual(0)
        expect(pos.left + pos.maxWidth).toBeLessThanOrEqual(vp.width)
        expect(pos.top).toBeGreaterThanOrEqual(0)
        expect(pos.top).toBeLessThan(vp.height)
      })
    })
  })
})
