'use client'

interface LinkPreviewCardProps {
  url: string
  title?: string
  description?: string
  image?: string
}

export default function LinkPreviewCard({
  url,
  title,
  description,
  image
}: LinkPreviewCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors"
    >
      {/* Image */}
      {image && (
        <div className="w-full h-48 bg-gray-100">
          <img
            src={image}
            alt={title || url}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2">
        {title && (
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
        )}

        {description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
        )}

        <p className="text-xs text-blue-600 truncate">
          {url}
        </p>
      </div>
    </a>
  )
}
