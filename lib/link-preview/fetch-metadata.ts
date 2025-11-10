/**
 * Link preview metadata extraction
 */

export interface LinkPreviewMetadata {
  url: string
  title?: string
  description?: string
  image?: string
}

/**
 * Fetch link preview metadata from a URL
 * Note: This requires a server-side API to avoid CORS issues
 */
export async function fetchLinkMetadata(url: string): Promise<LinkPreviewMetadata> {
  try {
    // Validate URL format
    new URL(url)

    // TODO: Implement server-side metadata fetching
    // For now, return basic URL info
    return {
      url,
      title: url,
      description: undefined,
      image: undefined,
    }
  } catch (error) {
    console.error('Invalid URL:', error)
    throw new Error('Invalid URL format')
  }
}

/**
 * Validate if a string is a URL
 */
export function isValidUrl(text: string): boolean {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}
