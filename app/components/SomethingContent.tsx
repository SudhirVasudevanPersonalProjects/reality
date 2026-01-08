'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LinkPreviewCard from './LinkPreviewCard'
import { fetchLinkThumbnail } from '@/lib/link-preview/fetch-thumbnail'

interface Something {
  id: string
  text_content: string | null
  media_url: string | null
  content_type: string
  attributes: any
  captured_at: string
}

interface SomethingContentProps {
  something: Something
  inSphere?: boolean
  careLevel?: number | null
}

export default function SomethingContent({ something, inSphere = false, careLevel = null }: SomethingContentProps) {
  console.log('[SomethingContent] Component rendering with:', {
    id: something.id,
    content_type: something.content_type,
    attributes: something.attributes,
    inSphere
  })

  // Determine text color based on care level when in sphere
  // Bright spheres (1, 2) and dreams (3) use black text
  const isBrightSphere = careLevel === 1 || careLevel === 2 || careLevel === 3
  const textColor = inSphere ? (isBrightSphere ? 'text-black' : 'text-white') : 'text-gray-800'
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [loadingThumbnail, setLoadingThumbnail] = useState(false)

  // Fetch thumbnail for link previews if needed
  useEffect(() => {
    console.log('[SomethingContent] useEffect running for:', something.id)

    const loadThumbnail = async () => {
      // Check if link preview exists and doesn't already have a thumbnail
      if (something.attributes?.link_preview?.url) {
        const url = something.attributes.link_preview.url
        const existingImage = something.attributes.link_preview.image || something.attributes.link_preview.thumbnail_url

        console.log('[SomethingContent] Link preview URL:', url)
        console.log('[SomethingContent] Existing image:', existingImage)

        if (!existingImage) {
          setLoadingThumbnail(true)
          const thumbnail = await fetchLinkThumbnail(url)
          console.log('[SomethingContent] Fetched thumbnail:', thumbnail)
          setThumbnailUrl(thumbnail)
          setLoadingThumbnail(false)
        } else {
          setThumbnailUrl(existingImage)
        }
      }
    }

    loadThumbnail()
  }, [something.id, something.attributes])

  // Determine content type and render appropriately
  const renderContent = () => {
    // Photo (use content_type from database)
    if (something.content_type === 'photo' && something.media_url) {
      return (
        <div className={`relative w-full overflow-hidden ${inSphere ? '' : 'rounded-lg bg-gray-100'}`} style={{ maxHeight: inSphere ? '100%' : '80vh' }}>
          <Image
            src={something.media_url}
            alt="Captured media"
            width={1600}
            height={1200}
            className="w-full h-auto object-contain"
            style={{ maxHeight: inSphere ? '100%' : '80vh' }}
            onError={(e) => {
              console.error('Failed to load image:', something.media_url)
            }}
          />
        </div>
      )
    }

    // Video (use content_type from database)
    if (something.content_type === 'video' && something.media_url) {
      return (
        <video
          src={something.media_url}
          controls
          className={`w-full ${inSphere ? '' : 'rounded-lg'}`}
          style={{ maxHeight: inSphere ? '100%' : '80vh' }}
        />
      )
    }

    // Link preview (content_type === 'url')
    if (something.content_type === 'url' || something.attributes?.link_preview) {
      const image = thumbnailUrl || something.attributes?.link_preview?.image

      return (
        <div>
          {loadingThumbnail && (
            <div className={`text-sm mb-2 ${inSphere ? (isBrightSphere ? 'text-black/70' : 'text-white/70') : 'text-gray-500'}`}>Loading thumbnail...</div>
          )}
          <LinkPreviewCard
            url={something.attributes?.link_preview?.url || ''}
            title={something.attributes?.link_preview?.title}
            description={something.attributes?.link_preview?.description}
            image={image}
            inSphere={inSphere}
            isBrightSphere={isBrightSphere}
          />
        </div>
      )
    }

    // Plain text
    if (something.text_content) {
      return (
        <p className={`whitespace-pre-wrap break-words ${textColor}`}>
          {something.text_content}
        </p>
      )
    }

    return <p className={`italic ${inSphere ? (isBrightSphere ? 'text-black/50' : 'text-white/50') : 'text-gray-500'}`}>No content available</p>
  }

  return (
    <div
      className={inSphere ? 'w-full' : 'bg-white rounded-lg shadow-xl p-6 overflow-auto max-w-4xl w-full'}
      style={inSphere ? {} : { maxHeight: '95%', height: 'fit-content' }}
    >
      {renderContent()}

      {/* Timestamp - only show outside sphere */}
      {!inSphere && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          {new Date(something.captured_at).toLocaleDateString()} at{' '}
          {new Date(something.captured_at).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
