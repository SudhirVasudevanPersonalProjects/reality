// tests/components/mind-card.test.tsx
// Unit tests for MindCard component

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MindCard } from '@/app/components/MindCard'

// Mock Next.js router
const mockPush = vi.fn()
const mockBack = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: mockRefresh,
  }),
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}))

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

describe('MindCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Category Badge Rendering', () => {
    it('should render Experience badge with correct icon and label', () => {
      const something = {
        id: '123',
        text_content: 'Test experience',
        captured_at: '2025-11-05T12:00:00Z',
        care: 4,
        attributes: { mind_category: 'experience' },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('🎭')).toBeInTheDocument()
      expect(screen.getByText('EXPERIENCE')).toBeInTheDocument()
      expect(screen.getByText('Past Memory')).toBeInTheDocument()
    })

    it('should render Thought badge by default when category is not set', () => {
      const something = {
        id: '123',
        text_content: 'Test thought',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('💭')).toBeInTheDocument()
      expect(screen.getByText('THOUGHT')).toBeInTheDocument()
      expect(screen.getByText('Reflection')).toBeInTheDocument()
    })

    it('should render Desire badge with correct icon and label', () => {
      const something = {
        id: '123',
        text_content: 'Test desire',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: { mind_category: 'desire' },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('✨')).toBeInTheDocument()
      expect(screen.getByText('DESIRE')).toBeInTheDocument()
      expect(screen.getByText('Future Aspiration')).toBeInTheDocument()
    })
  })

  describe('Content Display', () => {
    it('should render text content with preserved line breaks', () => {
      const something = {
        id: '123',
        text_content: 'Line one\nLine two\nLine three',
        captured_at: '2025-11-05T12:00:00Z',
        care: 4,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('Line one\nLine two\nLine three')).toBeInTheDocument()
    })

    it('should display "Why this matters" section when why field exists', () => {
      const something = {
        id: '123',
        text_content: 'Test content',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: {
          why: 'This is important because...',
        },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('Why this matters:')).toBeInTheDocument()
      expect(screen.getByText('This is important because...')).toBeInTheDocument()
    })

    it('should display empty state when no content or media', () => {
      const something = {
        id: '123',
        text_content: null,
        media_url: null,
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('No content recorded')).toBeInTheDocument()
    })

    it('should display media when media_url exists', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        media_url: 'https://example.com/image.jpg',
        captured_at: '2025-11-05T12:00:00Z',
        care: 4,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      const image = screen.getByAltText('Mind something media')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    })
  })

  describe('Care Rating Display', () => {
    it('should display correct stars for care rating 5', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/★★★★★/)).toBeInTheDocument()
      expect(screen.getByText(/Love/)).toBeInTheDocument()
    })

    it('should display correct stars for care rating 1', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 1,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/★☆☆☆☆/)).toBeInTheDocument()
      expect(screen.getByText(/Hate/)).toBeInTheDocument()
    })
  })

  describe('Location Display', () => {
    it('should display location with "View on Map" link when coordinates exist', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 4,
        location_name: 'San Diego Zoo',
        latitude: 32.7353,
        longitude: -117.1490,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('San Diego Zoo')).toBeInTheDocument()
      expect(screen.getByText('View on Map')).toBeInTheDocument()
      const link = screen.getByText('View on Map').closest('a')
      expect(link).toHaveAttribute('href', '/my_reality?lat=32.7353&lng=-117.1490&zoom=15')
    })

    it('should display "No physical location linked" when no location', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 4,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('No physical location linked')).toBeInTheDocument()
    })
  })

  describe('Sun/Domain Display', () => {
    it('should display default "Somewhere" domain', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('🗑️')).toBeInTheDocument()
      expect(screen.getByText(/Somewhere/)).toBeInTheDocument()
    })

    it('should display Beauty domain when specified', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: { sun_domain: 'beauty' },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('☀️')).toBeInTheDocument()
      expect(screen.getByText(/Beauty/)).toBeInTheDocument()
    })
  })

  describe('Connection Count Display', () => {
    it('should display "No connections yet" when count is 0', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/No connections yet/)).toBeInTheDocument()
    })

    it('should display singular connection count', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={1}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/1 connection/)).toBeInTheDocument()
    })

    it('should display plural connection count', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={5}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/5 connections/)).toBeInTheDocument()
    })
  })

  describe('Desire-Specific Attributes', () => {
    it('should display intensity bar for desires', () => {
      const something = {
        id: '123',
        text_content: 'Learn piano',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: {
          mind_category: 'desire',
          desire_intensity: 0.8,
        },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/Intensity:/)).toBeInTheDocument()
      expect(screen.getByText(/Strong/)).toBeInTheDocument()
      expect(screen.getByText('0.8')).toBeInTheDocument()
    })

    it('should display status badge for desires', () => {
      const something = {
        id: '123',
        text_content: 'Learn piano',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: {
          mind_category: 'desire',
          desire_status: 'active',
        },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/Status:/)).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should display dependencies list for desires', () => {
      const something = {
        id: '123',
        text_content: 'Learn Für Elise',
        captured_at: '2025-11-05T12:00:00Z',
        care: 5,
        attributes: {
          mind_category: 'desire',
        },
      }

      const dependencies = [
        {
          to_something_id: 'dep-1',
          somethings: {
            id: 'dep-1',
            text_content: 'Buy piano',
            attributes: { desire_status: 'fulfilled' },
          },
        },
        {
          to_something_id: 'dep-2',
          somethings: {
            id: 'dep-2',
            text_content: 'Find piano teacher',
            attributes: { desire_status: 'active' },
          },
        },
      ]

      render(
        <MindCard
          something={something}
          connectionCount={2}
          dependencies={dependencies}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText(/Depends on:/)).toBeInTheDocument()
      expect(screen.getByText(/Buy piano/)).toBeInTheDocument()
      expect(screen.getByText(/Find piano teacher/)).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument() // fulfilled
      expect(screen.getByText('⏳')).toBeInTheDocument() // in progress
    })

    it('should not display desire-specific attributes for non-desires', () => {
      const something = {
        id: '123',
        text_content: 'Test thought',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {
          mind_category: 'thought',
        },
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.queryByText(/Intensity:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Status:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Depends on:/)).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should have Back, Edit, and Delete buttons', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should call router.back() when Back button clicked', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      fireEvent.click(screen.getByText('Back'))
      expect(mockBack).toHaveBeenCalled()
    })

    it('should open delete modal when Delete button clicked', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      fireEvent.click(screen.getByText('Delete'))
      expect(screen.getByText('Delete this thought?')).toBeInTheDocument()
    })
  })

  describe('Previous/Next Navigation', () => {
    it('should display Previous button when previousId exists', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId="prev-123"
          nextId={null}
        />
      )

      const prevButton = screen.getByText('← Previous')
      expect(prevButton).toBeInTheDocument()
      expect(prevButton.closest('a')).toHaveAttribute('href', '/mind/prev-123')
    })

    it('should display Next button when nextId exists', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId="next-123"
        />
      )

      const nextButton = screen.getByText('Next →')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton.closest('a')).toHaveAttribute('href', '/mind/next-123')
    })

    it('should not display navigation when no adjacent somethings', () => {
      const something = {
        id: '123',
        text_content: 'Test',
        captured_at: '2025-11-05T12:00:00Z',
        care: 3,
        attributes: {},
      }

      render(
        <MindCard
          something={something}
          connectionCount={0}
          dependencies={null}
          previousId={null}
          nextId={null}
        />
      )

      expect(screen.queryByText('← Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next →')).not.toBeInTheDocument()
    })
  })
})
