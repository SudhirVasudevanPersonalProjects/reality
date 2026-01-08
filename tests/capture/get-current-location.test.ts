import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCurrentLocation } from '@/lib/capture/get-current-location'

describe('getCurrentLocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-expect-error - mocking navigator.geolocation
    global.navigator.geolocation = mockGeolocation
  })

  afterEach(() => {
    // @ts-expect-error - cleanup
    delete global.navigator.geolocation
  })

  it('returns coordinates when permission granted', async () => {
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    }

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition)
    })

    const result = await getCurrentLocation()

    expect(result).toEqual({
      latitude: 37.7749,
      longitude: -122.4194
    })
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    )
  })

  it('returns null when permission denied', async () => {
    const mockError = new Error('User denied geolocation')

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError)
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const result = await getCurrentLocation()

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Geolocation error (silent):',
      'User denied geolocation'
    )

    consoleSpy.mockRestore()
  })

  it('returns null when geolocation unavailable', async () => {
    // @ts-expect-error - testing unavailable geolocation
    delete global.navigator.geolocation

    const result = await getCurrentLocation()

    expect(result).toBeNull()
  })

  it('returns null on server-side (no window)', async () => {
    const originalWindow = global.window
    // @ts-expect-error - testing server-side
    delete global.window

    const result = await getCurrentLocation()

    expect(result).toBeNull()

    global.window = originalWindow
  })

  it('handles timeout error gracefully', async () => {
    const timeoutError = { message: 'Timeout expired' }

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(timeoutError)
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const result = await getCurrentLocation()

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Geolocation error (silent):',
      'Timeout expired'
    )

    consoleSpy.mockRestore()
  })

  it('handles position unavailable error gracefully', async () => {
    const unavailableError = { message: 'Position unavailable' }

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(unavailableError)
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const result = await getCurrentLocation()

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Geolocation error (silent):',
      'Position unavailable'
    )

    consoleSpy.mockRestore()
  })
})
