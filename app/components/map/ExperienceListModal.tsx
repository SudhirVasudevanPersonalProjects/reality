'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'

type Something = Database['public']['Tables']['somethings']['Row']

interface ExperienceListModalProps {
  isOpen: boolean
  onClose: () => void
  experiences: Something[]
  locationName?: string
}

export function ExperienceListModal({
  isOpen,
  onClose,
  experiences,
  locationName,
}: ExperienceListModalProps) {
  const router = useRouter()

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Render care stars
  const renderCareStars = (care: number | null) => {
    if (!care) return <span className="text-gray-500">No rating</span>

    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= care ? 'text-yellow-400' : 'text-gray-600'}>
          ★
        </span>
      )
    }
    return (
      <span aria-label={`${care} out of 5 stars`} className="text-lg">
        {stars}
      </span>
    )
  }

  // Handle view details click
  const handleViewDetails = (id: string) => {
    router.push(`/my_reality/${id}`)
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content - Desktop: centered, Mobile: bottom sheet */}
      <div
        className="fixed z-50
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:max-w-[600px] md:w-full md:max-h-[80vh] md:rounded-lg
          bottom-0 left-0 right-0 rounded-t-2xl md:rounded-b-lg
          bg-gray-900 text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold">
            {locationName || 'Experiences at this location'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'}
          </p>
        </div>

        {/* Experience list - scrollable */}
        <div className="overflow-y-auto max-h-[60vh] md:max-h-[50vh] px-6 py-4">
          {experiences.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No experiences recorded at this location yet
            </p>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div
                  key={experience.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition"
                >
                  {/* Timestamp */}
                  <div className="text-sm text-gray-400 mb-2">
                    <span suppressHydrationWarning>
                      {formatTimestamp(experience.captured_at)}
                    </span>
                  </div>

                  {/* Preview text */}
                  {experience.text_content && (
                    <p className="text-white mb-3 line-clamp-3">
                      {experience.text_content.substring(0, 100)}
                      {experience.text_content.length > 100 ? '...' : ''}
                    </p>
                  )}

                  {/* Care rating */}
                  <div className="mb-3">{renderCareStars(experience.care)}</div>

                  {/* View Details button */}
                  <button
                    onClick={() => handleViewDetails(experience.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
