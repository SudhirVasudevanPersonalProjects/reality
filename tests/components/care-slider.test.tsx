import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CareSlider from '@/app/components/CareSlider'

describe('CareSlider Component', () => {
  it('should render physical labels correctly', () => {
    const onChange = vi.fn()
    render(<CareSlider value={3} onChange={onChange} type="physical" />)

    expect(screen.getByText('Ugly')).toBeInTheDocument()
    expect(screen.getByText('Meh')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('Beautiful')).toBeInTheDocument()
    expect(screen.getByText('Stunning')).toBeInTheDocument()
  })

  it('should render mind labels correctly', () => {
    const onChange = vi.fn()
    render(<CareSlider value={3} onChange={onChange} type="mind" />)

    expect(screen.getByText('Hate')).toBeInTheDocument()
    expect(screen.getByText('Dislike')).toBeInTheDocument()
    expect(screen.getByText('Neutral')).toBeInTheDocument()
    expect(screen.getByText('Like')).toBeInTheDocument()
    expect(screen.getByText('Love')).toBeInTheDocument()
  })

  it('should highlight selected value', () => {
    const onChange = vi.fn()
    const { container } = render(<CareSlider value={3} onChange={onChange} type="physical" />)

    // Find button with aria-pressed="true" (the selected button)
    const selectedButton = container.querySelector('[aria-pressed="true"]')
    expect(selectedButton).toBeInTheDocument()
    expect(selectedButton).toHaveTextContent('OK')
  })

  it('should call onChange when button clicked', () => {
    const onChange = vi.fn()
    render(<CareSlider value={3} onChange={onChange} type="physical" />)

    const beautifulButton = screen.getByLabelText(/Beautiful/)
    fireEvent.click(beautifulButton)

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('should handle all care values (1-5)', () => {
    const onChange = vi.fn()
    const { rerender } = render(<CareSlider value={1} onChange={onChange} type="physical" />)

    const careValues = [1, 2, 3, 4, 5]
    careValues.forEach(value => {
      rerender(<CareSlider value={value} onChange={onChange} type="physical" />)

      // Check that the correct button is selected
      const buttons = screen.getAllByRole('button')
      const selectedButton = buttons[value - 1]
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('should have accessible aria labels', () => {
    const onChange = vi.fn()
    render(<CareSlider value={3} onChange={onChange} type="physical" />)

    expect(screen.getByLabelText(/Ugly \(1 out of 5\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Stunning \(5 out of 5\)/)).toBeInTheDocument()
  })

  it('should support keyboard interaction', () => {
    const onChange = vi.fn()
    render(<CareSlider value={3} onChange={onChange} type="physical" />)

    const beautifulButton = screen.getByLabelText(/Beautiful/)

    // Test Enter key
    fireEvent.keyDown(beautifulButton, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(4)

    // Test Space key
    onChange.mockClear()
    fireEvent.keyDown(beautifulButton, { key: ' ' })
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
