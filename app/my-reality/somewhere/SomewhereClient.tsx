'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SomethingContent from '@/app/components/SomethingContent'
import CarePickerUI from '@/app/components/CarePickerUI'

// 2D Rendering utilities
import { distributeOnHexagonalLattice, calculateCircleRadius } from '@/lib/my-reality/hexagonal-lattice-2d'
import {
  render2DScene,
  detectClick,
  panCamera,
  zoomCamera,
  worldToScreen,
  type Something2D,
  type Camera2D,
} from '@/lib/my-reality/render-2d-scene'
import { animateIntroZoom } from '@/lib/my-reality/intro-animation'
import {
  animateSpaceshipFlight,
  animateZoomOutAndFade,
  blinkToChamberView,
} from '@/lib/my-reality/chamber-entry-animation'
import { calculateCentroid, animateCameraPan } from '@/lib/my-reality/camera-animation'
import FilterBar from '@/app/components/FilterBar'

interface Something {
  id: string
  text_content: string | null
  media_url: string | null
  attributes: any
  captured_at: string
  care: number | null
  content_type: string
  parent_id: string | null
}

interface Abode {
  id: string
  text_content: string | null
  attributes: {
    icon?: string
    color?: string
  } | null
}

interface SomewhereClientProps {
  somethings: Something[]
  abodes: Abode[]
  maxBound: number
  selectedOrbId?: string
}

