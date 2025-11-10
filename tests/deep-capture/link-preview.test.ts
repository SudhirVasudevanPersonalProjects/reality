/**
 * Unit Tests: Link preview metadata extraction for Deep-Capture
 */

import { fetchLinkMetadata, isValidUrl } from '@/lib/link-preview/fetch-metadata'

describe('Deep-Capture Link Preview', () => {
  describe('isValidUrl', () => {
    it('should return true for valid HTTP URL', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('should return true for valid HTTPS URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should return true for URL with path', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true)
    })

    it('should return true for URL with query params', () => {
      expect(isValidUrl('https://example.com?param=value')).toBe(true)
    })

    it('should return true for social media URLs', () => {
      expect(isValidUrl('https://instagram.com/p/ABC123')).toBe(true)
      expect(isValidUrl('https://tiktok.com/@user/video/123')).toBe(true)
      expect(isValidUrl('https://youtube.com/watch?v=ABC123')).toBe(true)
    })

    it('should return false for invalid URL', () => {
      expect(isValidUrl('not a url')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidUrl('')).toBe(false)
    })

    it('should return false for malformed URL', () => {
      expect(isValidUrl('htp://example')).toBe(false)
    })

    it('should return false for URL without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false)
    })
  })

  describe('fetchLinkMetadata', () => {
    it('should return basic metadata for valid URL', async () => {
      const url = 'https://example.com'
      const metadata = await fetchLinkMetadata(url)

      expect(metadata.url).toBe(url)
      expect(metadata.title).toBeDefined()
    })

    it('should throw error for invalid URL', async () => {
      await expect(fetchLinkMetadata('not a url')).rejects.toThrow('Invalid URL format')
    })

    it('should handle URL with special characters', async () => {
      const url = 'https://example.com/path?query=value&other=123'
      const metadata = await fetchLinkMetadata(url)

      expect(metadata.url).toBe(url)
    })

    it('should return metadata structure', async () => {
      const url = 'https://example.com'
      const metadata = await fetchLinkMetadata(url)

      expect(metadata).toHaveProperty('url')
      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('description')
      expect(metadata).toHaveProperty('image')
    })
  })
})
