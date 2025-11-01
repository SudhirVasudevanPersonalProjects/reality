// app/capture/page.test.tsx
// Integration tests for capture page UI

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CapturePage from './page'

// Mock Next.js router
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('CapturePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
  })

  it('should render capture interface with all elements', () => {
    render(<CapturePage />)

    // Check for main elements
    expect(screen.getByText('Add to Your Reality')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Type or paste your thoughts/i)).toBeInTheDocument()
    expect(screen.getByTitle('Attach files')).toBeInTheDocument()
    expect(screen.getByTitle('Submit capture')).toBeInTheDocument()
  })

  it('should enable submit button when text is entered', () => {
    render(<CapturePage />)

    const textarea = screen.getByPlaceholderText(/Type or paste your thoughts/i)
    const submitButton = screen.getByTitle('Submit capture')

    // Initially disabled (no content)
    expect(submitButton).toBeDisabled()

    // Enter text
    fireEvent.change(textarea, { target: { value: 'My first capture' } })

    // Should be enabled now
    expect(submitButton).not.toBeDisabled()
  })

  it('should create text capture successfully', async () => {
    const mockResponse = {
      success: true,
      captures: [
        {
          id: 'capture-123',
          content_type: 'text',
          created_at: new Date().toISOString(),
        },
      ],
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<CapturePage />)

    const textarea = screen.getByPlaceholderText(/Type or paste your thoughts/i)
    const submitButton = screen.getByTitle('Submit capture')

    // Enter text
    fireEvent.change(textarea, { target: { value: 'My test capture' } })

    // Submit form
    fireEvent.click(submitButton)

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Capture created successfully/i)).toBeInTheDocument()
    })

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/captures',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )

    // Verify redirect was called (with longer timeout for the 1.5s delay)
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      },
      { timeout: 2000 }
    )
  })

  it('should show error when submission fails', async () => {
    const mockError = {
      success: false,
      captures: [],
      error: 'Failed to create capture',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    })

    render(<CapturePage />)

    const textarea = screen.getByPlaceholderText(/Type or paste your thoughts/i)
    const submitButton = screen.getByTitle('Submit capture')

    // Enter text
    fireEvent.change(textarea, { target: { value: 'Test capture' } })

    // Submit form
    fireEvent.click(submitButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to create capture/i)).toBeInTheDocument()
    })

    // Should not redirect on error
    expect(mockPush).not.toHaveBeenCalled()
  })

  // Note: File upload tests require more complex mocking
  // These are better tested via E2E tests in a real browser environment

  it('should clear form after successful submission', async () => {
    const mockResponse = {
      success: true,
      captures: [
        {
          id: 'capture-123',
          content_type: 'text',
          created_at: new Date().toISOString(),
        },
      ],
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<CapturePage />)

    const textarea = screen.getByPlaceholderText(/Type or paste your thoughts/i) as HTMLTextAreaElement

    // Enter text
    fireEvent.change(textarea, { target: { value: 'Test capture' } })
    expect(textarea.value).toBe('Test capture')

    // Submit form
    const submitButton = screen.getByTitle('Submit capture')
    fireEvent.click(submitButton)

    // Wait for success and form clear
    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('should have link back to dashboard', () => {
    render(<CapturePage />)

    const backLink = screen.getByText('Back to Dashboard')
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard')
  })
})
