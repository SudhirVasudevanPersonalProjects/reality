/**
 * Tests for Assign Abode API endpoint
 * Story 5.4: Chamber Tag Assignment & Visual Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  ilike: vi.fn(() => mockSupabase),
  single: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Import after mocks
import { POST } from '@/app/api/somethings/[id]/assign-abode/route'

describe('Assign Abode API', () => {
  const mockUser = { id: 'user1', email: 'test@test.com' }
  const mockSomething = {
    id: 'something1',
    user_id: 'user1',
    text_content: 'Test content',
    content_type: 'text',
  }
  const mockAbode = {
    id: 'abode1',
    user_id: 'user1',
    text_content: 'Beauty',
    content_type: 'abode',
    attributes: { icon: '✨', color: '#FFD700' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default successful auth
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
  })

  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } })

    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({ abode_name: 'Beauty' }),
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when abode_name is missing', async () => {
    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('abode_name is required')
  })

  it('returns 404 when something not found', async () => {
    // Mock the chain for finding the something
    let callCount = 0
    mockSupabase.from.mockImplementation(() => {
      callCount++
      return mockSupabase
    })
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({ abode_name: 'Beauty' }),
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Something not found')
  })

  it('uses existing abode when found (case-insensitive)', async () => {
    // Track calls to determine which query we're responding to
    let queryIndex = 0

    mockSupabase.single.mockImplementation(() => {
      queryIndex++
      if (queryIndex === 1) {
        // First query: find something
        return Promise.resolve({ data: mockSomething, error: null })
      } else if (queryIndex === 2) {
        // Second query: find existing abode
        return Promise.resolve({ data: mockAbode, error: null })
      }
      return Promise.resolve({ data: null, error: null })
    })

    // Mock update for assignment
    mockSupabase.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({ abode_name: 'beauty' }), // lowercase
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.abode.id).toBe('abode1')
  })

  it('creates new abode when not found', async () => {
    let queryIndex = 0
    const newAbode = {
      id: 'new-abode-id',
      user_id: 'user1',
      text_content: 'NewAbode',
      content_type: 'abode',
      attributes: { icon: '📦', color: '#6B7280' },
    }

    mockSupabase.single.mockImplementation(() => {
      queryIndex++
      if (queryIndex === 1) {
        // First query: find something
        return Promise.resolve({ data: mockSomething, error: null })
      } else if (queryIndex === 2) {
        // Second query: find existing abode - not found
        return Promise.resolve({ data: null, error: { message: 'Not found' } })
      } else if (queryIndex === 3) {
        // Third query: create new abode
        return Promise.resolve({ data: newAbode, error: null })
      }
      return Promise.resolve({ data: null, error: null })
    })

    // Mock update for assignment
    mockSupabase.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({
        abode_name: 'NewAbode',
        icon: '📦',
        color: '#6B7280',
      }),
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.abode.id).toBe('new-abode-id')
  })

  it('creates whys and connections', async () => {
    let queryIndex = 0
    const newWhy = {
      id: 'why-id',
      user_id: 'user1',
      text_content: 'Evokes awe',
      content_type: 'why',
    }

    mockSupabase.single.mockImplementation(() => {
      queryIndex++
      if (queryIndex === 1) {
        return Promise.resolve({ data: mockSomething, error: null })
      } else if (queryIndex === 2) {
        return Promise.resolve({ data: mockAbode, error: null })
      } else if (queryIndex === 3) {
        // Find existing why - not found
        return Promise.resolve({ data: null, error: { message: 'Not found' } })
      } else if (queryIndex === 4) {
        // Create new why
        return Promise.resolve({ data: newWhy, error: null })
      }
      return Promise.resolve({ data: null, error: null })
    })

    // Mock update for assignment
    mockSupabase.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    // Mock insert for connection
    mockSupabase.insert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: newWhy, error: null }),
      }),
    })

    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({
        abode_name: 'Beauty',
        whys: ['Evokes awe'],
      }),
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('handles empty whys array', async () => {
    let queryIndex = 0

    mockSupabase.single.mockImplementation(() => {
      queryIndex++
      if (queryIndex === 1) {
        return Promise.resolve({ data: mockSomething, error: null })
      } else if (queryIndex === 2) {
        return Promise.resolve({ data: mockAbode, error: null })
      }
      return Promise.resolve({ data: null, error: null })
    })

    mockSupabase.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const request = new NextRequest('http://localhost/api/somethings/1/assign-abode', {
      method: 'POST',
      body: JSON.stringify({
        abode_name: 'Beauty',
        whys: [],
      }),
    })

    const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.whyIds).toEqual([])
  })
})
