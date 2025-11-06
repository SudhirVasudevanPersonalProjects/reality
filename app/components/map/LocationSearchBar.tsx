'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin } from 'lucide-react'

interface LocationResult {
  id: string
  place_name: string // Full display name like "Springfield, MA, USA"
  center: [number, number] // [lng, lat]
  place_type: string[] // ["place", "region", "country"]
  text: string // Short name like "Springfield"
  bbox?: [number, number, number, number] // Bounding box [west, south, east, north]
  geometry?: {
    type: string
    coordinates: any
  }
  properties?: any // Additional properties from Mapbox
}

interface LocationSearchBarProps {
  onLocationSelect: (result: LocationResult) => void
}

export function LocationSearchBar({ onLocationSelect }: LocationSearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Try to parse latitude/longitude from query
  const parseCoordinates = (query: string): [number, number] | null => {
    // Remove common prefixes/labels
    const cleaned = query
      .replace(/lat(itude)?:/gi, '')
      .replace(/lng|lon(gitude)?:/gi, '')
      .replace(/[NSEW]/gi, '')
      .trim()

    // Try to match coordinate patterns
    // Supports: "32.8810, -117.2340" or "32.8810,-117.2340" or "32.8810 -117.2340"
    const coordRegex = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/
    const match = cleaned.match(coordRegex)

    if (match) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])

      // Validate ranges
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return [lat, lng]
      }
    }

    return null
  }

  // Fetch location suggestions from Mapbox Geocoding API
  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)

    try {
      // Check if query is coordinates
      const coords = parseCoordinates(searchQuery)
      if (coords) {
        const [lat, lng] = coords

        // Create synthetic result for coordinates
        const coordResult: LocationResult = {
          id: `coord-${lat}-${lng}`,
          place_name: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          center: [lng, lat], // Note: Mapbox uses [lng, lat]
          place_type: ['coordinate'],
          text: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          bbox: [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01], // Small bbox around point
        }

        setResults([coordResult])
        setShowResults(true)
        setSelectedIndex(-1)
        setIsLoading(false)
        return
      }

      // Otherwise, use Mapbox geocoding
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&types=country,region,place,locality&limit=5&autocomplete=true`
      )

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json()
      setResults(data.features || [])
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Location search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(query)
      }, 300)
    } else {
      setResults([])
      setShowResults(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  // Handle location selection
  const handleSelectLocation = (result: LocationResult) => {
    onLocationSelect(result)
    setQuery('') // Clear search after selection
    setResults([]) // Clear results
    setShowResults(false)
    inputRef.current?.blur()
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault()
      handleSelectLocation(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
    }
  }

  // Clear search
  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
      <div className="relative">
        {/* Search input */}
        <div className="relative flex items-center bg-white rounded-full shadow-2xl overflow-hidden border border-gray-200">
          <div className="pl-5 pr-3 text-gray-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder="Search for a location or enter coordinates (lat, lng)..."
            className="flex-1 py-4 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />

          {query && (
            <button
              onClick={handleClear}
              className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {isLoading && (
            <div className="px-5">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Results dropdown */}
        {showResults && results.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute bottom-full mb-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelectLocation(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-5 py-3 flex items-start gap-3 text-left transition-colors ${
                  selectedIndex === index
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  selectedIndex === index ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${
                    selectedIndex === index ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {result.text}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.place_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {showResults && !isLoading && query.trim() && results.length === 0 && (
          <div
            ref={resultsRef}
            className="absolute bottom-full mb-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 px-5 py-4 text-sm text-gray-500 text-center"
          >
            No locations found for &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
