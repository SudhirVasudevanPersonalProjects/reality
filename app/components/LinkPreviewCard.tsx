'use client'

import Image from 'next/image'

interface LinkPreviewCardProps {
  url: string
  title?: string
  description?: string
  image?: string
  inSphere?: boolean
  isBrightSphere?: boolean
}

export default function LinkPreviewCard({
  url,
  title,
  description,
  image,
  inSphere = false,
  isBrightSphere = false
}: LinkPreviewCardProps) {
  // Check if this is a mobile video (Shorts/TikTok)
  const isMobileVideo = url.includes('youtube.com/shorts') || url.includes('tiktok.com')

  console.log('[LinkPreviewCard] URL:', url, 'Image:', image, 'isMobileVideo:', isMobileVideo)

  return (
    <div className="flex flex-col items-center">
      {/* Thumbnail on top */}
      {image && (() => {
        if (isMobileVideo) {
          // Mobile video (Shorts/TikTok): 9:16 portrait with side cropping
          const displayHeight = 400
          const displayWidth = displayHeight * (9 / 16)

          return (
            <div className="relative bg-gray-100 rounded overflow-hidden mb-2" style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}>
              <Image
                src={image}
                alt={title || url}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error('Failed to load thumbnail:', image)
                }}
              />
            </div>
          )
        } else {
          // Regular YouTube video: landscape 16:9
          return (
            <div className="relative bg-gray-100 rounded overflow-hidden mb-2" style={{ width: 'fit-content', maxWidth: '100%' }}>
              <Image
                src={image}
                alt={title || url}
                width={320}
                height={180}
                className="object-contain"
                style={{ width: 'auto', height: 'auto', maxWidth: '320px' }}
                onError={(e) => {
                  console.error('Failed to load thumbnail:', image)
                }}
              />
            </div>
          )
        }
      })()}

      {/* Link below thumbnail */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-sm italic underline block px-2 text-center break-all outline-none focus:outline-none active:outline-none ${
          inSphere
            ? (isBrightSphere ? 'text-black hover:text-black/70' : 'text-white hover:text-white/70')
            : 'text-black hover:text-gray-700'
        }`}
      >
        {url}
      </a>
    </div>
  )
}
