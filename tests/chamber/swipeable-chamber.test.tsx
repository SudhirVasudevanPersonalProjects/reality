/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

// Import after mocks
import ChamberClient from '@/app/chamber/ChamberClient'

describe('ChamberClient - Swipeable Chamber', () => {
  const mockSomethings = [
    {
      id: '1',
      user_id: 'user-1',
      text_content: 'First something',
      media_url: null,
      content_type: 'text',
      captured_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      realm: null,
      location_name: null,
      latitude: null,
      longitude: null,
      formatted_address: null,
      care: null,
      tags: null,
      attributes: null,
    },
    {
      id: '2',
      user_id: 'user-1',
      text_content: 'Second something',
      media_url: null,
      content_type: 'text',
      captured_at: '2025-01-02T00:00:00Z',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      realm: null,
      location_name: null,
      latitude: null,
      longitude: null,
      formatted_address: null,
      care: null,
      tags: null,
      attributes: null,
    },
    {
      id: '3',
      user_id: 'user-1',
      text_content: 'Third something',
      media_url: null,
      content_type: 'text',
      captured_at: '2025-01-03T00:00:00Z',
      created_at: '2025-01-03T00:00:00Z',
      updated_at: '2025-01-03T00:00:00Z',
      realm: null,
      location_name: null,
      latitude: null,
      longitude: null,
      formatted_address: null,
      care: null,
      tags: null,
      attributes: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renders first something on initial load', () => {
    render(<ChamberClient somethings={mockSomethings} />)

    expect(screen.getByText('First something')).toBeInTheDocument()
    expect(screen.queryByText('Second something')).not.toBeInTheDocument()
  })

  it('displays position indicator for multiple somethings', () => {
    render(<ChamberClient somethings={mockSomethings} />)

    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('hides position indicator for single something', () => {
    render(<ChamberClient somethings={[mockSomethings[0]]} />)

    // Position indicator shows "X of Y" format - should not exist for single item
    expect(screen.queryByText(/\d+ of \d+/)).not.toBeInTheDocument()
  })

  it('renders header with title and back link', () => {
    render(<ChamberClient somethings={mockSomethings} />)

    expect(screen.getByText('Chamber of Reflection')).toBeInTheDocument()
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
  })

  it('renders delete button', () => {
    render(<ChamberClient somethings={mockSomethings} />)

    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders spaceship image', () => {
    render(<ChamberClient somethings={mockSomethings} />)

    const spaceship = screen.getByAltText('Spaceship')
    expect(spaceship).toBeInTheDocument()
  })

  it('logs to console when spaceship is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<ChamberClient somethings={mockSomethings} />)

    const spaceship = screen.getByAltText('Spaceship')
    fireEvent.click(spaceship)

    expect(consoleSpy).toHaveBeenCalledWith('Spaceship clicked - organization placeholder')

    consoleSpy.mockRestore()
  })

  describe('content rendering', () => {
    it('renders text content correctly', () => {
      render(<ChamberClient somethings={mockSomethings} />)

      expect(screen.getByText('First something')).toBeInTheDocument()
    })

    it('renders photo content with image', () => {
      const photoSomething = [{
        ...mockSomethings[0],
        media_url: 'https://example.com/photo.jpg',
        content_type: 'photo',
        text_content: null,
      }]

      render(<ChamberClient somethings={photoSomething} />)

      const img = screen.getByAltText('Captured content')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', expect.stringContaining('photo.jpg'))
    })

    it('renders video content with controls', () => {
      const videoSomething = [{
        ...mockSomethings[0],
        media_url: 'https://example.com/video.mp4',
        content_type: 'video',
        text_content: null,
      }]

      render(<ChamberClient somethings={videoSomething} />)

      const video = document.querySelector('video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('controls')
    })

    it('renders link preview with url', () => {
      const linkSomething = [{
        ...mockSomethings[0],
        content_type: 'url',
        text_content: 'https://example.com',
        attributes: {
          link_preview: {
            url: 'https://example.com',
            image: 'https://example.com/thumb.jpg',
          },
        },
      }]

      render(<ChamberClient somethings={linkSomething} />)

      // There are multiple links (Back to Dashboard + link preview), get all and check the external one
      const links = screen.getAllByRole('link')
      const externalLink = links.find(link => link.getAttribute('href') === 'https://example.com')
      expect(externalLink).toBeInTheDocument()
    })
  })

  describe('keyboard navigation', () => {
    it('does not go before first item', () => {
      render(<ChamberClient somethings={mockSomethings} />)

      // Try to go left when at first item
      fireEvent.keyDown(window, { key: 'ArrowLeft' })

      // Should still show first item
      expect(screen.getByText('First something')).toBeInTheDocument()
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })
  })

  describe('swipe gestures', () => {
    it('ignores small swipes below threshold', () => {
      const { container } = render(<ChamberClient somethings={mockSomethings} />)

      const touchTarget = container.querySelector('.flex-1')!

      // Simulate small swipe (diff of 30 < threshold of 50)
      fireEvent.touchStart(touchTarget, {
        touches: [{ clientX: 200 }],
      })
      fireEvent.touchMove(touchTarget, {
        touches: [{ clientX: 170 }],
      })
      fireEvent.touchEnd(touchTarget)

      // Should still be on first item
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })
  })
})