export default function SomewhereClient({ somethings: initialSomethings, abodes: initialAbodes, maxBound, selectedOrbId }: SomewhereClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [somethings, setSomethings] = useState(initialSomethings)
  const [abodes] = useState(initialAbodes)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [camera, setCamera] = useState<Camera2D>({ x: 0, y: 0, zoom: 1.0 })
  const [savedCamera, setSavedCamera] = useState<Camera2D | null>(null)
  const [hasMoreContent, setHasMoreContent] = useState(false)

  // Filter state
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [noFilterMatches, setNoFilterMatches] = useState(false)

  // Intro animation states
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSpaceship, setShowSpaceship] = useState(false)

  // Chamber entry animation states
  const [isChamberTransitioning, setIsChamberTransitioning] = useState(false)
  const [spaceshipState, setSpaceshipState] = useState({ x: 80, y: -80, rotation: 0, scale: 1 })
  const [fadeOverlayOpacity, setFadeOverlayOpacity] = useState(0)
  const [enterChamberTextOpacity, setEnterChamberTextOpacity] = useState(1)
  const [viewportHeight, setViewportHeight] = useState(0)

  const contentScrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const cleanupAnimationRef = useRef<(() => void) | null>(null)

  // Mobile check and viewport height
  useEffect(() => {
    setIsClient(true)
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
      const height = window.innerHeight
      setViewportHeight(height)
      // Update spaceship position to middle of viewport
      setSpaceshipState((prev) => ({
        ...prev,
        y: prev.y === 0 ? height / 2 : prev.y,
      }))    
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  // Check if first visit, returning, or viewing specific orb
  useEffect(() => {
    if (!isClient) return

    const hasVisited = localStorage.getItem('somewhere-visited') === 'true'

    if (selectedOrbId) {
      // Viewing specific orb - hide spaceship, skip intro
      setShowSpaceship(false)
      setIsAnimating(false)
    } else if (hasVisited) {
      // Returning user - skip intro, go to home base
      setCamera({ x: 0, y: 0, zoom: 1.0 })
      setShowSpaceship(true)
      setIsAnimating(false)
    } else {
      // First visit - play intro animation
      setIsAnimating(true)
      setCamera({ x: 0, y: 0, zoom: 0.1 })
    }
  }, [isClient, selectedOrbId])

  // Run intro animation
  useEffect(() => {
    if (!isClient || !isAnimating) return

    const cleanup = animateIntroZoom(setCamera, () => {
      // Animation complete - mark as visited and show spaceship
      localStorage.setItem('somewhere-visited', 'true')
      setShowSpaceship(true)
      setIsAnimating(false)
      // Update URL to home base
      router.replace('/my-reality/somewhere', { scroll: false })
    })

    return cleanup
  }, [isClient, isAnimating, router])

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentScrollRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentScrollRef.current
        setHasMoreContent(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 10)
      }
    }

    const scrollContainer = contentScrollRef.current
    if (scrollContainer) {
      checkScrollable()
      scrollContainer.addEventListener('scroll', checkScrollable)
      return () => scrollContainer.removeEventListener('scroll', checkScrollable)
    }
  }, [selectedId])

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (cleanupAnimationRef.current) {
        cleanupAnimationRef.current()
      }
    }
  }, [])

  // Check if something matches active filters (AND logic)
  const matchesFilters = (something: Something, filters: string[]): boolean => {
    if (filters.length === 0) return true // No filters = show all

    // For multiple filters, something must have ALL as ancestors in parent chain
    // For now, simplified: check if parent_id matches any active filter
    // (Full nested implementation would walk entire parent chain)
    return filters.includes(something.parent_id || '')
  }

  // Filter somethings based on active filters
  const filteredSomethings = useMemo(() => {
    if (activeFilters.length === 0) return somethings
    return somethings.filter((s) => matchesFilters(s, activeFilters))
  }, [somethings, activeFilters])

  // Distribute somethings on hexagonal lattice
  const somethings2D = useMemo<Something2D[]>(() => {
    if (filteredSomethings.length === 0) return []

    const positions = distributeOnHexagonalLattice(filteredSomethings.length, maxBound)

    return filteredSomethings.map((something, index) => ({
      id: something.id,
      x: positions[index]?.x || 0,
      y: positions[index]?.y || 0,
      care: something.care,
      content: something.text_content || something.media_url || '',
      contentType: something.content_type,
      mediaUrl: something.media_url,
      opacity: selectedId && selectedId !== something.id ? 0.2 : 1.0,
    }))
  }, [filteredSomethings, maxBound, selectedId])

  // Pan camera to filtered somethings when filters change
  useEffect(() => {
    if (!isClient) return

    // If no filters active, clear the no matches message
    if (activeFilters.length === 0) {
      setNoFilterMatches(false)
      return
    }

    // If filters active but no matches, show message
    if (somethings2D.length === 0) {
      setNoFilterMatches(true)
      return
    }

    // Clear no matches message
    setNoFilterMatches(false)

    // Don't pan if something is selected (user is focused on content)
    if (selectedId) return

    // Calculate centroid of filtered somethings
    const centroid = calculateCentroid(somethings2D)

    // Animate pan to centroid
    const cleanup = animateCameraPan(
      camera,
      centroid,
      600, // 600ms duration
      setCamera,
      () => {
        // Pan complete
      }
    )

    return cleanup
  }, [isClient, activeFilters, somethings2D, selectedId, camera])

  // Zoom to selected orb when selectedOrbId is provided
  useEffect(() => {
    if (!selectedOrbId || somethings2D.length === 0 || !canvasRef.current) return

    const orbPosition = somethings2D.find((s) => s.id === selectedOrbId)
    if (orbPosition) {
      const targetZoom = canvasRef.current.height / 40
      setCamera({ x: orbPosition.x, y: orbPosition.y, zoom: targetZoom })
      setSelectedId(selectedOrbId)
    }
  }, [selectedOrbId, somethings2D, canvasRef])

  // Canvas rendering loop
  useEffect(() => {
    if (!isClient || !canvasRef.current || isMobile) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let mounted = true

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const clearRadius = calculateCircleRadius(maxBound)

    // Animation loop
    const animate = () => {
      if (!mounted || !ctx) return

      animationFrameRef.current = requestAnimationFrame(animate)
      render2DScene(canvas, ctx, somethings2D, camera, clearRadius, selectedId, activeFilters, abodes)
    }

    animate()

    return () => {
      mounted = false
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isClient, isMobile, somethings2D, camera, maxBound, selectedId, activeFilters, abodes])

  // Mouse/touch event handlers
  useEffect(() => {
    if (!isClient || !canvasRef.current || isMobile) return

    const canvas = canvasRef.current

    // Mouse move (pan disabled - using spaceship for navigation)
    const onMouseMove = (event: MouseEvent) => {
      // Pan disabled
    }

    // Mouse down (start pan or click something)
    const onMouseDown = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top

      // Check if clicked on something
      const clickedId = detectClick(screenX, screenY, somethings2D, camera, canvas)

      if (clickedId) {
        // Clicked on something - zoom in and select it
        const clickedSomething = somethings2D.find(s => s.id === clickedId)
        if (clickedSomething) {
          // Save current camera for later restore
          setSavedCamera({ ...camera })
          // Zoom in to the orb
          const targetZoom = canvas.height / 40
          setCamera({ x: clickedSomething.x, y: clickedSomething.y, zoom: targetZoom })
          setSelectedId(clickedId)
        }
      } else if (selectedId) {
        // Clicked outside while something is selected - deselect and restore camera
        setSelectedId(null)
        if (savedCamera) {
          setCamera(savedCamera)
          setSavedCamera(null)
        }
      }
    }

    // Mouse up (stop pan)
    const onMouseUp = () => {
      setIsPanning(false)
    }

    // Scroll (zoom out allowed, zoom in only when something selected)
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()

      // Positive deltaY = scroll down, but zoomCamera adds delta to zoom
      // So we need to negate: scroll down = negative delta = decrease zoom = zoom out
      if (event.deltaY > 0) {
        // Scroll down = zoom out (always allowed)
        const newZoom = zoomCamera(camera, -event.deltaY, 0.1, 50.0)
        setCamera(prev => ({ ...prev, zoom: Math.max(0.1, newZoom.zoom) }))
      } else if (selectedId) {
        // Scroll up = zoom in (only allowed when something is selected)
        const newZoom = zoomCamera(camera, -event.deltaY, 0.1, 50.0)
        setCamera(prev => ({ ...prev, zoom: newZoom.zoom }))
      }
    }

    // Keyboard (Escape to deselect and restore camera)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedId) {
        setSelectedId(null)
        if (savedCamera) {
          setCamera(savedCamera)
          setSavedCamera(null)
        }
      }
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isClient, isMobile, isPanning, panStart, camera, somethings2D, selectedId, savedCamera])

  // Handle care selection
  const handleCareSelection = async (care: number) => {
    if (!selectedId) return

    // Optimistic update
    setSomethings((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, care } : s))
    )

    try {
      const { error } = await supabase
        .from('somethings')
        .update({ care })
        .eq('id', selectedId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to update care:', error)
      // Rollback
      setSomethings(initialSomethings)
      alert('Failed to update care level. Please try again.')
    }
  }

  // Handle delete (make it nothing)
  const handleDelete = async () => {
    if (!selectedId) return

    const confirmed = window.confirm('Are you sure you want to make this something into nothing? This cannot be undone.')
    if (!confirmed) return

    // Optimistic update - remove from UI
    setSomethings((prev) => prev.filter((s) => s.id !== selectedId))

    // Deselect and restore camera
    setSelectedId(null)
    if (savedCamera) {
      setCamera(savedCamera)
      setSavedCamera(null)
    }

    try {
      const { error } = await supabase
        .from('somethings')
        .delete()
        .eq('id', selectedId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to delete something:', error)
      // Rollback
      setSomethings(initialSomethings)
      alert('Failed to delete. Please try again.')
    }
  }

  // Handle filter toggle
  const handleToggleFilter = (abodeId: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(abodeId)) {
        // Remove filter
        return prev.filter((id) => id !== abodeId)
      } else {
        // Add filter
        return [...prev, abodeId]
      }
    })
  }

  // Find nearest unorganized something
  const findNearestUnorganizedSomething = async (): Promise<Something | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('somethings')
        .select('*')
        .eq('user_id', user.id)
        .is('realm', null)
        .order('captured_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error querying unorganized somethings:', error)
        return null
      }

      if (!data || data.length === 0) {
        return null
      }

      return data[0] as Something
    } catch (error) {
      console.error('Exception in findNearestUnorganizedSomething:', error)
      return null
    }
  }

  // Handle chamber entry
  const handleChamberEntry = async () => {
    if (isChamberTransitioning) return // Prevent multiple clicks

    // Hide "enter chamber" text immediately
    setEnterChamberTextOpacity(0)
    setIsChamberTransitioning(true)

    try {
      // Step 1: Query for unorganized something
      const unorganizedSomething = await findNearestUnorganizedSomething()

      if (!unorganizedSomething) {
        alert('All somethings organized! Nothing to enter chamber for.')
        setIsChamberTransitioning(false)
        setEnterChamberTextOpacity(1) // Restore text
        return
      }

      // Step 2: Get something position from somethings2D
      const somethingPosition = somethings2D.find((s) => s.id === unorganizedSomething.id)
      if (!somethingPosition) {
        console.error('Could not find position for unorganized something')
        setIsChamberTransitioning(false)
        setEnterChamberTextOpacity(1) // Restore text
        return
      }

      // Step 3: Spaceship flight animation
      const spaceshipStart = {x: spaceshipState.x, y: spaceshipState.y}

      // Convert world coordinates to screen coordinates
      if (!canvasRef.current) {
        console.error('Canvas ref not available')
        setIsChamberTransitioning(false)
        setEnterChamberTextOpacity(1) // Restore text
        return
      }
      const targetScreenPos = worldToScreen(
        { x: somethingPosition.x, y: somethingPosition.y },
        camera,
        canvasRef.current
      )
      const targetPos = { x: targetScreenPos.x, y: targetScreenPos.y }

      await new Promise<void>((resolve) => {
        const cleanup = animateSpaceshipFlight(
          spaceshipStart,
          targetPos,
          (state) => {
            setSpaceshipState(state)
          },
          () => {
            cleanupAnimationRef.current = null
            resolve()
          }
        )
        cleanupAnimationRef.current = cleanup
      })

      // Step 4: Zoom out & fade to black
      await new Promise<void>((resolve) => {
        const cleanup = animateZoomOutAndFade(
          { x: targetPos.x, y: targetPos.y },
          spaceshipState.rotation,
          (state) => setSpaceshipState(state),
          (opacity) => setFadeOverlayOpacity(opacity),
          () => {
            cleanupAnimationRef.current = null
            resolve()
          }
        )
        cleanupAnimationRef.current = cleanup
      })

      // Step 5: Blink & load chamber
      await new Promise<void>((resolve) => {
        const cleanup = blinkToChamberView(
          (opacity) => setFadeOverlayOpacity(opacity),
          () => {
            cleanupAnimationRef.current = null
            resolve()
          }
        )
        cleanupAnimationRef.current = cleanup
      })

      // Step 6: Navigate to chamber view
      router.push(`/chamber?id=${unorganizedSomething.id}`)
    } catch (error) {
      console.error('Error during chamber entry:', error)
      setIsChamberTransitioning(false)
      setEnterChamberTextOpacity(1) // Restore text
      alert('Failed to enter chamber. Please try again.')
    }
  }

  // Get selected something
  const selectedSomething = selectedId
    ? somethings.find((s) => s.id === selectedId)
    : null

  // Empty state
  if (somethings.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-xl">No somethings captured yet.</p>
          <Link
            href="/capture"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Start capturing
          </Link>
        </div>
      </div>
    )
  }

  // Mobile block
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white px-4">
        <div className="text-center space-y-4">
          <p className="text-xl">View on bigger screen</p>
          <p className="text-sm text-gray-400">my reality requires a tablet or desktop</p>
          <Link
            href="/capture"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go to Capture
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a1628]">
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 cursor-move" />

      {/* FilterBar - only show when not selected */}
      {!selectedSomething && abodes.length > 0 && (
        <FilterBar
          abodes={abodes}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
        />
      )}

      {/* No filter matches message */}
      {noFilterMatches && !selectedSomething && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-lg px-6 py-4 text-center">
            <p className="text-white text-lg">No somethings match these filters</p>
            <p className="text-white/60 text-sm mt-1">Try a different combination</p>
          </div>
        </div>
      )}

      {/* Content overlay inside sphere (when selected and zoomed) */}
      {selectedSomething && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${20 * 2 * camera.zoom * 0.85}px`,
            height: `${20 * 2 * camera.zoom * 0.85}px`,
            clipPath: 'circle(50%)',
          }}
        >
          <div
            ref={contentScrollRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide pointer-events-auto"
          >
            <div className="p-4 flex flex-col items-center justify-center min-h-full">
              <SomethingContent
                something={selectedSomething}
                inSphere={true}
                careLevel={selectedSomething.care}
              />
            </div>
          </div>

          {/* Down arrow indicator */}
          {hasMoreContent && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
              <div className="text-white text-2xl">↓</div>
            </div>
          )}
        </div>
      )}

      {/* Care Picker (shown when something is selected) */}
      {selectedSomething && (
        <CarePickerUI
          currentCare={selectedSomething.care}
          onSelectCare={handleCareSelection}
          onDelete={handleDelete}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Spaceship (static or animating) */}
      {showSpaceship && !isChamberTransitioning && !selectedSomething && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2 pointer-events-auto transition-opacity duration-500 opacity-0 animate-fade-in">
          {/* "enter chamber" text */}
          <p className="text-white text-sm font-semibold tracking-wide">
            enter chamber
          </p>
          {/* Spaceship image */}
          <button
            className="hover:scale-110 transition-transform cursor-pointer"
            style={{ background: 'none', border: 'none', outline: 'none' }}
            onClick={handleChamberEntry}
            suppressHydrationWarning
          >
            <Image
              src="/assets/spaceship.svg"
              alt="Enter Chamber"
              width={70}
              height={70}
            />
          </button>
        </div>
      )}

      {/* Spaceship during animation */}
      {showSpaceship && isChamberTransitioning && viewportHeight > 0 && (
        <>
          {/* "enter chamber" text - disappears instantly */}
          <p
            className="fixed z-50 text-white text-sm font-semibold tracking-wide"
            style={{
              left: '80px',
              bottom: `${viewportHeight - spaceshipState.y + 45}px`,
              opacity: enterChamberTextOpacity,
            }}
          >
            enter chamber
          </p>
          {/* Spaceship image */}
          <div
            className="fixed z-50"
            style={{
              left: `${spaceshipState.x - 35}px`,
              top: `${spaceshipState.y - 35}px`,
              transform: `rotate(${spaceshipState.rotation}deg) scale(${spaceshipState.scale})`,
              transition: 'none',
            }}
          >
            <Image
              src="/assets/spaceship.svg"
              alt="Spaceship"
              width={70}
              height={70}
            />
          </div>
        </>
      )}

      {/* Fade overlay for chamber entry */}
      {isChamberTransitioning && (
        <div
          className="fixed inset-0 bg-black pointer-events-none z-40"
          style={{ opacity: fadeOverlayOpacity }}
        />
      )}

      {/* Bottom UI - hide when something is selected */}
      {!selectedSomething && (
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center gap-4 pointer-events-none">
          {/* Bottom controls row */}
          <div className="w-full flex items-end justify-between">
            {/* Spacer for spaceship (bottom left) */}
            <div className="w-24 h-24" />

            {/* Search bar (bottom center) - non-functional for now */}
            <div className="flex-1 max-w-md mx-auto pointer-events-auto">
              <input
                type="text"
                placeholder="Search your somethings..."
                className="w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                disabled
                suppressHydrationWarning
              />
            </div>

            {/* Spacer (bottom right, for symmetry) */}
            <div className="w-24" />
          </div>
        </div>
      )}

      {/* Debug info (top right) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs p-3 rounded font-mono">
          <div>Somethings: {somethings.length}</div>
          <div>Max Bound: {maxBound}</div>
          <div>Camera: ({Math.round(camera.x)}, {Math.round(camera.y)})</div>
          <div>Zoom: {camera.zoom.toFixed(2)}</div>
          <div>Selected: {selectedId ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}
