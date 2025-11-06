import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapContainer } from '@/app/components/map/MapContainer'

// Mock next/navigation
const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
}

const mockSearchParams = {
  get: vi.fn((key: string) => null),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}))

// Mock Globe component with realistic behavior
const mockOnTransition = vi.fn()
vi.mock('@/app/components/map/Globe', () => ({
  Globe: ({ onTransition }: any) => {
    mockOnTransition.mockImplementation(onTransition)
    return (
      <div data-testid="globe">
        <button data-testid="globe-click" onClick={onTransition}>
          Click to Explore
        </button>
      </div>
    )
  },
}))

// Mock MapView component
vi.mock('@/app/components/map/MapView', () => ({
  MapView: () => <div data-testid="mapview">MapView Component</div>,
}))

describe('MapContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.get.mockReturnValue(null)
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('should show globe by default on first visit', async () => {
    render(<MapContainer />)

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const globe = screen.getByTestId('globe')
    expect(globe).toBeInTheDocument()
    expect(screen.queryByTestId('mapview')).not.toBeInTheDocument()
  })

  it('should transition from globe to map when clicked', async () => {
    const user = userEvent.setup()
    render(<MapContainer />)

    // Wait for globe to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const globeButton = screen.getByTestId('globe-click')
    expect(screen.getByTestId('globe')).toBeInTheDocument()

    // Click globe to trigger transition
    await user.click(globeButton)

    // After transition, map should be visible and globe hidden
    await waitFor(() => {
      expect(screen.getByTestId('mapview')).toBeInTheDocument()
    })

    // Globe is removed from DOM when showGlobe=false (not just CSS hidden)
    expect(screen.queryByTestId('globe')).not.toBeInTheDocument()
  })

  it('should store skipGlobe preference in localStorage after transition', async () => {
    const user = userEvent.setup()
    render(<MapContainer />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const globeButton = screen.getByTestId('globe-click')
    await user.click(globeButton)

    // Verify localStorage was set
    expect(localStorage.getItem('skipGlobe')).toBe('true')
  })

  it('should skip globe if skipGlobe is in localStorage', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('skipGlobe', 'true')
    }

    render(<MapContainer />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should render MapView directly, no globe
    expect(screen.getByTestId('mapview')).toBeInTheDocument()
    expect(screen.queryByTestId('globe')).not.toBeInTheDocument()
  })

  it('should skip globe if URL param skipGlobe=true', async () => {
    mockSearchParams.get.mockReturnValue('true')

    render(<MapContainer />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should render MapView directly
    expect(screen.getByTestId('mapview')).toBeInTheDocument()
    expect(screen.queryByTestId('globe')).not.toBeInTheDocument()
  })

  it('should show globe immediately after brief loading', async () => {
    render(<MapContainer />)

    // Loading state is very brief, then globe appears
    await waitFor(() => {
      expect(screen.getByTestId('globe')).toBeInTheDocument()
    })
  })
})
