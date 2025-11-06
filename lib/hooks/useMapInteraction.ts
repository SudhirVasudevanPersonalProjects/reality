import { useEffect, useRef, useState } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'

interface UseMapInteractionProps {
  onZoomEnd?: (zoom: number) => void
  onMoveEnd?: (center: [number, number], zoom: number) => void
  onClick?: (lngLat: [number, number]) => void
}

/**
 * Custom hook for managing Mapbox map interactions
 * Provides access to map instance and event handlers
 */
export function useMapInteraction(props?: UseMapInteractionProps) {
  const { onZoomEnd, onMoveEnd, onClick } = props || {}
  const mapRef = useRef<MapboxMap | null>(null)
  const [isReady, setIsReady] = useState(false)

  /**
   * Set the map instance (called by MapView component)
   */
  const setMap = (map: MapboxMap | null) => {
    mapRef.current = map
    setIsReady(!!map)
  }

  /**
   * Get the current map instance
   */
  const getMap = () => mapRef.current

  /**
   * Fly to a specific location
   */
  const flyTo = (center: [number, number], zoom?: number) => {
    if (!mapRef.current) return
    mapRef.current.flyTo({
      center,
      zoom: zoom || mapRef.current.getZoom(),
      essential: true,
    })
  }

  /**
   * Ease to a specific location (smoother than flyTo)
   */
  const easeTo = (center: [number, number], zoom?: number) => {
    if (!mapRef.current) return
    mapRef.current.easeTo({
      center,
      zoom: zoom || mapRef.current.getZoom(),
      duration: 1000,
    })
  }

  /**
   * Get current center and zoom
   */
  const getViewState = () => {
    if (!mapRef.current) return null
    return {
      center: mapRef.current.getCenter().toArray() as [number, number],
      zoom: mapRef.current.getZoom(),
      bearing: mapRef.current.getBearing(),
      pitch: mapRef.current.getPitch(),
    }
  }

  // Set up event listeners when map is ready
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    const handleZoomEnd = () => {
      if (onZoomEnd) {
        onZoomEnd(map.getZoom())
      }
    }

    const handleMoveEnd = () => {
      if (onMoveEnd) {
        const center = map.getCenter()
        onMoveEnd([center.lng, center.lat], map.getZoom())
      }
    }

    const handleClick = (e: any) => {
      if (onClick) {
        onClick([e.lngLat.lng, e.lngLat.lat])
      }
    }

    if (onZoomEnd) {
      map.on('zoomend', handleZoomEnd)
    }

    if (onMoveEnd) {
      map.on('moveend', handleMoveEnd)
    }

    if (onClick) {
      map.on('click', handleClick)
    }

    return () => {
      if (onZoomEnd) {
        map.off('zoomend', handleZoomEnd)
      }
      if (onMoveEnd) {
        map.off('moveend', handleMoveEnd)
      }
      if (onClick) {
        map.off('click', handleClick)
      }
    }
  }, [isReady, onZoomEnd, onMoveEnd, onClick])

  return {
    mapRef,
    isReady,
    setMap,
    getMap,
    flyTo,
    easeTo,
    getViewState,
  }
}
