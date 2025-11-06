import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LocationInput from '@/app/components/LocationInput'

// Mock the child components
vi.mock('@/app/components/AddressSearchInput', () => ({
  default: ({ value, onChange, onSelect }: any) => (
    <div data-testid="address-search-input">
      <input
        data-testid="mock-address-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        data-testid="mock-select-button"
        onClick={() => onSelect({
          latitude: 32.8810,
          longitude: -117.2340,
          placeName: 'Student Center, UC San Diego',
          formattedAddress: 'Student Center, UC San Diego, La Jolla, CA 92037'
        })}
      >
        Select Mock Location
      </button>
    </div>
  )
}))

vi.mock('@/app/components/ManualCoordinateInput', () => ({
  default: ({ onCoordinatesEnter }: any) => (
    <div data-testid="manual-coordinate-input">
      <button
        data-testid="mock-manual-button"
        onClick={() => onCoordinatesEnter(32.8810, -117.2340)}
      >
        Enter Manual Coords
      </button>
    </div>
  )
}))

describe('LocationInput Wrapper', () => {
  it('should render location name field', () => {
    render(
      <LocationInput
        locationName=""
        onLocationNameChange={vi.fn()}
        onAddressSelect={vi.fn()}
        onManualCoordinates={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/location name/i)).toBeInTheDocument()
  })

  it('should show required indicator when required prop is true', () => {
    render(
      <LocationInput
        locationName=""
        onLocationNameChange={vi.fn()}
        onAddressSelect={vi.fn()}
        onManualCoordinates={vi.fn()}
        required
      />
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should NOT overwrite location name when address is selected', async () => {
    const user = userEvent.setup()
    const onLocationNameChange = vi.fn()
    const onAddressSelect = vi.fn()

    render(
      <LocationInput
        locationName="Price Center"
        onLocationNameChange={onLocationNameChange}
        onAddressSelect={onAddressSelect}
        onManualCoordinates={vi.fn()}
      />
    )

    // Location name field should show "Price Center"
    const locationNameInput = screen.getByLabelText(/location name/i)
    expect(locationNameInput).toHaveValue('Price Center')

    // Select Mapbox suggestion
    const selectButton = screen.getByTestId('mock-select-button')
    await user.click(selectButton)

    // Address select should be called
    expect(onAddressSelect).toHaveBeenCalledWith({
      latitude: 32.8810,
      longitude: -117.2340,
      placeName: 'Student Center, UC San Diego',
      formattedAddress: 'Student Center, UC San Diego, La Jolla, CA 92037'
    })

    // Location name change should NOT be called
    expect(onLocationNameChange).not.toHaveBeenCalled()
  })

  it('should toggle between search and manual modes', async () => {
    const user = userEvent.setup()
    render(
      <LocationInput
        locationName=""
        onLocationNameChange={vi.fn()}
        onAddressSelect={vi.fn()}
        onManualCoordinates={vi.fn()}
      />
    )

    // Initially in search mode
    expect(screen.getByTestId('address-search-input')).toBeInTheDocument()
    expect(screen.queryByTestId('manual-coordinate-input')).not.toBeInTheDocument()

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /enter coordinates manually/i })
    await user.click(toggleButton)

    // Should switch to manual mode
    expect(screen.queryByTestId('address-search-input')).not.toBeInTheDocument()
    expect(screen.getByTestId('manual-coordinate-input')).toBeInTheDocument()

    // Toggle button text should change
    expect(screen.getByRole('button', { name: /search by address/i })).toBeInTheDocument()
  })

  it('should preserve location name when switching modes', async () => {
    const user = userEvent.setup()
    const onLocationNameChange = vi.fn()

    render(
      <LocationInput
        locationName="My Favorite Beach"
        onLocationNameChange={onLocationNameChange}
        onAddressSelect={vi.fn()}
        onManualCoordinates={vi.fn()}
      />
    )

    const locationNameInput = screen.getByLabelText(/location name/i)
    expect(locationNameInput).toHaveValue('My Favorite Beach')

    // Toggle to manual mode
    const toggleButton = screen.getByRole('button', { name: /enter coordinates manually/i })
    await user.click(toggleButton)

    // Location name should still be there
    expect(locationNameInput).toHaveValue('My Favorite Beach')
  })

  it('should call onManualCoordinates when manual coords entered', async () => {
    const user = userEvent.setup()
    const onManualCoordinates = vi.fn()

    render(
      <LocationInput
        locationName=""
        onLocationNameChange={vi.fn()}
        onAddressSelect={vi.fn()}
        onManualCoordinates={onManualCoordinates}
      />
    )

    // Toggle to manual mode
    const toggleButton = screen.getByRole('button', { name: /enter coordinates manually/i })
    await user.click(toggleButton)

    // Enter manual coordinates
    const manualButton = screen.getByTestId('mock-manual-button')
    await user.click(manualButton)

    expect(onManualCoordinates).toHaveBeenCalledWith(32.8810, -117.2340)
  })

  it('should allow user to update location name', async () => {
    const user = userEvent.setup()
    const onLocationNameChange = vi.fn()

    render(
      <LocationInput
        locationName=""
        onLocationNameChange={onLocationNameChange}
        onAddressSelect={vi.fn()}
        onManualCoordinates={vi.fn()}
      />
    )

    const locationNameInput = screen.getByLabelText(/location name/i)
    await user.type(locationNameInput, 'Papa Johns')

    expect(onLocationNameChange).toHaveBeenCalled()
    expect(onLocationNameChange.mock.calls.length).toBeGreaterThan(0)
  })
})
