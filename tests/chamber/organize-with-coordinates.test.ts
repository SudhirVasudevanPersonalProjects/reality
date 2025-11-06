/**
 * Integration tests for organize API with coordinate handling
 * Story 2.5: Physical Location Capture & Geocoding
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from '@/app/api/somethings/[id]/organize/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// Mock tags API
vi.mock('@/lib/api/tags', () => ({
  upsertTags: vi.fn(),
  linkTagsToSomething: vi.fn()
}))

describe('Organize API - Coordinate Handling', () => {
  const mockUserId = 'test-user-123'
  const mockSomethingId = 'something-123'

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null
    })
  })

  it('should accept and save coordinates for Physical realm', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null,
      text_content: 'Coffee at Philz'
    }

    const mockUpdatedSomething = {
      id: mockSomethingId,
      realm: 'physical',
      care: 4,
      location_name: 'Philz Coffee',
      latitude: 32.870427,
      longitude: -117.214683,
      formatted_address: '8657 Villa La Jolla Dr, La Jolla, CA 92037',
      visited: true,
      updated_at: '2025-11-05T12:00:00Z'
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdatedSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
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

  it('should validate latitude range (-90 to 90)', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Invalid Location',
        latitude: -91, // Invalid
        longitude: -117.0
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/latitude|Too small/i)
  })

  it('should validate longitude range (-180 to 180)', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Invalid Location',
        latitude: 32.0,
        longitude: 181 // Invalid
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/longitude|Too big/i)
  })

  it('should allow Physical submission without coordinates (with warning)', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    const mockUpdatedSomething = {
      id: mockSomethingId,
      realm: 'physical',
      care: 3,
      location_name: 'Obscure Location',
      latitude: null,
      longitude: null,
      formatted_address: null,
      updated_at: '2025-11-05T12:00:00Z'
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdatedSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        location_name: 'Obscure Location'
        // No coordinates provided
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    // Should succeed (Option 2: Allow with Warning)
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.something.latitude).toBeUndefined()
    expect(data.something.longitude).toBeUndefined()
  })

  it('should save formatted_address field correctly', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    const mockUpdatedSomething = {
      id: mockSomethingId,
      realm: 'physical',
      care: 5,
      location_name: 'La Jolla Cove',
      latitude: 32.851,
      longitude: -117.271,
      formatted_address: 'La Jolla Cove, 1100 Coast Blvd, La Jolla, CA 92037',
      visited: true,
      updated_at: '2025-11-05T12:00:00Z'
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdatedSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
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
    expect(data.success).toBe(true)
    expect(data.something.formatted_address).toBe('La Jolla Cove, 1100 Coast Blvd, La Jolla, CA 92037')
  })

  it('should NOT require coordinates for Mind realm', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    const mockUpdatedSomething = {
      id: mockSomethingId,
      realm: 'mind',
      care: 4,
      location_name: null,
      latitude: null,
      longitude: null,
      updated_at: '2025-11-05T12:00:00Z'
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdatedSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'mind',
        care: 4,
        tags: ['insight', 'reflection']
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.something.realm).toBe('mind')
  })

  it('should accept manual coordinates with NULL formatted_address (Story 2.6)', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    const mockUpdatedSomething = {
      id: mockSomethingId,
      realm: 'physical',
      care: 4,
      location_name: 'My Favorite Beach',
      latitude: 32.715736,
      longitude: -117.161087,
      formatted_address: null, // NULL for manual coordinates
      visited: true,
      updated_at: '2025-11-05T12:00:00Z'
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUpdatedSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 4,
        location_name: 'My Favorite Beach',
        latitude: 32.715736,
        longitude: -117.161087
        // No formatted_address (manual coordinates)
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.something.latitude).toBe(32.715736)
    expect(data.something.longitude).toBe(-117.161087)
    expect(data.something.formatted_address).toBeFalsy() // NULL or undefined
  })

  it('should validate location_name is required for Physical realm (Story 2.6)', async () => {
    const mockSomething = {
      id: mockSomethingId,
      user_id: mockUserId,
      realm: null
    }

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSomething, error: null })
          })
        })
      })
    })

    const request = new NextRequest('http://localhost/api/somethings/something-123/organize', {
      method: 'PATCH',
      body: JSON.stringify({
        realm: 'physical',
        care: 3,
        latitude: 32.8810,
        longitude: -117.2340
        // Missing location_name!
      })
    })

    const response = await PATCH(request, { params: { id: mockSomethingId } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Location name is required')
  })
})
