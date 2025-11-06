'use client'

import { useEffect, useRef } from 'react'
import { mapboxgl } from '@/lib/mapbox/config'

interface MinimapHUDProps {
  parentMap: mapboxgl.Map
  visible: boolean
}

export function MinimapHUD({ parentMap, visible }: MinimapHUDProps) {
  const minimapContainerRef = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<mapboxgl.Map | null>(null)
  const viewportBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!minimapContainerRef.current || !visible) return

    // Initialize minimap
    const minimap = new mapboxgl.Map({
      container: minimapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: parentMap.getCenter(),
      zoom: parentMap.getZoom() - 2, // Minimap shows wider area
      interactive: true,
      attributionControl: false,
    })

    minimapRef.current = minimap

    // Calculate and update viewport rectangle on minimap
    const updateViewportBox = () => {
      if (!minimap || !viewportBoxRef.current) return

      const parentBounds = parentMap.getBounds()
      if (!parentBounds) return

      const ne = parentBounds.getNorthEast()
      const sw = parentBounds.getSouthWest()

      // Convert lat/lng to pixel coordinates on minimap
      const nePoint = minimap.project(ne)
      const swPoint = minimap.project(sw)

      const width = Math.abs(nePoint.x - swPoint.x)
      const height = Math.abs(nePoint.y - swPoint.y)
      const left = Math.min(nePoint.x, swPoint.x)
      const top = Math.min(nePoint.y, swPoint.y)

      viewportBoxRef.current.style.width = `${width}px`
      viewportBoxRef.current.style.height = `${height}px`
      viewportBoxRef.current.style.left = `${left}px`
      viewportBoxRef.current.style.top = `${top}px`
    }

    // Update minimap when parent map moves
    const updateMinimap = () => {
      if (!minimap) return

      const parentCenter = parentMap.getCenter()
      const parentZoom = parentMap.getZoom()

      minimap.jumpTo({
        center: parentCenter,
        zoom: parentZoom - 2,
      })

      updateViewportBox()
    }

    // Handle clicks on minimap to move parent map
    const handleMinimapClick = (e: mapboxgl.MapMouseEvent) => {
      parentMap.flyTo({
        center: e.lngLat,
        duration: 1000,
      })
    }

    // Wait for minimap to load before setting up sync
    minimap.on('load', () => {
      // Initial viewport box update
      updateViewportBox()

      // Listen to parent map events
      parentMap.on('move', updateMinimap)
      parentMap.on('zoom', updateMinimap)

      // Listen to minimap events for updates
      minimap.on('move', updateViewportBox)
      minimap.on('click', handleMinimapClick)
    })

    // Cleanup
    return () => {
      // Remove event listeners
      parentMap.off('move', updateMinimap)
      parentMap.off('zoom', updateMinimap)

      if (minimap) {
        minimap.off('move', updateViewportBox)
        minimap.off('click', handleMinimapClick)
        minimap.remove()
      }

      minimapRef.current = null
    }
  }, [parentMap, visible])

  if (!visible) return null

  return (
    <div className="absolute top-4 right-4 w-64 h-64 border-4 border-white rounded-lg overflow-hidden shadow-2xl z-10 bg-black">
      <div ref={minimapContainerRef} className="w-full h-full relative" />
      <div
        ref={viewportBoxRef}
        className="absolute border-2 border-red-500 pointer-events-none"
        style={{
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
