export interface GeoLocation {
  latitude: number
  longitude: number
}

export async function getCurrentLocation(): Promise<GeoLocation | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        // Silent failure - just log for debugging
        console.log('Geolocation error (silent):', error.message)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds to get accurate fix
        maximumAge: 0 // Always get fresh location, no cache
      }
    )
  })
}
