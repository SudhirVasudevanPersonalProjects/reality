/**
 * Mapbox Geocoding API client for location autocomplete
 * Story 2.5: Physical Location Capture & Geocoding
 */

import MapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'

// Initialize Mapbox client with access token
const geocodingClient = MapboxGeocoding({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
})

export interface GeocodingResult {
  placeName: string
  latitude: number
  longitude: number
  formattedAddress: string
}

/**
 * Geocode a location query using Mapbox Forward Geocoding
 * @param query - Location search query (address, landmark, or place name)
 * @returns Array of up to 5 location suggestions with coordinates
 */
export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  try {
    const response = await geocodingClient.forwardGeocode({
      query,
      limit: 5,
      types: ['place', 'address', 'poi']
    }).send()

    return response.body.features.map(feature => ({
      placeName: feature.place_name,
      latitude: feature.center[1],   // [lng, lat] order in Mapbox
      longitude: feature.center[0],
      formattedAddress: feature.place_name
    }))
  } catch (error) {
    console.error('Mapbox geocoding error:', error)
    return []  // Graceful fallback - return empty array on failure
  }
}
