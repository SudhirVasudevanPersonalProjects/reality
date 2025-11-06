import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExperienceListModal } from '@/app/components/map/ExperienceListModal'
import type { Database } from '@/lib/supabase/database.types'

type Something = Database['public']['Tables']['somethings']['Row']

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ExperienceListModal', () => {
  const mockExperiences: Something[] = [
    {
      id: '1',
      user_id: 'user-1',
      realm: 'physical',
      location_name: 'UCSD',
      formatted_address: '9500 Gilman Dr, La Jolla, CA',
      latitude: 32.8810,
      longitude: -117.2340,
      care: 4,
      care_frequency: null,
      text_content: 'Coffee with friends at Price Center',
      media_url: null,
      content_type: 'text',
      captured_at: '2025-11-05T15:30:00Z',
      created_at: '2025-11-05T15:30:00Z',
      updated_at: null,
      attributes: null,
      metadata: null,
      parent_id: null,
      domain: null,
      category_path: null,
      visited: null,
    },
    {
      id: '2',
      user_id: 'user-1',
      realm: 'physical',
      location_name: 'UCSD',
      formatted_address: '9500 Gilman Dr, La Jolla, CA',
      latitude: 32.8810,
      longitude: -117.2340,
      care: 5,
      care_frequency: null,
      text_content: 'Great lecture in Warren Hall',
      media_url: null,
      content_type: 'text',
      captured_at: '2025-11-04T10:00:00Z',
      created_at: '2025-11-04T10:00:00Z',
      updated_at: null,
      attributes: null,
      metadata: null,
      parent_id: null,
      domain: null,
      category_path: null,
      visited: null,
    },
  ]

  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ExperienceListModal
        isOpen={false}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render modal when isOpen is true', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    expect(screen.getByText('UCSD')).toBeInTheDocument()
    expect(screen.getByText('2 experiences')).toBeInTheDocument()
  })

  it('should display list of experiences', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    expect(screen.getByText(/Coffee with friends at Price Center/)).toBeInTheDocument()
    expect(screen.getByText(/Great lecture in Warren Hall/)).toBeInTheDocument()
  })

  it('should render care stars correctly', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    // Check for star symbols - both should have 5 stars total
    const stars = screen.getAllByText('★')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('should format timestamps correctly', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    // Check that dates are formatted (checking for month abbreviation) - there are multiple dates
    const dates = screen.getAllByText(/Nov/i)
    expect(dates.length).toBeGreaterThan(0)
  })

  it('should navigate to detail page when View Details is clicked', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    const viewDetailsButtons = screen.getAllByText('View Details')
    fireEvent.click(viewDetailsButtons[0])

    expect(mockPush).toHaveBeenCalledWith('/my_reality/1')
  })

  it('should close modal when Close button is clicked', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when backdrop is clicked', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/70')
    expect(backdrop).toBeInTheDocument()

    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('should close modal when ESC key is pressed', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={mockExperiences}
        locationName="UCSD"
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should display empty state when no experiences', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={[]}
        locationName="Empty Location"
      />
    )

    expect(screen.getByText('No experiences recorded at this location yet')).toBeInTheDocument()
  })

  it('should truncate long text content', () => {
    const longTextExperience: Something = {
      ...mockExperiences[0],
      text_content: 'A'.repeat(150), // 150 characters
    }

    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={[longTextExperience]}
        locationName="Test"
      />
    )

    // Should show first 100 chars + "..."
    const textElement = screen.getByText(/A{100}\.\.\./)
    expect(textElement).toBeInTheDocument()
  })

  it('should show singular "experience" when only one', () => {
    render(
      <ExperienceListModal
        isOpen={true}
        onClose={mockOnClose}
        experiences={[mockExperiences[0]]}
        locationName="UCSD"
      />
    )

    expect(screen.getByText('1 experience')).toBeInTheDocument()
  })
})
