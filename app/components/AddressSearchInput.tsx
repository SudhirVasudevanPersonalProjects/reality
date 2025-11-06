'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { geocodeLocation, GeocodingResult } from '@/lib/mapbox/geocoding'

interface AddressData {
  latitude: number
  longitude: number
  placeName: string
  formattedAddress: string
}

interface AddressSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (data: AddressData) => void
}

/**
 * Address search autocomplete component with Mapbox geocoding
 * Story 2.6: Separated from location name input
 */
export default function AddressSearchInput({ value, onChange, onSelect }: AddressSearchInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  // Debounced geocoding search
  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const results = await geocodeLocation(value)
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch (err) {
        setError('Failed to fetch locations. You can still enter text manually.')
        setSuggestions([])
        setShowDropdown(false)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [value])

  const handleSelect = (suggestion: GeocodingResult) => {
    onSelect({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      placeName: suggestion.placeName,
      formattedAddress: suggestion.formattedAddress
    })
    onChange(suggestion.placeName)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
      case 'Tab':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id="address-search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search address, landmark, or place name"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
          aria-label="Address search"
          aria-expanded={showDropdown}
          aria-controls="suggestions-listbox"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
          </div>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          ref={dropdownRef}
          id="suggestions-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={selectedIndex === index}
              onClick={() => handleSelect(suggestion)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-700 ${
                selectedIndex === index ? 'bg-gray-700' : ''
              }`}
            >
              <div className="text-white text-sm">{suggestion.placeName}</div>
            </li>
          ))}
        </ul>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 mt-1">⚠️ {error}</p>
      )}
    </div>
  )
}
