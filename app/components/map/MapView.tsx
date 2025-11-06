'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mapboxgl, DEFAULT_MAP_CONFIG } from '@/lib/mapbox/config'
import { getZoomLevelDisplayText } from '@/lib/mapbox/zoom-levels'
import { LocationSearchBar } from './LocationSearchBar'
import { ExperienceListModal } from './ExperienceListModal'
import { MinimapHUD } from './MinimapHUD'
import { MapController } from './MapController'
import type { Database } from '@/lib/supabase/database.types'

type Something = Database['public']['Tables']['somethings']['Row']

interface MapViewProps {
  initialCenter?: [number, number]
  initialZoom?: number
  onViewChange?: (center: [number, number], zoom: number) => void
}

export function MapView({
  initialCenter,
  initialZoom,
  onViewChange,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentZoom, setCurrentZoom] = useState(
    initialZoom || DEFAULT_MAP_CONFIG.zoom
  )
  const [somethings, setSomethings] = useState<Something[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedExperiences, setSelectedExperiences] = useState<Something[]>([])
  const [selectedLocationName, setSelectedLocationName] = useState<string>('')
  const [showMinimap, setShowMinimap] = useState(false)
  const [showMoon, setShowMoon] = useState(false)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const router = useRouter()
  const searchParams = useSearchParams()
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentLocationRef = useRef<{
    text: string;
    center: [number, number];
  } | null>(null)

  // Track if this is the initial mount to avoid premature URL updates
  const isInitialMountRef = useRef(true)

  // Helper function to add 3D buildings (cityscape level)
  const add3DBuildingsLayer = useCallback((map: mapboxgl.Map) => {
    // Remove existing 3D building layer if any
    if (map.getLayer('add-3d-buildings')) {
      map.removeLayer('add-3d-buildings')
    }

    // Wait for map style to be fully loaded
    if (!map.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...')
      return
    }

    try {
      // Debug: Check available sources
      const style = map.getStyle()
      console.log('Available sources:', Object.keys(style.sources || {}))
      console.log('Composite source exists:', !!style.sources?.composite)

      // Find the first label layer to insert buildings below (markers render on top)
      const layers = style.layers
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id

      console.log('Label layer ID:', labelLayerId)

      // Add 3D building extrusions (visible at street zoom level 15+)
      map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#ffffff', // White buildings for high contrast
            'fill-extrusion-height': [
              'case',
              ['has', 'height'],
              ['get', 'height'], // Use actual height if available
              30, // Default 30m for buildings without height data
            ],
            'fill-extrusion-base': [
              'case',
              ['has', 'min_height'],
              ['get', 'min_height'],
              0,
            ],
            'fill-extrusion-opacity': 0.9, // Higher opacity for visibility
          },
        },
        labelLayerId
      )

      console.log('✅ 3D buildings layer added successfully at zoom >= 15')
    } catch (error) {
      console.error('❌ Error adding 3D buildings:', error)
    }
  }, [])

  // Helper function to add/remove space effects (sky + moon) based on zoom
  const toggleSpaceEffects = useCallback((map: mapboxgl.Map, zoom: number) => {
    const SPACE_ZOOM_THRESHOLD = 5 // Show space effects below zoom level 5 (continent/world view)

    if (zoom < SPACE_ZOOM_THRESHOLD) {
      // Add atmospheric sky layer
      if (!map.getLayer('sky')) {
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'gradient',
            'sky-gradient-center': [0, 0],
            'sky-gradient-radius': 90,
            'sky-gradient': [
              'interpolate',
              ['linear'],
              ['sky-radial-progress'],
              0.8,
              'rgba(0, 10, 30, 1)', // Deep space blue at horizon
              1,
              'rgba(0, 0, 10, 1)', // Darker at edges
            ],
            'sky-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              1, // Full opacity at world view
              4,
              0.5, // Fade as we zoom to continent
              SPACE_ZOOM_THRESHOLD,
              0, // Invisible at country level
            ],
          },
        })
      }
    } else {
      // Remove sky layer when zoomed in
      if (map.getLayer('sky')) {
        map.removeLayer('sky')
      }
    }
  }, [])

  // Helper function to add location label with coordinates
  const addLocationLabel = useCallback((map: mapboxgl.Map, location: { text: string; center: [number, number] }) => {
    // Remove existing labels if any
    if (map.getLayer('location-label')) map.removeLayer('location-label')
    if (map.getLayer('location-coords')) map.removeLayer('location-coords')
    if (map.getSource('location-label')) map.removeSource('location-label')

    // Add location label source
    map.addSource('location-label', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: location.center
        },
        properties: {
          name: location.text,
          coords: `${location.center[1].toFixed(4)}, ${location.center[0].toFixed(4)}` // lat, lng
        }
      }
    })

    // Add city name label (large)
    map.addLayer({
      id: 'location-label',
      type: 'symbol',
      source: 'location-label',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 28,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-offset': [0, -0.5]
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 3
      }
    })

    // Add coordinates label (small, below city name)
    map.addLayer({
      id: 'location-coords',
      type: 'symbol',
      source: 'location-label',
      layout: {
        'text-field': ['get', 'coords'],
        'text-size': 12,
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-offset': [0, 1.5]
      },
      paint: {
        'text-color': '#555555',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    })
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Check if Mapbox token is set
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
      setError('Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local')
      setLoading(false)
      return
    }

    try {
      // Read initial position directly to avoid dependency issues
      const lat = searchParams.get('lat')
      const lng = searchParams.get('lng')
      const zoom = searchParams.get('zoom')
      const pitch = searchParams.get('pitch')

      const zoomValue: number = zoom ? parseInt(zoom) : (initialZoom !== undefined ? initialZoom : DEFAULT_MAP_CONFIG.zoom)
      const pitchValue: number = pitch ? parseInt(pitch) : (zoomValue >= 15 ? 45 : 0)

      const center = (lat && lng
        ? [parseFloat(lng), parseFloat(lat)]
        : initialCenter || DEFAULT_MAP_CONFIG.center) as [number, number]

      // Initialize map
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: DEFAULT_MAP_CONFIG.style as any,
        center,
        zoom: zoomValue,
        pitch: pitchValue, // Use pitch from URL or auto-calculated
        bearing: DEFAULT_MAP_CONFIG.bearing,
        maxPitch: DEFAULT_MAP_CONFIG.maxPitch, // Allow pitch for 3D buildings
        minZoom: DEFAULT_MAP_CONFIG.minZoom,
        maxZoom: DEFAULT_MAP_CONFIG.maxZoom,
        dragRotate: false, // Disable rotation (north always up)
        touchPitch: true, // Enable pitch on touch (for 3D view)
        renderWorldCopies: false, // No repeating world copies
      })

      mapRef.current = map

      // Add navigation controls (zoom + pitch, no rotation)
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false, // Hide compass (rotation disabled, north always up)
          showZoom: true,
          visualizePitch: true, // Show pitch control for 3D buildings at street/building zoom
        }),
        'top-right'
      )

      // Map loaded event
      map.on('load', () => {
        setLoading(false)
        // Re-add location label if it exists
        if (currentLocationRef.current) {
          addLocationLabel(map, currentLocationRef.current)
        }
        // Add 3D buildings layer (will only show at zoom >= 15)
        add3DBuildingsLayer(map)
        // Add space effects if zoomed out
        toggleSpaceEffects(map, map.getZoom())
      })

      // Map error event
      map.on('error', (e) => {
        console.error('Map error:', e)
        setError('Failed to load map')
        setLoading(false)
      })

      // Auto-tilt to 45° when entering street zoom (15+), flatten when zooming out
      // Also show/hide minimap HUD at street zoom and toggle space effects at world zoom
      const handleZoomEnd = () => {
        const zoom = map.getZoom()
        const currentPitch = map.getPitch()

        if (zoom >= 15) {
          // Entering street zoom - auto-tilt to 45° and show minimap
          if (currentPitch < 45) {
            map.easeTo({
              pitch: 45,
              duration: 1000,
            })
          }
          setShowMinimap(true)
        } else {
          // Exiting street zoom - flatten to 0° and hide minimap
          if (currentPitch > 0) {
            map.easeTo({
              pitch: 0,
              duration: 1000,
            })
          }
          setShowMinimap(false)
        }

        // Toggle space effects based on zoom level
        toggleSpaceEffects(map, zoom)

        // Show moon at world zoom (< 5)
        setShowMoon(zoom < 5)
      }

      map.on('zoomend', handleZoomEnd)

      // Check initial zoom level for minimap and moon visibility
      const mapInitialZoom = map.getZoom()
      if (mapInitialZoom >= 15) {
        setShowMinimap(true)
      }
      if (mapInitialZoom < 5) {
        setShowMoon(true)
      }

      // Update URL on map move (debounced)
      const handleMoveEnd = () => {
        const center = map.getCenter()
        const zoom = Math.round(map.getZoom())
        const pitch = Math.round(map.getPitch())

        // Update current zoom state immediately (for display)
        setCurrentZoom(zoom)

        // Skip URL update on initial mount - only update after user interaction
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false
          return
        }

        // Debounce URL updates
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }

        updateTimeoutRef.current = setTimeout(() => {
          // Get current URL params
          const currentLat = searchParams.get('lat')
          const currentLng = searchParams.get('lng')
          const currentZoom = searchParams.get('zoom')
          const currentPitch = searchParams.get('pitch')

          // Only update if values have actually changed
          const newLat = center.lat.toFixed(4)
          const newLng = center.lng.toFixed(4)
          const newZoom = zoom.toString()
          const newPitch = pitch.toString()

          if (currentLat !== newLat || currentLng !== newLng || currentZoom !== newZoom || currentPitch !== newPitch) {
            const newUrl = `/my_reality?lat=${newLat}&lng=${newLng}&zoom=${newZoom}&pitch=${newPitch}`
            router.replace(newUrl, { scroll: false })

            // Call optional callback
            if (onViewChange) {
              onViewChange([center.lng, center.lat], zoom)
            }
          }
        }, 500)
      }

      map.on('moveend', handleMoveEnd)

      // Cleanup
      return () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }
        map.remove()
      }
    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to initialize map')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCenter, initialZoom]) // Dependencies for initial map setup

  // Helper function to calculate brightness from care rating
  const calculateBrightness = (care: number | null): number => {
    if (!care) return 0.5 // Default to medium brightness if no care rating
    // Care 1-5 maps to brightness 0.0-1.0
    return (care - 1) / 4
  }

  // Helper function to add markers to map
  const addMarkersToMap = useCallback((map: mapboxgl.Map, somethings: Something[]) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Group somethings by location (same lat/lng)
    const locationGroups = new Map<string, Something[]>()

    somethings.forEach((something) => {
      if (something.latitude && something.longitude) {
        const key = `${something.latitude},${something.longitude}`
        const group = locationGroups.get(key) || []
        group.push(something)
        locationGroups.set(key, group)
      }
    })

    // Create one marker per location
    locationGroups.forEach((group, key) => {
      const [lat, lng] = key.split(',').map(Number)

      // Calculate average care for brightness (or use max care)
      const avgCare =
        group.reduce((sum, s) => sum + (s.care || 3), 0) / group.length
      const brightness = calculateBrightness(avgCare)

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = '#ff0000'
      el.style.opacity = `${Math.max(0.2, brightness)}` // Minimum 0.2 so markers are always visible
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.transition = 'opacity 0.2s'
      el.style.zIndex = '1000' // Ensure markers stay on top of 3D buildings

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.opacity = '1'
      })
      el.addEventListener('mouseleave', () => {
        el.style.opacity = `${Math.max(0.2, brightness)}`
      })

      // Click handler - zoom to street view, then open modal
      el.addEventListener('click', (e) => {
        e.stopPropagation()

        // Zoom to street view with 3D tilt
        map.flyTo({
          center: [lng, lat],
          zoom: 17, // Street level detail
          pitch: 45, // 3D bird's eye view
          duration: 1500,
          essential: true,
        })

        // Open modal after zoom animation completes
        setTimeout(() => {
          setSelectedExperiences(group)
          setSelectedLocationName(group[0].location_name || 'Unknown location')
          setModalOpen(true)
        }, 1600) // Slightly after animation completes
      })

      // Create marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map)

      // Store marker reference with location key
      markersRef.current.set(key, marker)
    })
  }, [])

  // Fetch Physical somethings and add markers
  useEffect(() => {
    const fetchSomethings = async () => {
      try {
        const response = await fetch('/api/somethings/physical')
        if (!response.ok) {
          throw new Error('Failed to fetch somethings')
        }
        const data = await response.json()
        setSomethings(data.somethings || [])
      } catch (error) {
        console.error('Error fetching somethings:', error)
      }
    }

    fetchSomethings()
  }, [])

  // Add markers to map when somethings are loaded
  useEffect(() => {
    if (!mapRef.current || somethings.length === 0) return

    const map = mapRef.current

    // Wait for map to be fully loaded
    if (!map.loaded()) {
      map.on('load', () => addMarkersToMap(map, somethings))
      return
    }

    addMarkersToMap(map, somethings)
  }, [somethings, addMarkersToMap])

  // Handle location search selection with outline and label
  const handleLocationSelect = async (result: {
    text: string;
    place_name: string;
    center: [number, number];
    bbox?: [number, number, number, number];
    id: string;
    geometry?: {
      type: string;
      coordinates: any;
    };
    properties?: any;
  }) => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Store current location for persistence
    currentLocationRef.current = {
      text: result.text,
      center: result.center
    }

    // Remove existing boundary if any
    if (map.getLayer('location-boundary')) map.removeLayer('location-boundary')
    if (map.getSource('location-boundary')) map.removeSource('location-boundary')

    // Add location label
    addLocationLabel(map, currentLocationRef.current)

    // Check if we already have geometry from the search result
    let boundaryFeature = null

    if (result.geometry && (result.geometry.type === 'Polygon' || result.geometry.type === 'MultiPolygon')) {
      // Use geometry from search result (no extra API call needed!)
      boundaryFeature = {
        type: 'Feature' as const,
        properties: result.properties || { name: result.text },
        geometry: result.geometry
      }
      console.log('Using cached geometry for:', result.text)
    } else {
      // Only fetch if we don't have geometry (rare case - usually autocomplete includes it)
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(result.place_name)}.json?access_token=${token}&limit=1`

        const geocodeResponse = await fetch(geocodeUrl)
        const geocodeData = await geocodeResponse.json()

        if (geocodeData.features && geocodeData.features.length > 0) {
          const feature = geocodeData.features[0]

          if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            boundaryFeature = feature
            console.log('Fetched exact boundary for:', result.text)
          }
        }
      } catch (error) {
        console.error('Error fetching boundary geometry:', error)
      }
    }

    // Add boundary to map if we have one
    if (boundaryFeature) {
      map.addSource('location-boundary', {
        type: 'geojson',
        data: boundaryFeature
      })

      map.addLayer({
        id: 'location-boundary',
        type: 'line',
        source: 'location-boundary',
        paint: {
          'line-color': '#000000',
          'line-width': 2,
          'line-opacity': 1
        }
      })
    } else if (result.bbox) {
      // Fallback to bbox rectangle if no geometry available
      const [west, south, east, north] = result.bbox

      const rectangleGeoJSON = {
        type: 'Feature' as const,
        properties: { name: result.text },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [west, south],
            [east, south],
            [east, north],
            [west, north],
            [west, south]
          ]]
        }
      }

      map.addSource('location-boundary', {
        type: 'geojson',
        data: rectangleGeoJSON
      })

      map.addLayer({
        id: 'location-boundary',
        type: 'line',
        source: 'location-boundary',
        paint: {
          'line-color': '#000000',
          'line-width': 2,
          'line-opacity': 1
        }
      })

      console.log('Bbox boundary added for:', result.text)
    }

    // Fit to bounds
    if (result.bbox) {
      map.fitBounds(
        [
          [result.bbox[0], result.bbox[1]], // Southwest corner
          [result.bbox[2], result.bbox[3]], // Northeast corner
        ],
        {
          padding: { top: 40, bottom: 200, left: 40, right: 40 }, // Keep above search bar
          duration: 2000, // 2 second smooth animation
          essential: true,
        }
      )
    } else {
      // Fallback to center point if no bounding box
      map.flyTo({
        center: result.center,
        zoom: 12,
        duration: 2000,
        essential: true,
        padding: { top: 0, bottom: 200, left: 0, right: 0 },
      })
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
        <p className="text-red-400 mb-4">{error}</p>
        {error.includes('token') ? (
          <p className="text-sm text-gray-400 max-w-md text-center">
            Get a free token from{' '}
            <a
              href="https://account.mapbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Mapbox
            </a>{' '}
            and add it to your .env.local file
          </p>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-white text-xl">Loading map...</div>
        </div>
      )}

      {/* Zoom level indicator - moved to avoid controller overlap */}
      {!loading && !error && (
        <div className="absolute bottom-8 left-40 px-4 py-2 bg-black/70 text-white text-sm rounded-md">
          {getZoomLevelDisplayText(currentZoom)}
        </div>
      )}

      {/* Location search bar */}
      {!loading && !error && (
        <LocationSearchBar onLocationSelect={handleLocationSelect} />
      )}

      {/* Minimap HUD (visible at city zoom 11+) */}
      {!loading && !error && mapRef.current && (
        <MinimapHUD parentMap={mapRef.current} visible={showMinimap} />
      )}

      {/* Fire Map Controller (left side navigation) */}
      {!loading && !error && (
        <MapController map={mapRef.current} />
      )}

      {/* Moon (visible at world zoom < 5) */}
      {showMoon && (
        <div
          className="absolute top-20 right-32 w-24 h-24 rounded-full pointer-events-none transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #888 60%, #333)',
            boxShadow: '0 0 60px rgba(255, 255, 255, 0.3), inset -10px -10px 30px rgba(0,0,0,0.5)',
            opacity: showMoon ? 1 : 0,
          }}
          aria-label="Moon"
        >
          {/* Crater details */}
          <div className="absolute top-4 left-6 w-4 h-4 rounded-full bg-gray-600/40" />
          <div className="absolute top-10 right-8 w-3 h-3 rounded-full bg-gray-600/30" />
          <div className="absolute bottom-8 left-10 w-5 h-5 rounded-full bg-gray-600/50" />
        </div>
      )}

      {/* Experience list modal */}
      <ExperienceListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        experiences={selectedExperiences}
        locationName={selectedLocationName}
      />
    </div>
  )
}
