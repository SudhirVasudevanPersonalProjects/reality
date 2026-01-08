/**
 * Tests for Link Thumbnail Fetching
 */

import { describe, it, expect, vi } from 'vitest'
import { fetchLinkThumbnail, isSupportedVideoUrl, getVideoPlatform } from '@/lib/link-preview/fetch-thumbnail'

// Mock fetch globally
global.fetch = vi.fn()

describe('fetch-thumbnail', () => {
  describe('fetchLinkThumbnail', () => {
    it('should extract YouTube video ID and return thumbnail URL', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
    })

    it('should handle YouTube Shorts URLs', async () => {
      const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ'
      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
    })

    it('should handle youtu.be short URLs', async () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
    })

    it('should fetch TikTok thumbnail via oembed', async () => {
      const url = 'https://www.tiktok.com/@user/video/1234567890'
      const mockResponse = {
        thumbnail_url: 'https://example.com/tiktok-thumb.jpg',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBe('https://example.com/tiktok-thumb.jpg')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.tiktok.com/oembed?url=')
      )
    })

    it('should return null for TikTok when oembed fails', async () => {
      const url = 'https://www.tiktok.com/@user/video/1234567890'

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBeNull()
    })

    it('should return null for TikTok when thumbnail_url is missing', async () => {
      const url = 'https://www.tiktok.com/@user/video/1234567890'

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ title: 'Video' }), // No thumbnail_url
      })

      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBeNull()
    })

    it('should return null for unsupported URLs', async () => {
      const url = 'https://example.com/page'
      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      const url = 'https://www.tiktok.com/@user/video/1234567890'

      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const thumbnail = await fetchLinkThumbnail(url)

      expect(thumbnail).toBeNull()
    })
  })

  describe('isSupportedVideoUrl', () => {
    it('should return true for YouTube URLs', () => {
      expect(isSupportedVideoUrl('https://www.youtube.com/watch?v=123')).toBe(true)
      expect(isSupportedVideoUrl('https://youtu.be/123')).toBe(true)
      expect(isSupportedVideoUrl('https://www.youtube.com/shorts/123')).toBe(true)
    })

    it('should return true for TikTok URLs', () => {
      expect(isSupportedVideoUrl('https://www.tiktok.com/@user/video/123')).toBe(true)
    })

    it('should return false for unsupported URLs', () => {
      expect(isSupportedVideoUrl('https://example.com')).toBe(false)
      expect(isSupportedVideoUrl('https://vimeo.com/123')).toBe(false)
    })
  })

  describe('getVideoPlatform', () => {
    it('should return YouTube for YouTube URLs', () => {
      expect(getVideoPlatform('https://www.youtube.com/watch?v=123')).toBe('YouTube')
      expect(getVideoPlatform('https://youtu.be/123')).toBe('YouTube')
    })

    it('should return TikTok for TikTok URLs', () => {
      expect(getVideoPlatform('https://www.tiktok.com/@user/video/123')).toBe('TikTok')
    })

    it('should return null for unsupported URLs', () => {
      expect(getVideoPlatform('https://example.com')).toBeNull()
    })
  })
})
