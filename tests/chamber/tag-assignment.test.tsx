/**
 * Tests for Chamber Tag Assignment functionality
 * Story 5.4: Chamber Tag Assignment & Visual Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock the 2D rendering utilities
vi.mock('@/lib/my-reality/hexagonal-lattice-2d', () => ({
  distributeOnHexagonalLattice: vi.fn(() => [{ x: 0, y: 0 }]),
  calculateCircleRadius: vi.fn(() => 100),
}))

vi.mock('@/lib/my-reality/render-2d-scene', () => ({
  render2DScene: vi.fn(),
}))

// Import after mocks
import ChamberClient from '@/app/chamber/ChamberClient'

describe('Tag Assignment', () => {
  const mockSomethings = [
    {
      id: '1',
      user_id: 'user1',
      text_content: 'Test something',
      media_url: null,
      content_type: 'text',
      attributes: null,
      captured_at: '2025-01-01T00:00:00Z',
      care: null,
      parent_id: null,
      realm: null,
      latitude: null,
      longitude: null,
      location_name: null,
      formatted_address: null,
      category_path: null,
      domain: null,
      metadata: null,
      care_frequency: null,
      visited: null,
      created_at: null,
      updated_at: null,
    },
  ]

  const mockAbodes = [
    {
      id: 'abode1',
      user_id: 'user1',
      text_content: 'Beauty',
      media_url: null,
      content_type: 'abode',
      attributes: { icon: '✨', color: '#FFD700' },
      captured_at: '2025-01-01T00:00:00Z',
      care: null,
      parent_id: null,
      realm: null,
      latitude: null,
      longitude: null,
      location_name: null,
      formatted_address: null,
      category_path: null,
      domain: null,
      metadata: null,
      care_frequency: null,
      visited: null,
      created_at: null,
      updated_at: null,
    },
    {
      id: 'abode2',
      user_id: 'user1',
      text_content: 'Dreams',
      media_url: null,
      content_type: 'abode',
      attributes: { icon: '🌙', color: '#4A90D9' },
      captured_at: '2025-01-01T00:00:00Z',
      care: null,
      parent_id: null,
      realm: null,
      latitude: null,
      longitude: null,
      location_name: null,
      formatted_address: null,
      category_path: null,
      domain: null,
      metadata: null,
      care_frequency: null,
      visited: null,
      created_at: null,
      updated_at: null,
    },
  ]

  const mockWhys = [
    {
      id: 'why1',
      user_id: 'user1',
      text_content: 'Evokes awe',
      media_url: null,
      content_type: 'why',
      attributes: null,
      captured_at: '2025-01-01T00:00:00Z',
      care: null,
      parent_id: null,
      realm: null,
      latitude: null,
      longitude: null,
      location_name: null,
      formatted_address: null,
      category_path: null,
      domain: null,
      metadata: null,
      care_frequency: null,
      visited: null,
      created_at: null,
      updated_at: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })) as any
  })

  it('renders abode input field', () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    expect(input).toBeInTheDocument()
  })

  it('shows autocomplete suggestions when typing', async () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    fireEvent.change(input, { target: { value: 'Bea' } })

    await waitFor(() => {
      expect(screen.getByText('Beauty')).toBeInTheDocument()
    })
  })

  it('filters suggestions by prefix (case-insensitive)', async () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    fireEvent.change(input, { target: { value: 'dre' } })

    await waitFor(() => {
      expect(screen.getByText('Dreams')).toBeInTheDocument()
    })

    // Beauty should not appear
    expect(screen.queryByText('Beauty')).not.toBeInTheDocument()
  })

  it('clears input on Escape key', async () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    fireEvent.change(input, { target: { value: 'Beauty' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(input).toHaveValue('')
  })

  it('shows why input after selecting abode', async () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    fireEvent.change(input, { target: { value: 'Beauty' } })

    await waitFor(() => {
      expect(screen.getByText('Beauty')).toBeInTheDocument()
    })

    // Click on the suggestion
    fireEvent.click(screen.getByText('Beauty'))

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Why does this belong here? (optional, press Enter to skip)')
      ).toBeInTheDocument()
    })
  })

  it('shows icon/color picker for new custom abode', async () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    fireEvent.change(input, { target: { value: 'MyCustomAbode' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('Creating "MyCustomAbode"')).toBeInTheDocument()
      expect(screen.getByText('Select icon')).toBeInTheDocument()
      expect(screen.getByText('Select color')).toBeInTheDocument()
    })
  })

  it('skips icon picker for preset abodes', async () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={[]} // No existing abodes
        whys={mockWhys}
        maxBound={100}
      />
    )

    const input = screen.getByPlaceholderText('Type abode name...')
    // Type a preset abode name
    fireEvent.change(input, { target: { value: 'Beauty' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Should skip icon picker and go straight to why input
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Why does this belong here? (optional, press Enter to skip)')
      ).toBeInTheDocument()
    })

    // Icon picker should not be shown
    expect(screen.queryByText('Select icon')).not.toBeInTheDocument()
  })

  it('displays position indicator for multiple somethings', () => {
    const multipleSomethings = [
      { ...mockSomethings[0], id: '1' },
      { ...mockSomethings[0], id: '2' },
      { ...mockSomethings[0], id: '3' },
    ]

    render(
      <ChamberClient
        somethings={multipleSomethings}
        allSomethings={multipleSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('hides position indicator for single something', () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    // Position indicator shows "X of Y" format
    expect(screen.queryByText(/\d+ of \d+/)).not.toBeInTheDocument()
  })

  it('renders delete button', () => {
    render(
      <ChamberClient
        somethings={mockSomethings}
        allSomethings={mockSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders navigation arrows for multiple somethings', () => {
    const multipleSomethings = [
      { ...mockSomethings[0], id: '1' },
      { ...mockSomethings[0], id: '2' },
    ]

    render(
      <ChamberClient
        somethings={multipleSomethings}
        allSomethings={multipleSomethings}
        abodes={mockAbodes}
        whys={mockWhys}
        maxBound={100}
      />
    )

    // Should show next arrow (we're at first item)
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
    // Should not show previous arrow (we're at first item)
    expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument()
  })
})
