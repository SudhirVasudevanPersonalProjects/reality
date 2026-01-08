'use client'

import { useState, useEffect, useRef, ClipboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentLocation } from '@/lib/capture/get-current-location'

const LOCALSTORAGE_KEY = 'liveCaptureText'

export default function LiveCaptureClient() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSinking, setIsSinking] = useState(false)
  const [isHoldingMelt, setIsHoldingMelt] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const meltHoldTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Detect desktop vs mobile
  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  // Load text from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY)
    if (saved) {
      setText(saved)
    }
  }, [])

  // Auto-save to localStorage on text change
  useEffect(() => {
    if (text) {
      localStorage.setItem(LOCALSTORAGE_KEY, text)
    } else {
      localStorage.removeItem(LOCALSTORAGE_KEY)
    }
  }, [text])

  // Handle paste event - detect multi-line (1+ newlines) and transition to Deep-Capture
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')

    // Check for 1 or more newlines (AC4: multi-line detection)
    if (pastedText.includes('\n')) {
      e.preventDefault() // Prevent default paste
      triggerSinkTransition(pastedText)
    }
    // If no newlines, let default paste behavior happen
  }

  // Trigger sink-transition animation and navigate to Deep-Capture
  const triggerSinkTransition = (textToTransfer: string) => {
    setIsSinking(true)

    // After animation completes, navigate to Deep-Capture
    setTimeout(() => {
      router.push(`/deep-capture?text=${encodeURIComponent(textToTransfer)}`)
    }, 500)
  }

  // Handle melt button hold
  const handleMeltMouseDown = () => {
    setIsHoldingMelt(true)

    // Start hold timer (500ms hold required)
    meltHoldTimerRef.current = setTimeout(() => {
      // Hold complete - transfer to Big-Capture
      if (text) {
        triggerSinkTransition(text)
      } else {
        triggerSinkTransition('')
      }
    }, 500)
  }

  // Cancel melt hold on mouse up
  const handleMeltMouseUp = () => {
    setIsHoldingMelt(false)
    if (meltHoldTimerRef.current) {
      clearTimeout(meltHoldTimerRef.current)
      meltHoldTimerRef.current = null
    }
  }

  // Handle Enter key (desktop only)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop only: Enter key sends (not on mobile)
    if (isDesktop && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle rocket ship send
  const handleSend = async () => {
    const trimmedText = text.trim()

    if (!trimmedText) {
      setError('Please enter some text before sending')
      return
    }

    setError(null)
    setIsAnimating(true)
    setIsSubmitting(true)

    try {
      // Get current location (silent, non-blocking)
      const location = await getCurrentLocation()

      // Submit to API
      const formData = new FormData()
      formData.append('text_content', trimmedText)

      if (location) {
        formData.append('latitude', location.latitude.toString())
        formData.append('longitude', location.longitude.toString())
      }

      const response = await fetch('/api/somethings', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create capture')
      }

      // Success - clear text and localStorage (silent, no message)
      setText('')
      localStorage.removeItem(LOCALSTORAGE_KEY)

      // Reset animation after rocket flies off
      setTimeout(() => {
        setIsAnimating(false)
        setIsSubmitting(false)
      }, 500)
    } catch (err) {
      console.error('Error creating capture:', err)
      setError(err instanceof Error ? err.message : 'Failed to create capture')
      setIsAnimating(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`min-h-screen bg-black text-white relative overflow-hidden ${
        isSinking ? 'animate-sink' : ''
      }`}
    >
      {/* Full-screen text editor - with padding at bottom for controls */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="w-full h-screen bg-black text-white text-2xl p-8 pb-32 outline-none resize-none"
        placeholder=""
        disabled={isSubmitting || isSinking}
        style={{ caretColor: 'white' }}
      />

      {/* Error message (if any) */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Bottom control section - separate from text area */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-4">
        <div className="flex items-end justify-center gap-4">
          {/* Melt to Deep-Capture button (hold to activate) */}
          <button
            onMouseDown={handleMeltMouseDown}
            onMouseUp={handleMeltMouseUp}
            onMouseLeave={handleMeltMouseUp}
            onTouchStart={handleMeltMouseDown}
            onTouchEnd={handleMeltMouseUp}
            disabled={isSinking || isSubmitting}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${
              isHoldingMelt
                ? 'bg-purple-600 scale-110'
                : 'bg-gray-700 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Hold to expand to Deep-Capture"
          >
            🌀
          </button>

          {/* Microphone button (disabled placeholder) - LARGER (1.5x other buttons) */}
          <button
            disabled
            className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center opacity-50 cursor-not-allowed"
            title="Audio transcription coming soon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          {/* Rocket ship send button */}
          <button
            onClick={handleSend}
            disabled={isSubmitting || !text.trim() || isSinking}
            className={`w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-4xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              isAnimating ? 'animate-rocket-fly' : ''
            }`}
            title="Send"
          >
            🚀
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes rocket-fly {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(0, -100vh) rotate(0deg);
            opacity: 0;
          }
        }

        @keyframes sink {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
          }
        }

        .animate-rocket-fly {
          animation: rocket-fly 500ms ease-out forwards;
        }

        .animate-sink {
          animation: sink 500ms ease-out forwards;
        }
      `}</style>
    </div>
  )
}
