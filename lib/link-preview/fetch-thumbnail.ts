/**
 * Link Thumbnail Fetcher
 *
 * Fetches thumbnails for YouTube Shorts and TikTok videos
 */

/**
 * Fetch thumbnail URL for a link
 * @param url The URL to fetch thumbnail for
 * @returns Thumbnail URL or null if not available
 */
export async function fetchLinkThumbnail(url: string): Promise<string | null> {
  try {
    // YouTube Shorts or regular YouTube videos
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    )
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    // TikTok
    if (url.includes('tiktok.com')) {
      const response = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
      )
      if (!response.ok) {
        console.warn('TikTok oembed failed:', response.status)
        return null
      }
      const data = await response.json()
      return data.thumbnail_url || null
    }

    // No thumbnail available for other URLs
    return null
  } catch (error) {
    console.error('Failed to fetch link thumbnail:', error)
    return null
  }
}

/**
 * Check if a URL is a supported video platform
 */
export function isSupportedVideoUrl(url: string): boolean {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('tiktok.com')
  )
}

/**
 * Extract video platform name from URL
 */
export function getVideoPlatform(url: string): string | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube'
  }
  if (url.includes('tiktok.com')) {
    return 'TikTok'
  }
  return null
}
