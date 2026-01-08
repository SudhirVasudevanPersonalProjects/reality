/**
 * Tests for Intro Animation (Story 5.1)
 * Page Load Animation & Spaceship Appearance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { animateIntroZoom } from '@/lib/my-reality/intro-animation'
import type { Camera2D } from '@/lib/my-reality/render-2d-scene'

describe('intro-animation', () => {
  let mockSetCamera: ReturnType<typeof vi.fn>
  let mockOnComplete: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetCamera = vi.fn()
    mockOnComplete = vi.fn()

    // Mock requestAnimationFrame and cancelAnimationFrame
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('animateIntroZoom', () => {
    it('should start animation at zoom 0.1 and pause', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      // Advance a small amount of time during pause phase
      vi.advanceTimersByTime(100)

      // Should have called setCamera with a zoom value
      expect(mockSetCamera).toHaveBeenCalled()

      // Get the first call's updater function
      const updateFn = mockSetCamera.mock.calls[0][0]
      const prevCamera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const newCamera = updateFn(prevCamera)

      // During pause phase, zoom should stay at 0.1
      expect(newCamera.zoom).toBe(0.1)
    })

    it('should end animation at zoom 1.0', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      // Advance to end of animation (5500ms = 2500ms pause + 3000ms zoom)
      vi.advanceTimersByTime(5500)

      // Get the last call's updater function
      const calls = mockSetCamera.mock.calls
      const lastCall = calls[calls.length - 1]
      const updateFn = lastCall[0]
      const prevCamera: Camera2D = { x: 0, y: 0, zoom: 0.5 }
      const newCamera = updateFn(prevCamera)

      // Zoom should be 1.0 or very close to it
      expect(newCamera.zoom).toBeCloseTo(1.0, 1)
    })

    it('should call onComplete callback when animation finishes', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      // onComplete should not be called yet
      expect(mockOnComplete).not.toHaveBeenCalled()

      // Advance to end of animation (5500ms + buffer)
      vi.advanceTimersByTime(5600)

      // onComplete should have been called
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })

    it('should preserve x and y coordinates during animation', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      vi.advanceTimersByTime(1000)

      // Get an update function call
      const updateFn = mockSetCamera.mock.calls[0][0]
      const prevCamera: Camera2D = { x: 100, y: 200, zoom: 0.5 }
      const newCamera = updateFn(prevCamera)

      // x and y should remain unchanged
      expect(newCamera.x).toBe(100)
      expect(newCamera.y).toBe(200)
      // Only zoom should change
      expect(newCamera.zoom).not.toBe(0.5)
    })

    it('should pause for 2.5s then zoom with easing over 3s', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      // Test pause phase - zoom stays at 0.1
      vi.advanceTimersByTime(100)
      let updateFn = mockSetCamera.mock.calls[mockSetCamera.mock.calls.length - 1][0]
      let prevCamera: Camera2D = { x: 0, y: 0, zoom: 0.5 }
      let newCamera = updateFn(prevCamera)
      expect(newCamera.zoom).toBe(0.1) // t=100, still pausing

      mockSetCamera.mockClear()
      vi.advanceTimersByTime(1000) // now at t=1100
      updateFn = mockSetCamera.mock.calls[mockSetCamera.mock.calls.length - 1][0]
      newCamera = updateFn(prevCamera)
      expect(newCamera.zoom).toBe(0.1) // still pausing

      mockSetCamera.mockClear()
      vi.advanceTimersByTime(1300) // now at t=2400
      updateFn = mockSetCamera.mock.calls[mockSetCamera.mock.calls.length - 1][0]
      newCamera = updateFn(prevCamera)
      expect(newCamera.zoom).toBe(0.1) // still pausing

      // Test zoom phase - zoom increases from 0.1 to 1.0
      mockSetCamera.mockClear()
      vi.advanceTimersByTime(1000) // now at t=3400 (900ms into zoom)
      updateFn = mockSetCamera.mock.calls[mockSetCamera.mock.calls.length - 1][0]
      newCamera = updateFn(prevCamera)
      expect(newCamera.zoom).toBeGreaterThan(0.1) // zooming now
      expect(newCamera.zoom).toBeLessThan(1.0)

      const midZoom = newCamera.zoom

      mockSetCamera.mockClear()
      vi.advanceTimersByTime(1000) // now at t=4400 (1900ms into zoom)
      updateFn = mockSetCamera.mock.calls[mockSetCamera.mock.calls.length - 1][0]
      newCamera = updateFn(prevCamera)
      expect(newCamera.zoom).toBeGreaterThan(midZoom) // still increasing
      expect(newCamera.zoom).toBeLessThan(1.0)

      mockSetCamera.mockClear()
      vi.advanceTimersByTime(1200) // now at t=5600 (animation complete)
      updateFn = mockSetCamera.mock.calls[mockSetCamera.mock.calls.length - 1][0]
      newCamera = updateFn(prevCamera)
      expect(newCamera.zoom).toBeCloseTo(1.0, 1) // reached end
    })

    it('should return cleanup function that cancels animation', () => {
      const cleanup = animateIntroZoom(mockSetCamera, mockOnComplete)

      // Animation should be running
      vi.advanceTimersByTime(500)
      expect(mockSetCamera).toHaveBeenCalled()

      // Clear the mock
      mockSetCamera.mockClear()

      // Call cleanup
      cleanup()

      // Advance time further
      vi.advanceTimersByTime(1000)

      // setCamera should not be called again after cleanup
      expect(mockSetCamera).not.toHaveBeenCalled()
      expect(mockOnComplete).not.toHaveBeenCalled()
    })

    it('should handle animation duration of approximately 5.5 seconds (2.5s pause + 3s zoom)', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      // Before 5.5 seconds, onComplete should not be called
      vi.advanceTimersByTime(5400)
      expect(mockOnComplete).not.toHaveBeenCalled()

      // After 5.5 seconds, onComplete should be called
      vi.advanceTimersByTime(200)
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })

    it('should not exceed zoom 1.0 even with extra time', () => {
      animateIntroZoom(mockSetCamera, mockOnComplete)

      // Advance well past animation duration
      vi.advanceTimersByTime(5000)

      // Get the last call's updater function
      const calls = mockSetCamera.mock.calls
      const lastCall = calls[calls.length - 1]
      const updateFn = lastCall[0]
      const prevCamera: Camera2D = { x: 0, y: 0, zoom: 0.5 }
      const newCamera = updateFn(prevCamera)

      // Zoom should not exceed 1.0
      expect(newCamera.zoom).toBeLessThanOrEqual(1.0)
    })
  })

  describe('sessionStorage integration', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const sessionStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      }
      Object.defineProperty(window, 'sessionStorage', {
        value: sessionStorageMock,
        writable: true,
      })
    })

    it('should set sessionStorage after animation completes', () => {
      animateIntroZoom(mockSetCamera, () => {
        sessionStorage.setItem('intro-played', 'true')
        mockOnComplete()
      })

      // Complete animation (5500ms + buffer)
      vi.advanceTimersByTime(5600)

      // sessionStorage should be set
      expect(sessionStorage.setItem).toHaveBeenCalledWith('intro-played', 'true')
      expect(mockOnComplete).toHaveBeenCalled()
    })

    it('should check sessionStorage before playing animation', () => {
      const mockGetItem = vi.fn()
      sessionStorage.getItem = mockGetItem

      // Simulate intro already played
      mockGetItem.mockReturnValue('true')

      const hasPlayed = sessionStorage.getItem('intro-played') === 'true'

      expect(hasPlayed).toBe(true)
      expect(mockGetItem).toHaveBeenCalledWith('intro-played')
    })
  })
})
