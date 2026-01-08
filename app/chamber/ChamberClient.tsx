'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'
import Link from 'next/link'
import Image from 'next/image'

// 2D Rendering utilities
import { distributeOnHexagonalLattice, calculateCircleRadius } from '@/lib/my-reality/hexagonal-lattice-2d'
import {
  render2DScene,
  type Something2D,
  type Camera2D,
} from '@/lib/my-reality/render-2d-scene'

type Something = Database['public']['Tables']['somethings']['Row']

// Preset abodes with default icon/color
const PRESET_ABODES: Record<string, { icon: string; color: string }> = {
  'Beauty': { icon: '✨', color: '#FFD700' },
  'Ugly': { icon: '💀', color: '#2D1B4E' },
  'Dreams': { icon: '🌙', color: '#4A90D9' },
  'Heart': { icon: '❤️', color: '#E63946' },
  'Focus': { icon: '🎯', color: '#10B981' },
  'Memory': { icon: '📸', color: '#8B5CF6' },
}

interface ChamberClientProps {
  somethings: Something[]
  allSomethings: Something[]
  abodes: Something[]
  whys: Something[]
  maxBound: number
}

export default function ChamberClient({
  somethings,
  allSomethings,
  abodes: initialAbodes,
  whys: initialWhys,
  maxBound
}: ChamberClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)

  // Touch handling refs
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Canvas refs for 2D scene
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Tag input state
  const [abodeInput, setAbodeInput] = useState('')
  const [abodeSuggestions, setAbodeSuggestions] = useState<Something[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showAbodeInput, setShowAbodeInput] = useState(true)

  // Why input state (shown after abode is selected)
  const [showWhyInput, setShowWhyInput] = useState(false)
  const [whyInput, setWhyInput] = useState('')
  const [whySuggestions, setWhySuggestions] = useState<Something[]>([])
  const [selectedWhyIndex, setSelectedWhyIndex] = useState(-1)
  const [selectedWhys, setSelectedWhys] = useState<string[]>([])
  const [pendingAbodeName, setPendingAbodeName] = useState('')

  // Icon/color picker state (for new abodes)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState('📦')
  const [selectedColor, setSelectedColor] = useState('#6B7280')

  // Local state for abodes and whys (to handle new creations)
  const [abodes, setAbodes] = useState(initialAbodes)
  const [whys, setWhys] = useState(initialWhys)

  // Camera state for 2D scene
  const [camera, setCamera] = useState<Camera2D>({ x: 0, y: 0, zoom: 1.0 })

  const currentSomething = somethings[currentIndex]
  const inputRef = useRef<HTMLInputElement>(null)
  const whyInputRef = useRef<HTMLInputElement>(null)

  // Convert allSomethings to 2D positions for rendering
  const somethings2D = useMemo<Something2D[]>(() => {
    if (allSomethings.length === 0) return []

    const positions = distributeOnHexagonalLattice(allSomethings.length, maxBound)

    return allSomethings.map((something, index) => ({
      id: something.id,
      x: positions[index]?.x || 0,
      y: positions[index]?.y || 0,
      care: something.care,
      content: something.text_content || something.media_url || '',
      contentType: something.content_type,
      mediaUrl: something.media_url,
      // Highlight current something, dim others
      opacity: something.id === currentSomething?.id ? 1.0 : 0.3,
      // Make current something larger
      scale: something.id === currentSomething?.id ? 2.5 : 1.0,
    }))
  }, [allSomethings, maxBound, currentSomething])

  // Center camera on current something
  useEffect(() => {
    if (!currentSomething || somethings2D.length === 0) return

    const currentOrb = somethings2D.find(s => s.id === currentSomething.id)
    if (currentOrb) {
      setCamera(prev => ({
        ...prev,
        x: currentOrb.x,
        y: currentOrb.y,
        zoom: 2.0, // Moderate zoom to show context
      }))
    }
  }, [currentSomething, somethings2D])

  // Canvas rendering loop
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let mounted = true

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const clearRadius = calculateCircleRadius(maxBound)

    // Animation loop
    const animate = () => {
      if (!mounted || !ctx) return

      animationFrameRef.current = requestAnimationFrame(animate)
      render2DScene(canvas, ctx, somethings2D, camera, clearRadius, currentSomething?.id)
    }

    animate()

    return () => {
      mounted = false
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [somethings2D, camera, maxBound, currentSomething])

  // Auto-focus input on mount and when current something changes
  useEffect(() => {
    if (showAbodeInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentIndex, showAbodeInput])

  // Filter abode suggestions as user types
  useEffect(() => {
    if (!abodeInput.trim()) {
      setAbodeSuggestions([])
      setSelectedSuggestionIndex(-1)
      return
    }
    const matches = abodes.filter(a =>
      a.text_content?.toLowerCase().startsWith(abodeInput.toLowerCase())
    ).slice(0, 5)
    setAbodeSuggestions(matches)
    setSelectedSuggestionIndex(-1)
  }, [abodeInput, abodes])

  // Filter why suggestions as user types
  useEffect(() => {
    if (!whyInput.trim()) {
      setWhySuggestions([])
      setSelectedWhyIndex(-1)
      return
    }
    const matches = whys.filter(w =>
      w.text_content?.toLowerCase().includes(whyInput.toLowerCase()) &&
      !selectedWhys.includes(w.text_content || '')
    ).slice(0, 5)
    setWhySuggestions(matches)
    setSelectedWhyIndex(-1)
  }, [whyInput, whys, selectedWhys])

  // Navigate to next/previous
  const goToNext = () => {
    if (currentIndex < somethings.length - 1 && !isAnimating) {
      setSlideDirection('left')
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setSlideDirection(null)
        setIsAnimating(false)
        // Reset input state
        setAbodeInput('')
        setShowWhyInput(false)
        setWhyInput('')
        setSelectedWhys([])
        setShowIconPicker(false)
      }, 300)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0 && !isAnimating) {
      setSlideDirection('right')
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1)
        setSlideDirection(null)
        setIsAnimating(false)
        // Reset input state
        setAbodeInput('')
        setShowWhyInput(false)
        setWhyInput('')
        setSelectedWhys([])
        setShowIconPicker(false)
      }, 300)
    }
  }

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if typing in input
      if (document.activeElement?.tagName === 'INPUT') return

      if (e.key === 'ArrowLeft' && currentIndex > 0 && !isAnimating) {
        goToPrevious()
      } else if (e.key === 'ArrowRight' && currentIndex < somethings.length - 1 && !isAnimating) {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, somethings.length, isAnimating])

  // Handle abode input key events
  const handleAbodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev =>
        prev < abodeSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && abodeSuggestions[selectedSuggestionIndex]) {
        selectAbode(abodeSuggestions[selectedSuggestionIndex].text_content || '')
      } else if (abodeInput.trim()) {
        selectAbode(abodeInput.trim())
      }
    } else if (e.key === 'Escape') {
      setAbodeInput('')
      setAbodeSuggestions([])
    }
  }

  // Handle why input key events
  const handleWhyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedWhyIndex(prev =>
        prev < whySuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedWhyIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedWhyIndex >= 0 && whySuggestions[selectedWhyIndex]) {
        addWhy(whySuggestions[selectedWhyIndex].text_content || '')
      } else if (whyInput.trim()) {
        addWhy(whyInput.trim())
      } else {
        // Empty input = skip whys and submit
        handleAssignment()
      }
    } else if (e.key === 'Escape') {
      setWhyInput('')
      setWhySuggestions([])
    }
  }

  // Select abode (either existing or new)
  const selectAbode = (abodeName: string) => {
    const existingAbode = abodes.find(
      a => a.text_content?.toLowerCase() === abodeName.toLowerCase()
    )

    if (existingAbode) {
      // Use existing abode
      setPendingAbodeName(existingAbode.text_content || '')
      setShowAbodeInput(false)
      setShowWhyInput(true)
      setTimeout(() => whyInputRef.current?.focus(), 100)
    } else {
      // New abode - check if it matches a preset
      const preset = PRESET_ABODES[abodeName]
      if (preset) {
        setSelectedIcon(preset.icon)
        setSelectedColor(preset.color)
        setPendingAbodeName(abodeName)
        setShowAbodeInput(false)
        setShowWhyInput(true)
        setTimeout(() => whyInputRef.current?.focus(), 100)
      } else {
        // Show icon/color picker for custom abode
        setPendingAbodeName(abodeName)
        setShowAbodeInput(false)
        setShowIconPicker(true)
      }
    }
  }

  // Add a why to the list
  const addWhy = (whyText: string) => {
    if (!selectedWhys.includes(whyText)) {
      setSelectedWhys(prev => [...prev, whyText])
    }
    setWhyInput('')
    setWhySuggestions([])
  }

  // Remove a why from the list
  const removeWhy = (whyText: string) => {
    setSelectedWhys(prev => prev.filter(w => w !== whyText))
  }

  // Confirm icon/color selection
  const confirmIconColor = () => {
    setShowIconPicker(false)
    setShowWhyInput(true)
    setTimeout(() => whyInputRef.current?.focus(), 100)
  }

  // Handle final assignment
  const handleAssignment = async () => {
    if (!pendingAbodeName || !currentSomething) return

    setLoading(true)
    try {
      const response = await fetch(`/api/somethings/${currentSomething.id}/assign-abode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abode_name: pendingAbodeName,
          icon: selectedIcon,
          color: selectedColor,
          whys: selectedWhys,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Add new abode to local state if it was created
        if (data.abode && !abodes.find(a => a.id === data.abode.id)) {
          setAbodes(prev => [...prev, data.abode])
        }

        // Add new whys to local state
        if (data.newWhys) {
          setWhys(prev => [...prev, ...data.newWhys])
        }

        // Reset state
        setAbodeInput('')
        setPendingAbodeName('')
        setShowWhyInput(false)
        setShowAbodeInput(true)
        setWhyInput('')
        setSelectedWhys([])
        setShowIconPicker(false)
        setSelectedIcon('📦')
        setSelectedColor('#6B7280')

        // Auto-advance to next
        if (currentIndex < somethings.length - 1) {
          setSlideDirection('left')
          setIsAnimating(true)
          setTimeout(() => {
            setCurrentIndex(prev => prev + 1)
            setSlideDirection(null)
            setIsAnimating(false)
          }, 300)
        } else {
          // All organized - reload to show empty state
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to assign abode: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error assigning abode:', error)
      alert('Failed to assign abode. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this capture? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/somethings/${currentSomething.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (somethings.length === 1) {
          window.location.reload()
        } else {
          if (currentIndex >= somethings.length - 1) {
            setCurrentIndex(prev => Math.max(0, prev - 1))
          }
          window.location.reload()
        }
      } else {
        alert('Failed to delete capture. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error deleting capture:', error)
      alert('Failed to delete capture. Please try again.')
      setLoading(false)
    }
  }

  // Render content based on type
  const renderContent = () => {
    if (!currentSomething) return null

    // Photo
    if (currentSomething.content_type === 'photo' && currentSomething.media_url) {
      return (
        <div className="flex items-center justify-center">
          <Image
            src={currentSomething.media_url}
            alt="Captured content"
            width={800}
            height={600}
            className="max-w-full h-auto object-contain"
            style={{ width: 'auto', height: 'auto', maxHeight: '100%' }}
            priority
          />
        </div>
      )
    }

    // Video
    if (currentSomething.content_type === 'video' && currentSomething.media_url) {
      return (
        <div className="flex items-center justify-center h-full">
          <video
            src={currentSomething.media_url}
            controls
            className="max-w-full h-auto object-contain"
            style={{ maxHeight: '100%' }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    // Link preview
    const attrs = currentSomething.attributes as { link_preview?: { url?: string; image?: string; thumbnail_url?: string } } | null
    if (currentSomething.content_type === 'url' || attrs?.link_preview) {
      const linkPreview = attrs?.link_preview
      const thumbnailUrl = linkPreview?.image || linkPreview?.thumbnail_url

      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          {thumbnailUrl && (
            <div className="mb-4 flex justify-center">
              <Image
                src={thumbnailUrl}
                alt="Link preview"
                width={320}
                height={180}
                className="rounded-lg object-contain"
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '200px' }}
              />
            </div>
          )}
          <a
            href={linkPreview?.url || currentSomething.text_content || ''}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline text-center break-all"
          >
            {linkPreview?.url || currentSomething.text_content}
          </a>
        </div>
      )
    }

    // Text content
    if (currentSomething.text_content) {
      return (
        <div className="h-full w-full overflow-y-auto flex items-start justify-center">
          <p className="text-white text-lg leading-relaxed whitespace-pre-wrap break-words w-full">
            {currentSomething.text_content}
          </p>
        </div>
      )
    }

    return <p className="text-gray-500 italic">No content available</p>
  }

  // Get slide animation class
  const getSlideClass = () => {
    if (!slideDirection) return ''
    return slideDirection === 'left' ? 'animate-slide-left' : 'animate-slide-right'
  }

  // Color options for picker
  const colorOptions = [
    '#FFD700', '#E63946', '#4A90D9', '#10B981', '#8B5CF6',
    '#F59E0B', '#EC4899', '#2D1B4E', '#6B7280', '#14B8A6',
  ]

  // Emoji options for picker
  const emojiOptions = [
    '✨', '💀', '🌙', '❤️', '🎯', '📸', '🌟', '🔥', '💡', '🎨',
    '🌊', '🌸', '🍃', '⚡', '🎵', '📚', '🏠', '🚀', '💎', '🌈',
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="bg-black border-b border-gray-800 flex-shrink-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-bold text-white">Chamber of Reflection</h2>
            <Link
              href="/dashboard"
              prefetch={false}
              className="px-4 py-2 text-sm border border-gray-700 rounded-md hover:bg-gray-900 transition text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content area with 2D scene background */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Canvas background for 2D scene */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Top half - transparent to show canvas */}
        <div className="h-1/2 relative flex-shrink-0" />

        {/* Bottom half - content display */}
        <div className="h-1/2 bg-black/80 flex justify-center items-center relative flex-shrink-0">
          {/* Content container with arrows */}
          <div className="relative w-3/4 h-4/5 flex items-center">
            {/* Left arrow */}
            {somethings.length > 1 && currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Previous"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Content */}
            <div className={`w-full h-full bg-black/50 rounded-lg p-4 overflow-y-auto ${getSlideClass()}`}>
              {renderContent()}
            </div>

            {/* Right arrow */}
            {somethings.length > 1 && currentIndex < somethings.length - 1 && (
              <button
                onClick={goToNext}
                className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Next"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tag input UI */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
          {/* Abode input */}
          {showAbodeInput && (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={abodeInput}
                onChange={(e) => setAbodeInput(e.target.value)}
                onKeyDown={handleAbodeKeyDown}
                placeholder="Type abode name..."
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                disabled={loading}
              />

              {/* Suggestions dropdown */}
              {abodeSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  {abodeSuggestions.map((suggestion, index) => {
                    const attrs = suggestion.attributes as { icon?: string; color?: string } | null
                    return (
                      <button
                        key={suggestion.id}
                        onClick={() => selectAbode(suggestion.text_content || '')}
                        className={`w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center gap-2 ${
                          index === selectedSuggestionIndex ? 'bg-gray-800' : ''
                        }`}
                      >
                        <span>{attrs?.icon || '📦'}</span>
                        <span>{suggestion.text_content}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Icon/Color picker for new abodes */}
          {showIconPicker && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
              <div className="text-white text-sm font-medium">
                Creating &quot;{pendingAbodeName}&quot;
              </div>

              {/* Icon selection */}
              <div>
                <div className="text-white/70 text-xs mb-2">Select icon</div>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedIcon(emoji)}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        selectedIcon === emoji ? 'bg-white/20 ring-2 ring-white' : 'hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selection */}
              <div>
                <div className="text-white/70 text-xs mb-2">Select color</div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded ${
                        selectedColor === color ? 'ring-2 ring-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={confirmIconColor}
                className="w-full py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* Why input */}
          {showWhyInput && (
            <div className="space-y-3">
              {/* Selected whys */}
              {selectedWhys.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedWhys.map(why => (
                    <span
                      key={why}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-white text-sm"
                    >
                      {why}
                      <button
                        onClick={() => removeWhy(why)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <input
                  ref={whyInputRef}
                  type="text"
                  value={whyInput}
                  onChange={(e) => setWhyInput(e.target.value)}
                  onKeyDown={handleWhyKeyDown}
                  placeholder="Why does this belong here? (optional, press Enter to skip)"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  disabled={loading}
                />

                {/* Why suggestions dropdown */}
                {whySuggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                    {whySuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => addWhy(suggestion.text_content || '')}
                        className={`w-full px-4 py-2 text-left text-white hover:bg-gray-800 ${
                          index === selectedWhyIndex ? 'bg-gray-800' : ''
                        }`}
                      >
                        {suggestion.text_content}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowWhyInput(false)
                    setShowAbodeInput(true)
                    setPendingAbodeName('')
                    setSelectedWhys([])
                  }}
                  className="px-4 py-2 text-white/70 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  onClick={handleAssignment}
                  disabled={loading}
                  className="flex-1 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : `Assign to ${pendingAbodeName}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Position indicator */}
      {somethings.length > 1 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10">
          {currentIndex + 1} of {somethings.length}
        </div>
      )}

      {/* Delete button */}
      <div className="fixed bottom-4 right-4 z-10">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 border border-red-700 text-red-400 rounded-md hover:bg-red-900/30 transition disabled:opacity-50 text-sm"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slide-left {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(-100%);
            opacity: 0;
          }
          51% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-right {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(100%);
            opacity: 0;
          }
          51% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-left {
          animation: slide-left 300ms ease forwards;
        }

        .animate-slide-right {
          animation: slide-right 300ms ease forwards;
        }
      `}</style>
    </div>
  )
}
