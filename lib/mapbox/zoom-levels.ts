// Zoom level constants for different map scales
export enum ZoomLevel {
  World = 'World',
  Continent = 'Continent',
  Country = 'Country',
  State = 'State',
  City = 'City',
  Street = 'Street',
  Building = 'Building',
}

// Zoom range definitions
export const ZOOM_RANGES = {
  [ZoomLevel.World]: { min: 0, max: 2 },
  [ZoomLevel.Continent]: { min: 3, max: 4 },
  [ZoomLevel.Country]: { min: 5, max: 6 },
  [ZoomLevel.State]: { min: 7, max: 9 },
  [ZoomLevel.City]: { min: 10, max: 13 },
  [ZoomLevel.Street]: { min: 14, max: 16 },
  [ZoomLevel.Building]: { min: 17, max: 20 },
}

/**
 * Get zoom level name from numeric zoom value
 */
export function getZoomLevelName(zoom: number): ZoomLevel {
  if (zoom >= ZOOM_RANGES[ZoomLevel.Building].min) return ZoomLevel.Building
  if (zoom >= ZOOM_RANGES[ZoomLevel.Street].min) return ZoomLevel.Street
  if (zoom >= ZOOM_RANGES[ZoomLevel.City].min) return ZoomLevel.City
  if (zoom >= ZOOM_RANGES[ZoomLevel.State].min) return ZoomLevel.State
  if (zoom >= ZOOM_RANGES[ZoomLevel.Country].min) return ZoomLevel.Country
  if (zoom >= ZOOM_RANGES[ZoomLevel.Continent].min) return ZoomLevel.Continent
  return ZoomLevel.World
}

/**
 * Get display text for zoom level
 */
export function getZoomLevelDisplayText(zoom: number): string {
  const level = getZoomLevelName(zoom)
  return `${level} View`
}
