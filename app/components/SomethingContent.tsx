'use client'

import { QuestionMarkPosition } from '@/lib/ur-reality/distribute-question-marks'
import { calculateContentPosition, ViewportDimensions } from '@/lib/ur-reality/position-content'
import LinkPreviewCard from './LinkPreviewCard'

interface Something {
  id: string
  text_content: string | null
  media_url: string | null
  attributes: any
  captured_at: string
}

interface SomethingContentProps {
  something: Something
  questionMarkPosition: QuestionMarkPosition
  viewport: ViewportDimensions
}

export default function SomethingContent({
  something,
  questionMarkPosition,
  viewport
}: SomethingContentProps) {
  // Calculate content position
  const contentPos = calculateContentPosition(
    questionMarkPosition.x,
    questionMarkPosition.y,
    questionMarkPosition.size,
    viewport
  )

  // Determine content type and render appropriately
  const renderContent = () => {
    // Photo
    if (something.media_url && something.media_url.match(/\.(jpg|jpeg|png|gif|heic|webp)/i)) {
      return (
        <img
          src={something.media_url}
          alt="Captured media"
          className="w-full rounded-lg"
          style={{ maxHeight: '300px', objectFit: 'contain' }}
        />
      )
    }

    // Video
    if (something.media_url && something.media_url.match(/\.(mp4|mov|webm)/i)) {
      return (
        <video
          src={something.media_url}
          controls
          className="w-full rounded-lg"
          style={{ maxHeight: '300px' }}
        />
      )
    }

    // Link preview
    if (something.attributes?.link_preview) {
      return (
        <LinkPreviewCard
          url={something.attributes.link_preview.url}
          title={something.attributes.link_preview.title}
          description={something.attributes.link_preview.description}
          image={something.attributes.link_preview.image}
        />
      )
    }

    // Plain text
    if (something.text_content) {
      return (
        <p className="text-gray-800 whitespace-pre-wrap break-words">
          {something.text_content}
        </p>
      )
    }

    return <p className="text-gray-500 italic">No content available</p>
  }

  return (
    <div
      className="absolute bg-white rounded-lg shadow-xl p-4 overflow-auto"
      style={{
        top: `${contentPos.top}px`,
        left: `${contentPos.left}px`,
        maxWidth: `${contentPos.maxWidth}px`,
        maxHeight: '400px',
        zIndex: 2
      }}
    >
      {renderContent()}

      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        {new Date(something.captured_at).toLocaleDateString()} at{' '}
        {new Date(something.captured_at).toLocaleTimeString()}
      </div>
    </div>
  )
}
