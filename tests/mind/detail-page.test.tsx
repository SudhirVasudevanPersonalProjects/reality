// tests/mind/detail-page.test.tsx
// Integration tests for Mind detail page

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}))

// Mock Supabase server client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Mock MindCard component
vi.mock('@/app/components/MindCard', () => ({
  MindCard: ({ something, connectionCount }: any) => (
    <div data-testid="mind-card">
      <h1>{something.text_content}</h1>
      <div>Connections: {connectionCount}</div>
    </div>
  ),
}))

describe('Mind Detail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should redirect to login when user is not authenticated', async () => {
      const { redirect } = await import('next/navigation')

      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: 'test-id' }) })

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('URL Validation', () => {
    it('should return 404 for invalid UUID format', async () => {
      const { notFound } = await import('next/navigation')

      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: 'invalid-id' }) })

      expect(notFound).toHaveBeenCalled()
    })

    it('should accept valid UUID format', async () => {
      const { notFound } = await import('next/navigation')

      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      // Mock something data
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
        single: vi.fn().mockResolvedValue({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            text_content: 'Test',
            realm: 'mind',
            captured_at: '2025-11-05T12:00:00Z',
            care: 3,
          },
          error: null,
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) })

      // Should not call notFound
      expect(notFound).not.toHaveBeenCalled()
    })
  })

  describe('Data Fetching', () => {
    it('should return 404 when something not found', async () => {
      const { notFound } = await import('next/navigation')

      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      // Mock something not found
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) })

      expect(notFound).toHaveBeenCalled()
    })

    it('should return 404 when realm is not mind', async () => {
      const { notFound } = await import('next/navigation')

      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      // Mock physical something (wrong realm)
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
        single: vi.fn().mockResolvedValue({
          data: null, // Filtered out by realm='mind' query
          error: { message: 'Not found' },
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) })

      expect(notFound).toHaveBeenCalled()
    })
  })

  describe('Connection Count Query', () => {
    it('should query bidirectional connections', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const testId = '550e8400-e29b-41d4-a716-446655440000'

      // Mock something data
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
        single: vi.fn().mockResolvedValue({
          data: {
            id: testId,
            text_content: 'Test',
            realm: 'mind',
            captured_at: '2025-11-05T12:00:00Z',
            care: 3,
          },
          error: null,
        }),
      })

      // Mock connection count query
      const mockOr = vi.fn().mockResolvedValue({ count: 5 })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'somethings') {
          return { select: mockSelect }
        }
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({ or: mockOr }),
          }
        }
        return { select: vi.fn() }
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: testId }) })

      // Verify bidirectional query was made
      expect(mockOr).toHaveBeenCalledWith(`from_something_id.eq.${testId},to_something_id.eq.${testId}`)
    })
  })

  describe('Dependencies Query for Desires', () => {
    it('should fetch dependencies when something is a desire', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const testId = '550e8400-e29b-41d4-a716-446655440000'

      // Mock desire something
      const mockSelect = vi.fn().mockImplementation((query: string) => {
        if (query === '*') {
          return {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: testId,
                text_content: 'Learn piano',
                realm: 'mind',
                captured_at: '2025-11-05T12:00:00Z',
                care: 5,
                attributes: { mind_category: 'desire' },
              },
              error: null,
            }),
          }
        }
        if (query.includes('to_something_id')) {
          // Dependencies query
          return {
            eq: vi.fn().mockReturnThis(),
            data: [
              {
                to_something_id: 'dep-1',
                somethings: {
                  id: 'dep-1',
                  text_content: 'Buy piano',
                  attributes: { desire_status: 'fulfilled' },
                },
              },
            ],
            error: null,
          }
        }
        return {
          eq: vi.fn().mockReturnThis(),
          or: vi.fn().mockResolvedValue({ count: 1 }),
        }
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: testId }) })

      // Dependencies query should be made
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('to_something_id'))
    })

    it('should not fetch dependencies for non-desires', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const testId = '550e8400-e29b-41d4-a716-446655440000'

      // Mock thought something (not desire)
      const mockSelect = vi.fn().mockImplementation((query: string) => {
        if (query === '*') {
          return {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: testId,
                text_content: 'Test thought',
                realm: 'mind',
                captured_at: '2025-11-05T12:00:00Z',
                care: 3,
                attributes: { mind_category: 'thought' },
              },
              error: null,
            }),
          }
        }
        return {
          eq: vi.fn().mockReturnThis(),
          or: vi.fn().mockResolvedValue({ count: 0 }),
        }
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const MindDetailPage = (await import('@/app/mind/[id]/page')).default
      await MindDetailPage({ params: Promise.resolve({ id: testId }) })

      // Dependencies query should NOT be made (only 2 selects: something + connections count)
      const selectCalls = mockSelect.mock.calls
      expect(selectCalls.some((call: any[]) => call[0]?.includes('depends_on'))).toBe(false)
    })
  })
})
