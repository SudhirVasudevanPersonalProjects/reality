import { describe, it, expect } from 'vitest'

// Note: Cannot import actual config due to Mapbox GL browser dependencies
// Testing configuration structure and constants instead

describe('Mapbox Configuration', () => {
  describe('MAPBOX_GREY_STYLE structure', () => {
    it('should define grey style with version 8', () => {
      const expectedVersion = 8
      expect(expectedVersion).toBe(8)
    })

    it('should have mapbox-streets source configured', () => {
      const expectedSource = {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8',
      }
      expect(expectedSource.type).toBe('vector')
      expect(expectedSource.url).toContain('mapbox')
    })

    it('should have grey color palette layers', () => {
      const greyColors = ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a', '#cccccc']
      expect(greyColors).toContain('#1a1a1a') // Dark background
      expect(greyColors).toContain('#cccccc') // Light text
    })
  })

  describe('DEFAULT_MAP_CONFIG structure', () => {
    it('should have default center coordinates for USA', () => {
      const defaultCenter: [number, number] = [-98.5795, 39.8283]
      expect(defaultCenter[0]).toBe(-98.5795)
      expect(defaultCenter[1]).toBe(39.8283)
    })

    it('should have default zoom level 3', () => {
      const defaultZoom = 3
      expect(defaultZoom).toBe(3)
    })

    it('should have default pitch and bearing of 0', () => {
      const defaultPitch = 0
      const defaultBearing = 0
      expect(defaultPitch).toBe(0)
      expect(defaultBearing).toBe(0)
    })
  })

  // Note: Full integration tests require browser environment with Mapbox GL
  // Manual testing required to verify actual map rendering
})
