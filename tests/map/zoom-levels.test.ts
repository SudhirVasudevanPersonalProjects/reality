import { describe, it, expect } from 'vitest'
import {
  ZoomLevel,
  ZOOM_RANGES,
  getZoomLevelName,
  getZoomLevelDisplayText,
} from '@/lib/mapbox/zoom-levels'

describe('Zoom Levels', () => {
  describe('ZOOM_RANGES constants', () => {
    it('should define correct zoom ranges for World', () => {
      expect(ZOOM_RANGES[ZoomLevel.World]).toEqual({ min: 0, max: 2 })
    })

    it('should define correct zoom ranges for Continent', () => {
      expect(ZOOM_RANGES[ZoomLevel.Continent]).toEqual({ min: 3, max: 4 })
    })

    it('should define correct zoom ranges for Country', () => {
      expect(ZOOM_RANGES[ZoomLevel.Country]).toEqual({ min: 5, max: 6 })
    })

    it('should define correct zoom ranges for State', () => {
      expect(ZOOM_RANGES[ZoomLevel.State]).toEqual({ min: 7, max: 9 })
    })

    it('should define correct zoom ranges for City', () => {
      expect(ZOOM_RANGES[ZoomLevel.City]).toEqual({ min: 10, max: 13 })
    })

    it('should define correct zoom ranges for Street', () => {
      expect(ZOOM_RANGES[ZoomLevel.Street]).toEqual({ min: 14, max: 16 })
    })

    it('should define correct zoom ranges for Building', () => {
      expect(ZOOM_RANGES[ZoomLevel.Building]).toEqual({ min: 17, max: 20 })
    })
  })

  describe('getZoomLevelName', () => {
    it('should return World for zoom 0-2', () => {
      expect(getZoomLevelName(0)).toBe(ZoomLevel.World)
      expect(getZoomLevelName(1)).toBe(ZoomLevel.World)
      expect(getZoomLevelName(2)).toBe(ZoomLevel.World)
    })

    it('should return Continent for zoom 3-4', () => {
      expect(getZoomLevelName(3)).toBe(ZoomLevel.Continent)
      expect(getZoomLevelName(4)).toBe(ZoomLevel.Continent)
    })

    it('should return Country for zoom 5-6', () => {
      expect(getZoomLevelName(5)).toBe(ZoomLevel.Country)
      expect(getZoomLevelName(6)).toBe(ZoomLevel.Country)
    })

    it('should return State for zoom 7-9', () => {
      expect(getZoomLevelName(7)).toBe(ZoomLevel.State)
      expect(getZoomLevelName(8)).toBe(ZoomLevel.State)
      expect(getZoomLevelName(9)).toBe(ZoomLevel.State)
    })

    it('should return City for zoom 10-13', () => {
      expect(getZoomLevelName(10)).toBe(ZoomLevel.City)
      expect(getZoomLevelName(11)).toBe(ZoomLevel.City)
      expect(getZoomLevelName(12)).toBe(ZoomLevel.City)
      expect(getZoomLevelName(13)).toBe(ZoomLevel.City)
    })

    it('should return Street for zoom 14-16', () => {
      expect(getZoomLevelName(14)).toBe(ZoomLevel.Street)
      expect(getZoomLevelName(15)).toBe(ZoomLevel.Street)
      expect(getZoomLevelName(16)).toBe(ZoomLevel.Street)
    })

    it('should return Building for zoom 17+', () => {
      expect(getZoomLevelName(17)).toBe(ZoomLevel.Building)
      expect(getZoomLevelName(18)).toBe(ZoomLevel.Building)
      expect(getZoomLevelName(20)).toBe(ZoomLevel.Building)
    })
  })

  describe('getZoomLevelDisplayText', () => {
    it('should return correct display text for each zoom level', () => {
      expect(getZoomLevelDisplayText(0)).toBe('World View')
      expect(getZoomLevelDisplayText(3)).toBe('Continent View')
      expect(getZoomLevelDisplayText(5)).toBe('Country View')
      expect(getZoomLevelDisplayText(8)).toBe('State View')
      expect(getZoomLevelDisplayText(12)).toBe('City View')
      expect(getZoomLevelDisplayText(15)).toBe('Street View')
      expect(getZoomLevelDisplayText(18)).toBe('Building View')
    })
  })
})
