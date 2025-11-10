/**
 * Integration tests for POST /api/somethings (Live-Capture flow)
 * Tests full capture submission including database insertion
 */

import { createClient } from '@/lib/supabase/server'
import { vi } from 'vitest'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
}

describe('POST /api/somethings - Live-Capture Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockResolvedValue(mockSupabaseClient)
  })

  it('should create text-only something with realm:null', async () => {
    const mockUserId = 'user-123'
    const mockSomethingId = 'something-456'

    // Mock authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId, email: 'test@example.com' } },
      error: null,
    })

    // Mock successful database insert
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockSomethingId,
            text_content: 'Test capture text',
            media_url: null,
            captured_at: new Date().toISOString(),
          },
          error: null,
        }),
      }),
    })

    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    })

    // Simulate API request
    const formData = new FormData()
    formData.append('text_content', 'Test capture text')

    const { POST } = await import('@/app/api/somethings/route')
    const request = new Request('http://localhost:3000/api/somethings', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    // Verify response
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.somethings).toHaveLength(1)
    expect(data.somethings[0].text_content).toBe('Test capture text')

    // Verify database insert called with correct data
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUserId,
      text_content: 'Test capture text',
      content_type: 'text', // CRITICAL: content_type required by database schema
      realm: null, // CRITICAL: realm must be NULL for Phase 1
      captured_at: expect.any(String),
    })
  })

  it('should reject unauthenticated requests', async () => {
    // Mock unauthenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const formData = new FormData()
    formData.append('text_content', 'Test text')

    const { POST } = await import('@/app/api/somethings/route')
    const request = new Request('http://localhost:3000/api/somethings', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should reject empty text_content', async () => {
    const mockUserId = 'user-123'

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId, email: 'test@example.com' } },
      error: null,
    })

    const formData = new FormData()
    // No text_content, no files

    const { POST } = await import('@/app/api/somethings/route')
    const request = new Request('http://localhost:3000/api/somethings', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('No content provided')
  })

  it('should trim whitespace from text_content', async () => {
    const mockUserId = 'user-123'

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId, email: 'test@example.com' } },
      error: null,
    })

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'something-456',
            text_content: 'Trimmed text',
            media_url: null,
            captured_at: new Date().toISOString(),
          },
          error: null,
        }),
      }),
    })

    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
    })

    const formData = new FormData()
    formData.append('text_content', '   Trimmed text   ')

    const { POST } = await import('@/app/api/somethings/route')
    const request = new Request('http://localhost:3000/api/somethings', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify trimmed text was stored with required fields
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        text_content: 'Trimmed text',
        content_type: 'text',
      })
    )
  })

  it('should handle database errors gracefully', async () => {
    const mockUserId = 'user-123'

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId, email: 'test@example.com' } },
      error: null,
    })

    // Mock database error
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database constraint violation' },
          }),
        }),
      }),
    })

    const formData = new FormData()
    formData.append('text_content', 'Test text')

    const { POST } = await import('@/app/api/somethings/route')
    const request = new Request('http://localhost:3000/api/somethings', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Failed to create')
  })
})
