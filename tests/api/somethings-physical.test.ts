import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client before importing the route
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { GET } from '@/app/api/somethings/physical/route'
import { createClient } from '@/lib/supabase/server'

describe('GET /api/somethings/physical', () => {
  const mockCreateClient = vi.mocked(createClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return only Physical somethings with coordinates', async () => {
    const mockSomethings = [
      {
        id: '1',
        user_id: 'user-1',
        realm: 'physical',
        latitude: 32.8810,
        longitude: -117.2340,
        location_name: 'UCSD',
        care: 4,
        captured_at: '2025-11-05T12:00:00Z',
        text_content: 'Test experience',
        content_type: 'text',
      },
      {
        id: '2',
        user_id: 'user-1',
        realm: 'physical',
        latitude: 32.7157,
        longitude: -117.1611,
        location_name: 'Downtown SD',
        care: 5,
        captured_at: '2025-11-04T12:00:00Z',
        text_content: 'Another experience',
        content_type: 'text',
      },
    ]

    // Mock authenticated user and successful query
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockSomethings,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.somethings).toHaveLength(2)
    expect(data.somethings[0].realm).toBe('physical')
    expect(data.somethings[0].latitude).toBeDefined()
    expect(data.somethings[0].longitude).toBeDefined()
  })

  it('should sort somethings by captured_at descending', async () => {
    const mockSomethings = [
      {
        id: '2',
        captured_at: '2025-11-05T12:00:00Z', // More recent
        realm: 'physical',
        latitude: 1,
        longitude: 1,
      },
      {
        id: '1',
        captured_at: '2025-11-04T12:00:00Z', // Older
        realm: 'physical',
        latitude: 1,
        longitude: 1,
      },
    ]

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockSomethings,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.somethings[0].id).toBe('2') // Most recent first
  })

  it('should return 500 on database error', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Database error'),
                }),
              }),
            }),
          }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch somethings')
  })

  it('should return empty array if no somethings found', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.somethings).toEqual([])
  })
})
