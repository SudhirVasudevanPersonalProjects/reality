import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ManualCoordinateInput from '@/app/components/ManualCoordinateInput'

describe('ManualCoordinateInput', () => {
  it('should render latitude and longitude inputs', () => {
    render(<ManualCoordinateInput onCoordinatesEnter={vi.fn()} />)

    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument()
  })

  it('should validate latitude range (-90 to 90)', async () => {
    const user = userEvent.setup()
    render(<ManualCoordinateInput onCoordinatesEnter={vi.fn()} />)

    const latInput = screen.getByLabelText(/latitude/i)

    // Test invalid: > 90
    await user.type(latInput, '95')
    expect(await screen.findByText(/latitude must be between -90 and 90/i)).toBeInTheDocument()

    await user.clear(latInput)

    // Test invalid: < -90
    await user.type(latInput, '-95')
    expect(await screen.findByText(/latitude must be between -90 and 90/i)).toBeInTheDocument()
  })

  it('should validate longitude range (-180 to 180)', async () => {
    const user = userEvent.setup()
    render(<ManualCoordinateInput onCoordinatesEnter={vi.fn()} />)

    const lngInput = screen.getByLabelText(/longitude/i)

    // Test invalid: > 180
    await user.type(lngInput, '190')
    expect(await screen.findByText(/longitude must be between -180 and 180/i)).toBeInTheDocument()

    await user.clear(lngInput)

    // Test invalid: < -180
    await user.type(lngInput, '-190')
    expect(await screen.findByText(/longitude must be between -180 and 180/i)).toBeInTheDocument()
  })

  it('should call callback with correct data when both coordinates are valid', async () => {
    const user = userEvent.setup()
    const onCoordinatesEnter = vi.fn()
    render(<ManualCoordinateInput onCoordinatesEnter={onCoordinatesEnter} />)

    const latInput = screen.getByLabelText(/latitude/i)
    const lngInput = screen.getByLabelText(/longitude/i)

    // Enter valid latitude
    await user.type(latInput, '32.8810')

    // Enter valid longitude - should trigger callback
    await user.type(lngInput, '-117.2340')

    expect(onCoordinatesEnter).toHaveBeenCalledWith(32.8810, -117.2340)
  })

  it('should not call callback when coordinates are invalid', async () => {
    const user = userEvent.setup()
    const onCoordinatesEnter = vi.fn()
    render(<ManualCoordinateInput onCoordinatesEnter={onCoordinatesEnter} />)

    const latInput = screen.getByLabelText(/latitude/i)
    const lngInput = screen.getByLabelText(/longitude/i)

    // Enter invalid latitude
    await user.type(latInput, '95')

    // Enter valid longitude
    await user.type(lngInput, '-117.2340')

    // Should NOT call callback because latitude is invalid
    expect(onCoordinatesEnter).not.toHaveBeenCalled()
  })

  it('should accept valid decimal coordinates', async () => {
    const user = userEvent.setup()
    const onCoordinatesEnter = vi.fn()
    render(<ManualCoordinateInput onCoordinatesEnter={onCoordinatesEnter} />)

    const latInput = screen.getByLabelText(/latitude/i)
    const lngInput = screen.getByLabelText(/longitude/i)

    await user.type(latInput, '32.715736')
    await user.type(lngInput, '-117.161087')

    expect(onCoordinatesEnter).toHaveBeenCalledWith(32.715736, -117.161087)
  })

  it('should accept edge case coordinates', async () => {
    const user = userEvent.setup()
    const onCoordinatesEnter = vi.fn()
    render(<ManualCoordinateInput onCoordinatesEnter={onCoordinatesEnter} />)

    const latInput = screen.getByLabelText(/latitude/i)
    const lngInput = screen.getByLabelText(/longitude/i)

    // Test edge: exactly 90, -180
    await user.type(latInput, '90')
    await user.type(lngInput, '-180')

    expect(onCoordinatesEnter).toHaveBeenCalledWith(90, -180)
  })
})
