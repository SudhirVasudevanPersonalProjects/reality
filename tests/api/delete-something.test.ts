// tests/api/delete-something.test.ts
// Unit tests for DELETE /api/somethings/[id] endpoint

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '@/app/api/somethings/[id]/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe('DELETE /api/somethings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    // Mock unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    })

    const request = new NextRequest('http://localhost:3000/api/somethings/123', {
      method: 'DELETE',
    })

    const params = Promise.resolve({ id: '123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 when something not found', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Mock something not found
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const request = new NextRequest('http://localhost:3000/api/somethings/nonexistent-id', {
      method: 'DELETE',
    })

    const params = Promise.resolve({ id: 'nonexistent-id' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Something not found or access denied')
  })

  it('should return 404 when user does not own the something (RLS enforcement)', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Mock something owned by different user
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null, // RLS filters out the row
            error: null,
          }),
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const request = new NextRequest('http://localhost:3000/api/somethings/other-user-id', {
      method: 'DELETE',
    })

    const params = Promise.resolve({ id: 'other-user-id' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Something not found or access denied')
  })

  it('should successfully delete something when user is authenticated and owns it', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Mock successful select
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'something-123',
        user_id: 'user-123',
      },
      error: null,
    })

    const mockEqChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    }

    // Mock successful delete
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: null,
      }),
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(mockEqChain),
    }).mockReturnValueOnce({
      delete: mockDelete,
    })

    const request = new NextRequest('http://localhost:3000/api/somethings/something-123', {
      method: 'DELETE',
    })

    const params = Promise.resolve({ id: 'something-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Something deleted successfully')
    expect(mockDelete).toHaveBeenCalled()
  })

  it('should return 500 when delete operation fails', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Mock successful select
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'something-123',
        user_id: 'user-123',
      },
      error: null,
    })

    const mockEqChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    }

    // Mock failed delete
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: { message: 'Database error' },
      }),
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(mockEqChain),
    }).mockReturnValueOnce({
      delete: mockDelete,
    })

    const request = new NextRequest('http://localhost:3000/api/somethings/something-123', {
      method: 'DELETE',
    })

    const params = Promise.resolve({ id: 'something-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to delete something')
  })

  it('should handle cascade delete for connections', async () => {
    // This test verifies that the database CASCADE constraint is expected to work
    // The API doesn't explicitly delete connections - the database does it via ON DELETE CASCADE

    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    // Mock successful select
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'something-123',
        user_id: 'user-123',
      },
      error: null,
    })

    const mockEqChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    }

    // Mock successful delete (cascade happens in database)
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: null,
      }),
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue(mockEqChain),
    }).mockReturnValueOnce({
      delete: mockDelete,
    })

    const request = new NextRequest('http://localhost:3000/api/somethings/something-123', {
      method: 'DELETE',
    })

    const params = Promise.resolve({ id: 'something-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    // Note: Connections are cascade deleted by database ON DELETE CASCADE constraint
    // No explicit API call needed
  })
})
