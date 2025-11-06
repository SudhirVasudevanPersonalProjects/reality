import { ZoomLevel } from '@/lib/mapbox/zoom-levels'

/**
 * Props for MapView component
 */
export interface MapViewProps {
  initialCenter?: [number, number]
  initialZoom?: number
  onViewChange?: (center: [number, number], zoom: number) => void
}

/**
 * Props for Globe component
 */
export interface GlobeProps {
  onTransition: () => void
}

/**
 * Map state (center, zoom, bearing, pitch)
 */
export interface MapState {
  center: [number, number] // [lng, lat]
  zoom: number
  bearing: number // Rotation angle in degrees
  pitch: number // Tilt angle in degrees (0-60)
}

/**
 * Map view change event
 */
export interface MapViewChangeEvent {
  center: [number, number]
  zoom: number
  bearing?: number
  pitch?: number
}

/**
 * Zoom level type (re-export from zoom-levels)
 */
export type { ZoomLevel }
