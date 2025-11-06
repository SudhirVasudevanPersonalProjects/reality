import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Initialize Mapbox access token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

// Minimal "unknown world" style - light grey land, light blue water
// Future: visited places will reveal texture/labels
export const MAPBOX_GREY_STYLE: mapboxgl.Style = {
  version: 8,
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
    'composite': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#808080', // Light grey background (default land)
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#0b298e', // Dark blue for all water (oceans, lakes, ponds, rivers)
      },
    },
    // No roads, no borders, no labels, no buildings - completely minimal
    // Future: these will be added back for visited locations only
  ],
}

// Default map configuration
export const DEFAULT_MAP_CONFIG = {
  style: 'mapbox://styles/mapbox/streets-v12', // Use Mapbox default style with streets, labels, etc.
  center: [0, 20] as [number, number], // Center of world (showing continents)
  zoom: 2, // Continent level (World: 0-2, Continent: 3-4)
  pitch: 0, // Flat on initial load, user can tilt with pitch controls
  bearing: 0, // No rotation on initial load
  antialias: true, // Smooth 3D edges for building extrusions
  maxPitch: 60, // Allow pitch at street/building zoom for 3D effect
  minZoom: 2, // Can't zoom out past world view (same as Home button)
  maxZoom: 20,
}

// Export mapboxgl for use in components
export { mapboxgl }
