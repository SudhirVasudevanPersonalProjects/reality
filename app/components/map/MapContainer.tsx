'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Globe } from './Globe'
import { MapView } from './MapView'

export function MapContainer() {
  const [showGlobe, setShowGlobe] = useState(true)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user wants to skip globe via URL param
    const skipGlobeParam = searchParams.get('skipGlobe')
    if (skipGlobeParam === 'true') {
      setShowGlobe(false)
      setLoading(false)
      return
    }

    // Check localStorage for globe preference
    const skipGlobe = localStorage.getItem('skipGlobe') === 'true'
    if (skipGlobe) {
      setShowGlobe(false)
    }
    setLoading(false)
  }, [searchParams])

  const handleGlobeTransition = () => {
    setShowGlobe(false)
    // Store preference to skip globe on next visit
    localStorage.setItem('skipGlobe', 'true')
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* Globe view (fades out) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showGlobe ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
        }`}
      >
        {showGlobe && <Globe onTransition={handleGlobeTransition} />}
      </div>

      {/* Map view (fades in) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showGlobe ? 'opacity-0 pointer-events-none z-0' : 'opacity-100 z-10'
        }`}
      >
        {!showGlobe && <MapView />}
      </div>
    </div>
  )
}
