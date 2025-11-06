import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PATCH } from '@/app/api/somethings/[id]/organize/route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase and tags helpers
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

vi.mock('@/lib/api/tags', () => ({
  upsertTags: vi.fn().mockResolvedValue(['tag-1', 'tag-2']),
  linkTagsToSomething: vi.fn().mockResolvedValue(undefined)
}))

describe('Organize API Endpoint', () => {
  const mockUserId = 'test-user-123'
  const mockSomethingId = 'test-something-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should organize physical something successfully', async () => {
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
      single: vi.fn()
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            user_id: mockUserId,
            realm: null,
            text_content: 'Test content'
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            realm: 'physical',
            care: 4,
            location_name: 'Palo Alto Blue Bottle',
            updated_at: '2025-11-04T10:00:00Z'
          },
          error: null
        }),
      update: vi.fn().mockReturnThis()
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 4,
        location_name: 'Palo Alto Blue Bottle'
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.something.realm).toBe('physical')
    expect(data.something.care).toBe(4)
    expect(data.something.location_name).toBe('Palo Alto Blue Bottle')
  })

  it('should organize mind something successfully', async () => {
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
      single: vi.fn()
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            user_id: mockUserId,
            realm: null,
            text_content: 'Test thought'
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            realm: 'mind',
            care: 5,
            updated_at: '2025-11-04T10:00:00Z'
          },
          error: null
        }),
      update: vi.fn().mockReturnThis()
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'mind',
        care: 5,
        tags: ['reflection', 'insight']
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.something.realm).toBe('mind')
    expect(data.something.care).toBe(5)
  })

  it('should return 401 if user not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated')
        })
      }
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Test'
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })

    expect(response.status).toBe(401)
  })

  it('should return 404 if something not found', async () => {
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

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Test'
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })

    expect(response.status).toBe(404)
  })

  it('should return 403 if trying to organize split parent', async () => {
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
          realm: 'split', // Split parent
          text_content: '[Split into 3 parts]'
        },
        error: null
      })
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Test'
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('split parent')
  })

  it('should return 400 for invalid request body', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null
        })
      }
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'invalid',
        care: 3
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })

    expect(response.status).toBe(400)
  })

  // Story 2.5: Coordinate validation tests
  it('should organize physical something with valid coordinates', async () => {
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
      single: vi.fn()
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            user_id: mockUserId,
            realm: null,
            text_content: 'Coffee at Philz'
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            realm: 'physical',
            care: 4,
            location_name: 'Philz Coffee',
            latitude: 32.870427,
            longitude: -117.214683,
            formatted_address: '8657 Villa La Jolla Dr, La Jolla, CA 92037',
            visited: true,
            updated_at: '2025-11-05T10:00:00Z'
          },
          error: null
        }),
      update: vi.fn().mockReturnThis()
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 4,
        location_name: 'Philz Coffee',
        latitude: 32.870427,
        longitude: -117.214683,
        formatted_address: '8657 Villa La Jolla Dr, La Jolla, CA 92037'
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.something.latitude).toBe(32.870427)
    expect(data.something.longitude).toBe(-117.214683)
    expect(data.something.formatted_address).toBe('8657 Villa La Jolla Dr, La Jolla, CA 92037')
  })

  it('should return 400 for invalid latitude (-91)', async () => {
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
          realm: null
        },
        error: null
      })
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Test Location',
        latitude: -91, // Invalid
        longitude: -117.0
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid latitude')
  })

  it('should return 400 for invalid longitude (181)', async () => {
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
          realm: null
        },
        error: null
      })
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Test Location',
        latitude: 32.0,
        longitude: 181 // Invalid
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid longitude')
  })

  it('should allow physical organization without coordinates', async () => {
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
      single: vi.fn()
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            user_id: mockUserId,
            realm: null
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            realm: 'physical',
            care: 3,
            location_name: 'Obscure Place',
            latitude: null,
            longitude: null,
            updated_at: '2025-11-05T10:00:00Z'
          },
          error: null
        }),
      update: vi.fn().mockReturnThis()
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Obscure Place'
        // No coordinates provided
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should verify formatted_address is saved to database', async () => {
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
      single: vi.fn()
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            user_id: mockUserId,
            realm: null
          },
          error: null
        })
        .mockResolvedValueOnce({
          data: {
            id: mockSomethingId,
            realm: 'physical',
            care: 5,
            location_name: 'La Jolla Cove',
            latitude: 32.851,
            longitude: -117.271,
            formatted_address: 'La Jolla Cove, 1100 Coast Blvd, La Jolla, CA 92037',
            visited: true,
            updated_at: '2025-11-05T10:00:00Z'
          },
          error: null
        }),
      update: vi.fn().mockReturnThis()
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest(`http://localhost:3000/api/somethings/${mockSomethingId}/organize`, {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 5,
        location_name: 'La Jolla Cove',
        latitude: 32.851,
        longitude: -117.271,
        formatted_address: 'La Jolla Cove, 1100 Coast Blvd, La Jolla, CA 92037'
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.something.formatted_address).toBe('La Jolla Cove, 1100 Coast Blvd, La Jolla, CA 92037')
  })
})
