'use client'

import { useState } from 'react'
import AddressSearchInput from './AddressSearchInput'
import ManualCoordinateInput from './ManualCoordinateInput'

interface LocationData {
  latitude: number
  longitude: number
  locationName: string
  formattedAddress: string
}

interface LocationInputProps {
  locationName: string
  onLocationNameChange: (name: string) => void
  onAddressSelect: (data: { latitude: number; longitude: number; formattedAddress: string; placeName: string }) => void
  onManualCoordinates: (latitude: number, longitude: number) => void
  required?: boolean
}

/**
 * Location input wrapper component with two fields
 * Story 2.6: Separate location name from address/coordinates
 */
export default function LocationInput({
  locationName,
  onLocationNameChange,
  onAddressSelect,
  onManualCoordinates,
  required = false
}: LocationInputProps) {
  const [addressSearch, setAddressSearch] = useState('')
  const [coordinateMode, setCoordinateMode] = useState<'search' | 'manual'>('search')

  const handleAddressSelect = (data: { latitude: number; longitude: number; placeName: string; formattedAddress: string }) => {
    onAddressSelect(data)
    // Update address search field with selected place name
    setAddressSearch(data.placeName)
  }

  const toggleMode = () => {
    setCoordinateMode(prev => prev === 'search' ? 'manual' : 'search')
  }

  return (
    <div className="space-y-4">
      {/* Location Name Field (User's Personal Label) */}
      <div>
        <label htmlFor="location-name-input" className="block text-sm text-gray-300 mb-2">
          📍 Location Name {required && <span className="text-red-400">*</span>}
        </label>
        <input
          id="location-name-input"
          type="text"
          value={locationName}
          onChange={(e) => onLocationNameChange(e.target.value)}
          placeholder="Your label (e.g., Price Center, Papa Johns)"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
          aria-label="Location name"
          required={required}
        />
        <p className="text-xs text-gray-500 mt-1">
          Your personal label for this location
        </p>
      </div>

      {/* Address/Coordinates Field (Geocoding) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm text-gray-300">
            📍 Address/Coordinates (for map)
          </label>
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            {coordinateMode === 'search' ? 'Enter coordinates manually' : 'Search by address'}
          </button>
        </div>

        {coordinateMode === 'search' ? (
          <AddressSearchInput
            value={addressSearch}
            onChange={setAddressSearch}
            onSelect={handleAddressSelect}
          />
        ) : (
          <ManualCoordinateInput
            onCoordinatesEnter={onManualCoordinates}
          />
        )}

        <p className="text-xs text-gray-500 mt-1">
          Optional: Add coordinates to show on map
        </p>
      </div>
    </div>
  )
}
