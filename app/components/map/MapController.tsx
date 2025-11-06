'use client'

import { useEffect, useState } from 'react'
import { mapboxgl } from '@/lib/mapbox/config'

interface MapControllerProps {
  map: mapboxgl.Map | null
}

export function MapController({ map }: MapControllerProps) {
  const [isPressed, setIsPressed] = useState<string | null>(null)

  // Pan distance based on current zoom level
  const getPanDistance = () => {
    if (!map) return 0.1
    const zoom = map.getZoom()
    // More precise movement at higher zoom levels
    if (zoom >= 15) return 0.001 // Street level
    if (zoom >= 10) return 0.01 // City level
    if (zoom >= 5) return 0.1 // Country level
    return 1 // Continent level
  }

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!map) return

    const center = map.getCenter()
    const distance = getPanDistance()

    let newCenter = { ...center }

    switch (direction) {
      case 'up':
        newCenter.lat += distance
        break
      case 'down':
        newCenter.lat -= distance
        break
      case 'left':
        newCenter.lng -= distance
        break
      case 'right':
        newCenter.lng += distance
        break
    }

    map.easeTo({
      center: newCenter,
      duration: 300,
      easing: (t) => t, // Linear easing
    })
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (!map) return

    const currentZoom = map.getZoom()
    const newZoom = direction === 'in' ? currentZoom + 1 : currentZoom - 1

    map.easeTo({
      zoom: newZoom,
      duration: 300,
    })
  }

  const handleRecenter = () => {
    if (!map) return

    // Recenter to default or user's home location
    map.flyTo({
      center: [0, 20], // Default center from config
      zoom: 2,
      pitch: 0,
      duration: 2000,
    })
  }

  // Keyboard controls (only when not typing in input fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!map) return

      // Don't intercept keyboard if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Arrow keys only for panning
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          handlePan('up')
          setIsPressed('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          handlePan('down')
          setIsPressed('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePan('left')
          setIsPressed('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          handlePan('right')
          setIsPressed('right')
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoom('in')
          break
        case '-':
        case '_':
          e.preventDefault()
          handleZoom('out')
          break
      }
    }

    const handleKeyUp = () => {
      setIsPressed(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [map])

  if (!map) return null

  return (
    <div className="absolute left-4 bottom-24 flex flex-col gap-3 z-10">
      {/* Directional Pad */}
      <div className="relative w-32 h-32 bg-gradient-to-br from-red-900/90 to-orange-900/90 rounded-lg shadow-2xl backdrop-blur-sm border-2 border-red-500/50">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full border border-red-400/30" />

        {/* Up */}
        <button
          onClick={() => handlePan('up')}
          className={`absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center
            bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
            rounded-t-lg border border-red-400/50 transition-all shadow-lg
            ${isPressed === 'up' ? 'scale-95 brightness-125' : 'hover:scale-105'}
          `}
          aria-label="Pan up"
        >
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Down */}
        <button
          onClick={() => handlePan('down')}
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center
            bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
            rounded-b-lg border border-red-400/50 transition-all shadow-lg
            ${isPressed === 'down' ? 'scale-95 brightness-125' : 'hover:scale-105'}
          `}
          aria-label="Pan down"
        >
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Left */}
        <button
          onClick={() => handlePan('left')}
          className={`absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
            bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
            rounded-l-lg border border-red-400/50 transition-all shadow-lg
            ${isPressed === 'left' ? 'scale-95 brightness-125' : 'hover:scale-105'}
          `}
          aria-label="Pan left"
        >
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right */}
        <button
          onClick={() => handlePan('right')}
          className={`absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
            bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
            rounded-r-lg border border-red-400/50 transition-all shadow-lg
            ${isPressed === 'right' ? 'scale-95 brightness-125' : 'hover:scale-105'}
          `}
          aria-label="Pan right"
        >
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleZoom('in')}
          className="w-32 h-10 flex items-center justify-center gap-2
            bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500
            rounded-lg border border-orange-400/50 transition-all shadow-lg hover:scale-105
            text-white font-bold text-lg"
          aria-label="Zoom in"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-sm">Zoom</span>
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="w-32 h-10 flex items-center justify-center gap-2
            bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500
            rounded-lg border border-orange-400/50 transition-all shadow-lg hover:scale-105
            text-white font-bold text-lg"
          aria-label="Zoom out"
        >
          <span className="text-2xl leading-none">−</span>
          <span className="text-sm">Zoom</span>
        </button>
      </div>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        className="w-32 h-10 flex items-center justify-center gap-2
          bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700
          rounded-lg border border-gray-500/50 transition-all shadow-lg hover:scale-105
          text-white font-medium text-sm"
        aria-label="Recenter map"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
      </button>

      {/* Keyboard hints */}
      <div className="w-32 px-3 py-2 bg-black/70 rounded-lg border border-gray-600/50 text-xs text-gray-300 text-center">
        <div className="font-bold text-orange-400 mb-1">Keys</div>
        <div>Arrow keys</div>
        <div>+/− to zoom</div>
      </div>
    </div>
  )
}
