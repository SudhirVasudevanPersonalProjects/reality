'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { Json } from '@/lib/supabase/database.types'

// Preview type - only fields needed for card display
export type SomethingPreview = {
  id: string
  text_content: string | null
  media_url: string | null
  care: number | null
  captured_at: string
  latitude: number | null
  longitude: number | null
  attributes: Json
}

interface MindCardPreviewProps {
  something: SomethingPreview
}

export function MindCardPreview({ something }: MindCardPreviewProps) {
  const router = useRouter()

  // Extract mind_category from attributes
  const mindCategory = something.attributes && typeof something.attributes === 'object' && 'mind_category' in something.attributes
    ? (something.attributes as any).mind_category
    : null

  // Category badge rendering
  const getCategoryBadge = () => {
    if (!mindCategory) return null

    const badges = {
      experience: { emoji: '🎭', label: 'Experience' },
      thought: { emoji: '💭', label: 'Thought' },
      desire: { emoji: '✨', label: 'Desire' }
    }

    const badge = badges[mindCategory as keyof typeof badges]
    if (!badge) return null

    return (
      <div className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-800 rounded-full w-fit">
        <span>{badge.emoji}</span>
        <span className="font-medium">{badge.label}</span>
      </div>
    )
  }

  // Content preview: Truncate to 150 chars
  const getContentPreview = () => {
    if (!something.text_content) return null
    const content = something.text_content
    return content.length > 150 ? `${content.substring(0, 150)}...` : content
  }

  // Media thumbnail: Display first image
  const getMediaThumbnail = () => {
    if (!something.media_url) return null

    // media_url can be a single URL or JSON array of URLs
    let imageUrl: string | null = null
    try {
      const parsed = JSON.parse(something.media_url)
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0]
      }
    } catch {
      // If not JSON, treat as single URL
      imageUrl = something.media_url
    }

    if (!imageUrl) return null

    return (
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-800">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  // Care rating visualization
  const getCareStars = () => {
    if (!something.care) return null

    return (
      <div className="flex items-center gap-1" aria-label={`${something.care} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < something.care! ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  // Timestamp formatting: Relative (< 7 days) or absolute (≥ 7 days)
  const getFormattedTimestamp = () => {
    const capturedDate = new Date(something.captured_at)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - capturedDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 7) {
      return formatDistanceToNow(capturedDate, { addSuffix: true })
    } else {
      return format(capturedDate, 'MMM d, yyyy')
    }
  }

  // Care-based brightness: Opacity scaling (care 1=0.4, care 5=1.0)
  const getOpacity = () => {
    if (!something.care) return 1.0
    const brightness = (something.care - 1) / 4  // Maps 1-5 to 0.0-1.0
    return 0.4 + (brightness * 0.6)  // Maps to 0.4-1.0 range
  }

  // Click handler: Navigate to detail view
  const handleClick = () => {
    router.push(`/mind/${something.id}`)
  }

  return (
    <article
      className="group bg-gray-900 border border-gray-800 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-void"
      onClick={handleClick}
      style={{ opacity: getOpacity() }}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick()
      }}
      aria-label={`${mindCategory || 'Mind something'}: ${something.text_content?.substring(0, 100) || 'No content'}`}
    >
      {/* Category Badge */}
      <div className="mb-4">
        {getCategoryBadge()}
      </div>

      {/* Media Thumbnail */}
      {getMediaThumbnail()}

      {/* Content Preview */}
      {something.text_content && (
        <p className="text-gray-300 mb-4 line-clamp-4">
          {getContentPreview()}
        </p>
      )}

      {/* Care Rating */}
      <div className="mb-3">
        {getCareStars()}
      </div>

      {/* Timestamp and Location Indicator */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>{getFormattedTimestamp()}</span>
        {something.latitude && something.longitude && (
          <span title="Has location" className="text-base">
            📍
          </span>
        )}
      </div>
    </article>
  )
}
