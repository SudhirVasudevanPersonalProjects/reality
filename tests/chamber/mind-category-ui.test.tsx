/**
 * Test suite for Story 2.4 PATCH: Mind Category UI Components
 * Tests the Chamber UI for mind category dropdown, why field, and desire fields
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChamberClient from '@/app/chamber/ChamberClient'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({})
}))

const mockSomething = {
  id: 'test-id',
  user_id: 'user-id',
  text_content: 'Test mind something',
  content_type: 'text',
  realm: 'unorganized',
  care: null,
  care_frequency: null,
  location_name: null,
  latitude: null,
  longitude: null,
  formatted_address: null,
  media_url: null,
  captured_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  attributes: null,
  visited: false
}

describe('Story 2.4 PATCH: Mind Category UI', () => {
  it('should show mind category dropdown when Mind is selected', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Check for mind category options
    expect(screen.getByText(/Experience \(Past Memory\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Thought \(Present Reflection\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Desire \(Future Aspiration\)/i)).toBeInTheDocument()
  })

  it('should NOT show mind category dropdown when Physical is selected', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Physical realm
    const physicalRadio = screen.getByLabelText(/Physical Experience/i)
    fireEvent.click(physicalRadio)

    // Mind category should not be visible
    expect(screen.queryByText(/What kind of Mind something is this\?/i)).not.toBeInTheDocument()
  })

  it('should show why field for all mind categories', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Check for why field
    expect(screen.getByLabelText(/Why does this matter to you\?/i)).toBeInTheDocument()
  })

  it('should change why placeholder based on selected category', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Select Experience category
    const experienceRadio = screen.getByLabelText(/Experience \(Past Memory\)/i)
    fireEvent.click(experienceRadio)

    const whyField = screen.getByLabelText(/Why does this matter to you\?/i)
    expect(whyField).toHaveAttribute('placeholder', expect.stringContaining('memory meaningful'))

    // Select Thought category
    const thoughtRadio = screen.getByLabelText(/Thought \(Present Reflection\)/i)
    fireEvent.click(thoughtRadio)

    expect(whyField).toHaveAttribute('placeholder', expect.stringContaining('thought important'))

    // Select Desire category
    const desireRadio = screen.getByLabelText(/Desire \(Future Aspiration\)/i)
    fireEvent.click(desireRadio)

    expect(whyField).toHaveAttribute('placeholder', expect.stringContaining('Why do you want this'))
  })

  it('should show "Somewhere" indicator when why field is empty', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Check for "Somewhere" indicator
    expect(screen.getByText(/Somewhere \(will stay unorganized/i)).toBeInTheDocument()
  })

  it('should show "Organized" indicator when why field has content', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Fill why field
    const whyField = screen.getByLabelText(/Why does this matter to you\?/i)
    fireEvent.change(whyField, { target: { value: 'This is meaningful because...' } })

    // Check for "Organized" indicator
    expect(screen.getByText(/Organized/i)).toBeInTheDocument()
  })

  it('should show desire-specific fields only when Desire category is selected', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Initially should not show desire fields (default is thought)
    expect(screen.queryByLabelText(/How strong is this desire\?/i)).not.toBeInTheDocument()

    // Select Desire category
    const desireRadio = screen.getByLabelText(/Desire \(Future Aspiration\)/i)
    fireEvent.click(desireRadio)

    // Now desire fields should be visible
    expect(screen.getByLabelText(/How strong is this desire\?/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Where is this desire in its journey\?/i)).toBeInTheDocument()
  })

  it('should hide desire-specific fields when switching from Desire to another category', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Select Desire category
    const desireRadio = screen.getByLabelText(/Desire \(Future Aspiration\)/i)
    fireEvent.click(desireRadio)

    // Verify desire fields are visible
    expect(screen.getByLabelText(/How strong is this desire\?/i)).toBeInTheDocument()

    // Switch to Thought category
    const thoughtRadio = screen.getByLabelText(/Thought \(Present Reflection\)/i)
    fireEvent.click(thoughtRadio)

    // Desire fields should be hidden
    expect(screen.queryByLabelText(/How strong is this desire\?/i)).not.toBeInTheDocument()
  })

  it('should enforce 1000 character limit on why field', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    const whyField = screen.getByLabelText(/Why does this matter to you\?/i) as HTMLTextAreaElement
    expect(whyField).toHaveAttribute('maxLength', '1000')
  })

  it('should show character counter for why field', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    // Initially should show 0/1000
    expect(screen.getByText('0/1000')).toBeInTheDocument()

    // Fill why field
    const whyField = screen.getByLabelText(/Why does this matter to you\?/i)
    const testText = 'This is a test'
    fireEvent.change(whyField, { target: { value: testText } })

    // Should show character count
    expect(screen.getByText(`${testText.length}/1000`)).toBeInTheDocument()
  })

  it('should have desire intensity slider with correct range', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm and Desire category
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    const desireRadio = screen.getByLabelText(/Desire \(Future Aspiration\)/i)
    fireEvent.click(desireRadio)

    const intensitySlider = screen.getByLabelText(/How strong is this desire\?/i)
    expect(intensitySlider).toHaveAttribute('type', 'range')
    expect(intensitySlider).toHaveAttribute('min', '0')
    expect(intensitySlider).toHaveAttribute('max', '1')
    expect(intensitySlider).toHaveAttribute('step', '0.1')
  })

  it('should have desire status dropdown with correct options', () => {
    render(<ChamberClient something={mockSomething} />)

    // Select Mind realm and Desire category
    const mindRadio = screen.getByLabelText(/Mind Experience/i)
    fireEvent.click(mindRadio)

    const desireRadio = screen.getByLabelText(/Desire \(Future Aspiration\)/i)
    fireEvent.click(desireRadio)

    const statusDropdown = screen.getByLabelText(/Where is this desire in its journey\?/i)
    expect(statusDropdown).toBeInTheDocument()

    // Check for options
    expect(screen.getByText(/Nascent - Just discovered this want/i)).toBeInTheDocument()
    expect(screen.getByText(/Active - Actively pursuing this/i)).toBeInTheDocument()
    expect(screen.getByText(/Fulfilled - Already achieved/i)).toBeInTheDocument()
  })
})
