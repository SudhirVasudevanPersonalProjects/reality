/**
 * Tests for 2D Scene Rendering
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  worldToScreen,
  screenToWorld,
  detectClick,
  panCamera,
  zoomCamera,
  type Camera2D,
  type Something2D,
} from '@/lib/my-reality/render-2d-scene'

describe('render-2d-scene', () => {
  let mockCanvas: HTMLCanvasElement

  beforeEach(() => {
    mockCanvas = {
      width: 1000,
      height: 800,
    } as HTMLCanvasElement
  })

  describe('worldToScreen', () => {
    it('should convert world coordinates to screen coordinates', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const worldPos = { x: 0, y: 0 }

      const screenPos = worldToScreen(worldPos, camera, mockCanvas)

      expect(screenPos.x).toBe(500) // center X
      expect(screenPos.y).toBe(400) // center Y
    })

    it('should account for camera offset', () => {
      const camera: Camera2D = { x: 100, y: 50, zoom: 1.0 }
      const worldPos = { x: 100, y: 50 }

      const screenPos = worldToScreen(worldPos, camera, mockCanvas)

      expect(screenPos.x).toBe(500) // still centered
      expect(screenPos.y).toBe(400)
    })

    it('should account for zoom level', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 2.0 }
      const worldPos = { x: 100, y: 0 }

      const screenPos = worldToScreen(worldPos, camera, mockCanvas)

      expect(screenPos.x).toBe(700) // 500 + (100 * 2)
      expect(screenPos.y).toBe(400)
    })
  })

  describe('screenToWorld', () => {
    it('should convert screen coordinates to world coordinates', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const screenX = 500
      const screenY = 400

      const worldPos = screenToWorld(screenX, screenY, camera, mockCanvas)

      expect(worldPos.x).toBe(0)
      expect(worldPos.y).toBe(0)
    })

    it('should be inverse of worldToScreen', () => {
      const camera: Camera2D = { x: 50, y: 25, zoom: 1.5 }
      const originalWorld = { x: 200, y: 150 }

      const screen = worldToScreen(originalWorld, camera, mockCanvas)
      const backToWorld = screenToWorld(screen.x, screen.y, camera, mockCanvas)

      expect(Math.abs(backToWorld.x - originalWorld.x)).toBeLessThan(0.01)
      expect(Math.abs(backToWorld.y - originalWorld.y)).toBeLessThan(0.01)
    })
  })

  describe('detectClick', () => {
    it('should detect click on something at exact position', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const somethings: Something2D[] = [
        { id: 'test-1', x: 0, y: 0, care: null, content: '' },
      ]

      const screenPos = worldToScreen(somethings[0], camera, mockCanvas)
      const clickedId = detectClick(screenPos.x, screenPos.y, somethings, camera, mockCanvas)

      expect(clickedId).toBe('test-1')
    })

    it('should detect click within radius', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const somethings: Something2D[] = [
        { id: 'test-1', x: 0, y: 0, care: null, content: '' },
      ]

      const screenPos = worldToScreen(somethings[0], camera, mockCanvas)
      const clickedId = detectClick(screenPos.x + 10, screenPos.y + 10, somethings, camera, mockCanvas)

      expect(clickedId).toBe('test-1')
    })

    it('should return null when clicking outside all somethings', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const somethings: Something2D[] = [
        { id: 'test-1', x: 0, y: 0, care: null, content: '' },
      ]

      const clickedId = detectClick(0, 0, somethings, camera, mockCanvas)

      expect(clickedId).toBeNull()
    })

    it('should return topmost something when multiple overlap', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const somethings: Something2D[] = [
        { id: 'test-1', x: 0, y: 0, care: null, content: '' },
        { id: 'test-2', x: 0, y: 0, care: null, content: '' },
      ]

      const screenPos = worldToScreen(somethings[0], camera, mockCanvas)
      const clickedId = detectClick(screenPos.x, screenPos.y, somethings, camera, mockCanvas)

      expect(clickedId).toBe('test-2') // Last one in array
    })
  })

  describe('panCamera', () => {
    it('should move camera in opposite direction of delta', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }

      const newCamera = panCamera(camera, 100, 50)

      expect(newCamera.x).toBe(-100)
      expect(newCamera.y).toBe(-50)
    })

    it('should account for zoom level', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 2.0 }

      const newCamera = panCamera(camera, 100, 0)

      expect(newCamera.x).toBe(-50) // 100 / 2
    })

    it('should not modify original camera', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const original = { ...camera }

      panCamera(camera, 100, 50)

      expect(camera).toEqual(original)
    })
  })

  describe('zoomCamera', () => {
    it('should increase zoom on positive delta', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }

      const newCamera = zoomCamera(camera, 100)

      expect(newCamera.zoom).toBeGreaterThan(camera.zoom)
    })

    it('should decrease zoom on negative delta', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }

      const newCamera = zoomCamera(camera, -100)

      expect(newCamera.zoom).toBeLessThan(camera.zoom)
    })

    it('should respect minimum zoom', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 0.2 }

      const newCamera = zoomCamera(camera, 10000, 0.1, 2.0)

      expect(newCamera.zoom).toBeGreaterThanOrEqual(0.1)
    })

    it('should respect maximum zoom', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.8 }

      const newCamera = zoomCamera(camera, -10000, 0.1, 2.0)

      expect(newCamera.zoom).toBeLessThanOrEqual(2.0)
    })

    it('should not modify original camera', () => {
      const camera: Camera2D = { x: 0, y: 0, zoom: 1.0 }
      const original = { ...camera }

      zoomCamera(camera, -100)

      expect(camera).toEqual(original)
    })
  })
})
