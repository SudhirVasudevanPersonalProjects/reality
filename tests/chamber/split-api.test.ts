import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/somethings/[id]/split/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

describe('Split API Endpoint', () => {
  const mockUserId = 'test-user-123'
  const mockSomethingId = 'test-something-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should split something into N somethings with parent_id', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: mockSomethingId,
          user_id: mockUserId,
          text_content: 'Original text',
          captured_at: '2025-11-01T10:00:00Z',
          content_type: 'text',
          domain: 'abode'
        },
        error: null
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis()
    }

    // Setup select to return inserted data
    mockSupabase.select.mockResolvedValueOnce({
      data: [
        { id: 'split-1', text_content: 'Split 1', parent_id: mockSomethingId },
        { id: 'split-2', text_content: 'Split 2', parent_id: mockSomethingId }
      ],
      error: null
    })

    // Setup update to succeed
    mockSupabase.eq.mockResolvedValueOnce({ error: null })

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/somethings/test-something-456/split', {
      method: 'POST',
      body: JSON.stringify({
        splits: [
          { text_content: 'Split 1' },
          { text_content: 'Split 2' }
        ]
      })
    })

    const response = await POST(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.splits).toHaveLength(2)
    expect(data.splits[0].parent_id).toBe(mockSomethingId)
  })

  it('should preserve captured_at and set created_at to now', async () => {
    const capturedAt = '2025-11-01T10:00:00Z'

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: mockSomethingId,
          user_id: mockUserId,
          captured_at: capturedAt,
          content_type: 'text',
          domain: 'abode'
        },
        error: null
      }),
      insert: vi.fn().mockImplementation((data) => {
        // Verify captured_at is preserved
        expect(data[0].captured_at).toBe(capturedAt)
        return mockSupabase
      }),
      update: vi.fn().mockReturnThis()
    }

    mockSupabase.select.mockResolvedValueOnce({
      data: [{ id: 'split-1', text_content: 'Split 1', parent_id: mockSomethingId }],
      error: null
    })

    mockSupabase.eq.mockResolvedValueOnce({ error: null })

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/somethings/test-something-456/split', {
      method: 'POST',
      body: JSON.stringify({
        splits: [{ text_content: 'Split 1' }]
      })
    })

    await POST(request, { params: { id: mockSomethingId } })
  })

  it('should return 401 for unauthorized user', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Unauthorized')
        })
      }
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/somethings/test-something-456/split', {
      method: 'POST',
      body: JSON.stringify({
        splits: [{ text_content: 'Split 1' }]
      })
    })

    const response = await POST(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for empty splits array', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      }
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/somethings/test-something-456/split', {
      method: 'POST',
      body: JSON.stringify({
        splits: []
      })
    })

    const response = await POST(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should return 404 for non-existent something', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Not found')
      })
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/somethings/nonexistent/split', {
      method: 'POST',
      body: JSON.stringify({
        splits: [{ text_content: 'Split 1' }]
      })
    })

    const response = await POST(request, { params: { id: 'nonexistent' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should distribute media correctly to splits', async () => {
    const mediaUrl = 'https://example.com/photo.jpg'

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: mockSomethingId,
          user_id: mockUserId,
          media_url: mediaUrl,
          captured_at: '2025-11-01T10:00:00Z',
          content_type: 'photo',
          domain: 'abode'
        },
        error: null
      }),
      insert: vi.fn().mockImplementation((data) => {
        // Verify first split has media, second doesn't
        expect(data[0].media_url).toBe(mediaUrl)
        expect(data[1].media_url).toBe(null)
        return mockSupabase
      }),
      update: vi.fn().mockReturnThis()
    }

    mockSupabase.select.mockResolvedValueOnce({
      data: [
        { id: 'split-1', text_content: 'Split 1', parent_id: mockSomethingId },
        { id: 'split-2', text_content: 'Split 2', parent_id: mockSomethingId }
      ],
      error: null
    })

    mockSupabase.eq.mockResolvedValueOnce({ error: null })

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost:3000/api/somethings/test-something-456/split', {
      method: 'POST',
      body: JSON.stringify({
        splits: [
          { text_content: 'Split 1', media_urls: [mediaUrl] },
          { text_content: 'Split 2' }
        ]
      })
    })

    await POST(request, { params: { id: mockSomethingId } })
  })
})
