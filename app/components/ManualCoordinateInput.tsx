'use client'

import { useState } from 'react'

interface ManualCoordinateInputProps {
  onCoordinatesEnter: (latitude: number, longitude: number) => void
  initialLatitude?: number | null
  initialLongitude?: number | null
}

/**
 * Manual coordinate entry component
 * Story 2.6: Allow users to enter lat/lng directly
 * Format: "latitude, longitude" (Google Maps format)
 * Example: "32.879574326035744, -117.23646810849061"
 */
export default function ManualCoordinateInput({
  onCoordinatesEnter,
  initialLatitude = null,
  initialLongitude = null
}: ManualCoordinateInputProps) {
  const initialValue = initialLatitude !== null && initialLongitude !== null
    ? `${initialLatitude}, ${initialLongitude}`
    : ''

  const [coordsStr, setCoordsStr] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)

  // Parse and validate comma-separated coordinates
  const parseCoordinates = (value: string): { lat: number; lng: number } | null => {
    const trimmed = value.trim()
    if (!trimmed) return null

    // Split by comma
    const parts = trimmed.split(',').map(p => p.trim())
    if (parts.length !== 2) {
      setError('Format: latitude, longitude (e.g., 32.8810, -117.2340)')
      return null
    }

    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])

    // Validate numbers
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid numbers. Check your format.')
      return null
    }

    // Validate ranges
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90')
      return null
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180')
      return null
    }

    return { lat, lng }
  }

  const handleChange = (value: string) => {
    setCoordsStr(value)
    setError(null)

    const coords = parseCoordinates(value)
    if (coords) {
      onCoordinatesEnter(coords.lat, coords.lng)
    }
  }

  return (
    <div>
      <label htmlFor="coordinates-input" className="block text-xs text-gray-400 mb-1">
        Coordinates (paste from Google Maps)
      </label>
      <input
        id="coordinates-input"
        type="text"
        value={coordsStr}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="32.879574, -117.236468"
        className={`w-full px-3 py-2 bg-gray-800 border ${
          error ? 'border-red-500' : 'border-gray-700'
        } rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent`}
        aria-label="Coordinates (latitude, longitude)"
        aria-invalid={!!error}
        aria-describedby={error ? 'coords-error' : undefined}
      />
      {error && (
        <p id="coords-error" className="text-xs text-red-400 mt-1">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Format: latitude, longitude
      </p>
    </div>
  )
}
