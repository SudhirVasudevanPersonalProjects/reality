'use client'

import { useState, useEffect, useMemo } from 'react'
import { distributeQuestionMarks } from '@/lib/ur-reality/distribute-question-marks'
import QuestionMark from '@/app/components/QuestionMark'
import SomethingContent from '@/app/components/SomethingContent'
import Link from 'next/link'

interface Something {
  id: string
  text_content: string | null
  media_url: string | null
  attributes: any
  captured_at: string
}

interface UrRealityClientProps {
  somethings: Something[]
}

export default function UrRealityClient({ somethings }: UrRealityClientProps) {
  const [clickedIds, setClickedIds] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [searchQuery, setSearchQuery] = useState('')

  // Get viewport dimensions
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // Distribute question marks - memoized to prevent re-randomization on every render
  const distributed = useMemo(() => {
    return distributeQuestionMarks(somethings)
  }, [somethings])

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

  // Handle question mark click
  const handleClick = (id: string) => {
    setClickedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id) // Toggle off
      } else {
        next.add(id) // Lock open
      }
      return next
    })
  }

  return (
    <div className="relative min-h-screen bg-[#0a1628] overflow-hidden">
      {/* Optional: Subtle stars background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Question marks */}
      {distributed.map(({ item, position }) => {
        const isClicked = clickedIds.has(item.id)
        const isHovered = hoveredId === item.id && !isClicked

        return (
          <div key={item.id}>
            <QuestionMark
              position={position}
              isClicked={isClicked}
              onClick={() => handleClick(item.id)}
              onMouseEnter={() => !isClicked && setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            />

            {/* Show content if clicked or hovered */}
            {(isClicked || isHovered) && (
              <SomethingContent
                something={item}
                questionMarkPosition={position}
                viewport={viewport}
              />
            )}
          </div>
        )
      })}

      {/* Rocket with speech bubble - bottom left */}
      <div className="fixed bottom-12 left-12 z-10">
        <div className="relative">
          {/* Speech bubble - positioned to the right of rocket tip */}
          <div
            className="absolute whitespace-nowrap"
            style={{
              bottom: '150px',
              left: '90px',
            }}
          >
              <div
                className="relative border-2 border-white px-8 py-4"
                style={{
                  borderRadius: '50%/40%',
                  backgroundColor: 'skyblue'
                }}
              >
              <span className="text-white font-light text-base tracking-wide">where are we going?</span>

              {/* Curvy whimsical line connecting to rocket */}
              <svg
                className="absolute"
                width="60"
                height="50"
                viewBox="0 0 60 50"
                style={{
                  top: 'calc(100% )',
                  left: '40px',
                  transform: 'scaleY(-1) rotate(-90deg) scaleX(-1)',
                }}
              >
                <path
                  d="M 10 0 Q 15 15, 25 25 Q 35 35, 45 45"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Rocket - 3/4 size, tilted to face top-right corner */}
          <button
            className="hover:scale-110 transition-transform"
            onClick={() => {/* Navigate to capture or goals page */}}
            aria-label="Set your destination"
            style={{
              fontSize: '6rem',
              transform: 'rotate(0deg)',
              display: 'inline-block'
            }}
          >
            🚀
          </button>
        </div>
      </div>

      {/* Search bar - bottom center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your reality..."
          className="w-full px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
        />
      </div>
    </div>
  )
}
