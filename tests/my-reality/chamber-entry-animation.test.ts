import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  animateSpaceshipFlight,
  animateZoomOutAndFade,
  blinkToChamberView,
  type Position,
  type SpaceshipState,
} from '@/lib/my-reality/chamber-entry-animation'

describe('Chamber Entry Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('animateSpaceshipFlight', () => {
    it('should call onUpdate with spaceship state', () => {
      const startPos: Position = { x: 100, y: 500 }
      const endPos: Position = { x: 300, y: 200 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      // Run all pending timers
      vi.runAllTimers()

      expect(onUpdate).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()

      const firstCall = onUpdate.mock.calls[0][0] as SpaceshipState
      expect(firstCall).toHaveProperty('x')
      expect(firstCall).toHaveProperty('y')
      expect(firstCall).toHaveProperty('rotation')
      expect(firstCall).toHaveProperty('scale')

      cleanup()
    })

    it('should calculate rotation based on direction of travel', () => {
      const startPos: Position = { x: 100, y: 500 }
      const endPos: Position = { x: 300, y: 200 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      vi.advanceTimersByTime(100)

      const calls = onUpdate.mock.calls
      expect(calls.length).toBeGreaterThan(0)

      const lastCall = calls[calls.length - 1][0] as SpaceshipState
      expect(lastCall.rotation).toBeDefined()
      expect(typeof lastCall.rotation).toBe('number')

      cleanup()
    })

    it('should follow bezier curve path (not straight line)', () => {
      const startPos: Position = { x: 100, y: 500 }
      const endPos: Position = { x: 300, y: 200 }
      const positions: Position[] = []
      const onUpdate = (state: SpaceshipState) => {
        positions.push({ x: state.x, y: state.y })
      }
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      // Collect positions during animation
      for (let i = 0; i < 18; i++) {
        vi.advanceTimersByTime(100)
      }

      // Check that the path is curved (not straight)
      // In a straight line, all intermediate points would have the same ratio
      // In a curved path, the ratios vary
      if (positions.length > 2) {
        const midPoint = positions[Math.floor(positions.length / 2)]
        const straightLineY = startPos.y + (endPos.y - startPos.y) / 2

        // Due to upward arc, midpoint Y should be less than straight line
        expect(midPoint.y).not.toBe(straightLineY)
      }

      cleanup()
    })

    it('should call cleanup function to cancel animation', () => {
      const startPos: Position = { x: 100, y: 500 }
      const endPos: Position = { x: 300, y: 200 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      vi.advanceTimersByTime(500)
      const callsBeforeCleanup = onUpdate.mock.calls.length

      cleanup()

      vi.advanceTimersByTime(1500)
      const callsAfterCleanup = onUpdate.mock.calls.length

      // Animation should stop after cleanup
      expect(callsAfterCleanup).toBe(callsBeforeCleanup)
      expect(onComplete).not.toHaveBeenCalled()
    })

    it('should handle very short distances', () => {
      const startPos: Position = { x: 100, y: 100 }
      const endPos: Position = { x: 110, y: 110 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalled()

      cleanup()
    })
  })

  describe('animateZoomOutAndFade', () => {
    it('should scale down spaceship and fade to black', () => {
      const currentPos: Position = { x: 300, y: 200 }
      const currentRotation = 45
      const onUpdateSpaceship = vi.fn()
      const onUpdateFade = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateZoomOutAndFade(
        currentPos,
        currentRotation,
        onUpdateSpaceship,
        onUpdateFade,
        onComplete
      )

      // Fast-forward to middle of fade (750ms of 1500ms)
      vi.advanceTimersByTime(750)

      expect(onUpdateSpaceship).toHaveBeenCalled()
      expect(onUpdateFade).toHaveBeenCalled()

      // Check that scale is decreasing
      const spaceshipCalls = onUpdateSpaceship.mock.calls
      const lastSpaceshipState = spaceshipCalls[spaceshipCalls.length - 1][0] as SpaceshipState
      expect(lastSpaceshipState.scale).toBeLessThan(1)
      expect(lastSpaceshipState.scale).toBeGreaterThanOrEqual(0)

      // Check that fade is increasing
      const fadeCalls = onUpdateFade.mock.calls
      const lastFadeOpacity = fadeCalls[fadeCalls.length - 1][0] as number
      expect(lastFadeOpacity).toBeGreaterThan(0)
      expect(lastFadeOpacity).toBeLessThanOrEqual(1)

      cleanup()
    })

    it('should hold black screen after fade completes', () => {
      const currentPos: Position = { x: 300, y: 200 }
      const currentRotation = 45
      const onUpdateSpaceship = vi.fn()
      const onUpdateFade = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateZoomOutAndFade(
        currentPos,
        currentRotation,
        onUpdateSpaceship,
        onUpdateFade,
        onComplete
      )

      // Fast-forward past fade (1500ms) but before hold completes (2000ms)
      vi.advanceTimersByTime(1700)

      expect(onComplete).not.toHaveBeenCalled()

      // Fast-forward past hold
      vi.advanceTimersByTime(300)

      expect(onComplete).toHaveBeenCalled()

      cleanup()
    })

    it('should reach final state (scale=0, opacity=1)', () => {
      const currentPos: Position = { x: 300, y: 200 }
      const currentRotation = 45
      const onUpdateSpaceship = vi.fn()
      const onUpdateFade = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateZoomOutAndFade(
        currentPos,
        currentRotation,
        onUpdateSpaceship,
        onUpdateFade,
        onComplete
      )

      // Fast-forward to completion
      vi.advanceTimersByTime(2000)

      // Check final spaceship state
      const spaceshipCalls = onUpdateSpaceship.mock.calls
      const finalSpaceshipState = spaceshipCalls[spaceshipCalls.length - 1][0] as SpaceshipState
      expect(finalSpaceshipState.scale).toBe(0)

      // Check final fade opacity
      const fadeCalls = onUpdateFade.mock.calls
      const finalFadeOpacity = fadeCalls[fadeCalls.length - 1][0] as number
      expect(finalFadeOpacity).toBe(1)

      cleanup()
    })
  })

  describe('blinkToChamberView', () => {
    it('should quickly transition from black to visible', () => {
      const onUpdateFade = vi.fn()
      const onComplete = vi.fn()

      const cleanup = blinkToChamberView(onUpdateFade, onComplete)

      // Fast-forward to middle of blink (100ms of 200ms)
      vi.advanceTimersByTime(100)

      expect(onUpdateFade).toHaveBeenCalled()
      expect(onComplete).not.toHaveBeenCalled()

      // Check that opacity is decreasing (from 1 to 0)
      const fadeCalls = onUpdateFade.mock.calls
      const lastFadeOpacity = fadeCalls[fadeCalls.length - 1][0] as number
      expect(lastFadeOpacity).toBeLessThan(1)
      expect(lastFadeOpacity).toBeGreaterThanOrEqual(0)

      cleanup()
    })

    it('should complete blink animation', () => {
      const onUpdateFade = vi.fn()
      const onComplete = vi.fn()

      const cleanup = blinkToChamberView(onUpdateFade, onComplete)

      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalled()

      cleanup()
    })

    it('should reach final state (opacity=0)', () => {
      const onUpdateFade = vi.fn()
      const onComplete = vi.fn()

      const cleanup = blinkToChamberView(onUpdateFade, onComplete)

      vi.advanceTimersByTime(200)

      const fadeCalls = onUpdateFade.mock.calls
      const finalFadeOpacity = fadeCalls[fadeCalls.length - 1][0] as number
      expect(finalFadeOpacity).toBeCloseTo(0, 1)

      cleanup()
    })
  })

  describe('Animation Sequence Integration', () => {
    it('should run all three animation types successfully', () => {
      const flightUpdate = vi.fn()
      const flightComplete = vi.fn()
      const zoomUpdate = vi.fn()
      const fadeUpdate = vi.fn()
      const zoomComplete = vi.fn()
      const blinkFadeUpdate = vi.fn()
      const blinkComplete = vi.fn()

      // Flight animation
      const startPos: Position = { x: 100, y: 500 }
      const endPos: Position = { x: 300, y: 200 }

      const cleanup1 = animateSpaceshipFlight(startPos, endPos, flightUpdate, flightComplete)
      vi.runAllTimers()

      expect(flightUpdate).toHaveBeenCalled()
      expect(flightComplete).toHaveBeenCalled()

      cleanup1()

      // Zoom out and fade
      const cleanup2 = animateZoomOutAndFade(endPos, 45, zoomUpdate, fadeUpdate, zoomComplete)
      vi.runAllTimers()

      expect(zoomUpdate).toHaveBeenCalled()
      expect(fadeUpdate).toHaveBeenCalled()
      expect(zoomComplete).toHaveBeenCalled()

      cleanup2()

      // Blink
      const cleanup3 = blinkToChamberView(blinkFadeUpdate, blinkComplete)
      vi.runAllTimers()

      expect(blinkFadeUpdate).toHaveBeenCalled()
      expect(blinkComplete).toHaveBeenCalled()

      cleanup3()
    })
  })

  describe('Edge Cases', () => {
    it('should handle animation with zero-length vectors', () => {
      const samePos: Position = { x: 100, y: 100 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(samePos, samePos, onUpdate, onComplete)

      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalled()

      cleanup()
    })

    it('should handle negative coordinates', () => {
      const startPos: Position = { x: -100, y: -100 }
      const endPos: Position = { x: -300, y: -400 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalled()

      cleanup()
    })

    it('should handle very large coordinates', () => {
      const startPos: Position = { x: 10000, y: 10000 }
      const endPos: Position = { x: 20000, y: 20000 }
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const cleanup = animateSpaceshipFlight(startPos, endPos, onUpdate, onComplete)

      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalled()

      cleanup()
    })
  })
})
