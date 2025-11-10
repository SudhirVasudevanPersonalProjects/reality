import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MindCardPreview, SomethingPreview } from '@/app/components/MindCardPreview'
import { useRouter } from 'next/navigation'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

describe('MindCardPreview', () => {
  const mockPush = vi.fn()
  const mockRouter = {
    push: mockPush,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn()
  }

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
    mockPush.mockClear()
  })

  const mockSomething: SomethingPreview = {
    id: 'test-id-123',
    text_content: 'This is a test thought about the nature of reality',
    media_url: null,
    care: 4,
    captured_at: new Date('2025-11-01T10:00:00Z').toISOString(),
    latitude: null,
    longitude: null,
    attributes: { mind_category: 'thought' }
  }

  it('should render card with content preview', () => {
    render(<MindCardPreview something={mockSomething} />)
    expect(screen.getByText(/This is a test thought/)).toBeInTheDocument()
  })

  it('should render category badge for experience', () => {
    const experienceSomething = { ...mockSomething, attributes: { mind_category: 'experience' } }
    render(<MindCardPreview something={experienceSomething} />)
    expect(screen.getByText('🎭')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
  })

  it('should render category badge for thought', () => {
    render(<MindCardPreview something={mockSomething} />)
    expect(screen.getByText('💭')).toBeInTheDocument()
    expect(screen.getByText('Thought')).toBeInTheDocument()
  })

  it('should render category badge for desire', () => {
    const desireSomething = { ...mockSomething, attributes: { mind_category: 'desire' } }
    render(<MindCardPreview something={desireSomething} />)
    expect(screen.getByText('✨')).toBeInTheDocument()
    expect(screen.getByText('Desire')).toBeInTheDocument()
  })

  it('should render care rating with correct stars', () => {
    render(<MindCardPreview something={mockSomething} />)
    const starsContainer = screen.getByLabelText('4 out of 5 stars')
    expect(starsContainer).toBeInTheDocument()
    const stars = starsContainer.querySelectorAll('span')
    expect(stars).toHaveLength(5)
  })

  it('should show location indicator when location exists', () => {
    const locationSomething = { ...mockSomething, latitude: 37.7749, longitude: -122.4194 }
    render(<MindCardPreview something={locationSomething} />)
    expect(screen.getByTitle('Has location')).toBeInTheDocument()
    expect(screen.getByText('📍')).toBeInTheDocument()
  })

  it('should not show location indicator when location is null', () => {
    render(<MindCardPreview something={mockSomething} />)
    expect(screen.queryByTitle('Has location')).not.toBeInTheDocument()
  })

  it('should apply care-based brightness opacity', () => {
    const { container } = render(<MindCardPreview something={mockSomething} />)
    const article = container.querySelector('article')
    // care 4: brightness = (4-1)/4 = 0.75, opacity = 0.4 + (0.75 * 0.6) = 0.85
    expect(article).toHaveStyle({ opacity: '0.85' })
  })

  it('should truncate text content to 150 characters', () => {
    const longText = 'a'.repeat(200)
    const longSomething = { ...mockSomething, text_content: longText }
    render(<MindCardPreview something={longSomething} />)
    const content = screen.getByText(/^a{150}\.\.\./)
    expect(content).toBeInTheDocument()
  })

  it('should navigate to detail page on click', () => {
    render(<MindCardPreview something={mockSomething} />)
    const card = screen.getByRole('listitem')
    fireEvent.click(card)
    expect(mockPush).toHaveBeenCalledWith('/mind/test-id-123')
  })

  it('should navigate to detail page on Enter key', () => {
    render(<MindCardPreview something={mockSomething} />)
    const card = screen.getByRole('listitem')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(mockPush).toHaveBeenCalledWith('/mind/test-id-123')
  })

  it('should not navigate on other keys', () => {
    render(<MindCardPreview something={mockSomething} />)
    const card = screen.getByRole('listitem')
    fireEvent.keyDown(card, { key: 'Space' })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should display media thumbnail when media_url exists', () => {
    const mediaSomething = { ...mockSomething, media_url: 'https://example.com/image.jpg' }
    const { container } = render(<MindCardPreview something={mediaSomething} />)
    const img = container.querySelector('img[alt="Preview"]')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('should parse JSON array media_url and show first image', () => {
    const mediaSomething = {
      ...mockSomething,
      media_url: JSON.stringify(['https://example.com/image1.jpg', 'https://example.com/image2.jpg'])
    }
    const { container } = render(<MindCardPreview something={mediaSomething} />)
    const img = container.querySelector('img[alt="Preview"]')
    expect(img).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })
})
