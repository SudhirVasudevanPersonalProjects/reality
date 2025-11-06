import { describe, it, expect } from 'vitest'
import { splitRequestSchema } from '@/lib/schemas/split'

describe('Split Request Validation', () => {
  it('should validate correct split request', () => {
    const validRequest = {
      splits: [
        { text_content: 'Split 1' },
        { text_content: 'Split 2' }
      ]
    }

    const result = splitRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should validate split request with media URLs', () => {
    const validRequest = {
      splits: [
        {
          text_content: 'Split with media',
          media_urls: ['https://example.com/photo.jpg']
        }
      ]
    }

    const result = splitRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should reject empty splits array', () => {
    const invalidRequest = {
      splits: []
    }

    const result = splitRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message)
      expect(errorMessages.some(msg => msg.includes('At least one split'))).toBe(true)
    }
  })

  it('should reject split with empty text_content', () => {
    const invalidRequest = {
      splits: [
        { text_content: '' }
      ]
    }

    const result = splitRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should reject invalid media URL format', () => {
    const invalidRequest = {
      splits: [
        {
          text_content: 'Split with bad URL',
          media_urls: ['not-a-valid-url']
        }
      ]
    }

    const result = splitRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should accept split without media_urls', () => {
    const validRequest = {
      splits: [
        { text_content: 'Text only split' }
      ]
    }

    const result = splitRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should validate multiple splits with mixed media', () => {
    const validRequest = {
      splits: [
        {
          text_content: 'Split 1 with media',
          media_urls: ['https://example.com/photo1.jpg']
        },
        {
          text_content: 'Split 2 no media'
        },
        {
          text_content: 'Split 3 multiple media',
          media_urls: [
            'https://example.com/photo2.jpg',
            'https://example.com/video.mp4'
          ]
        }
      ]
    }

    const result = splitRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })
})
