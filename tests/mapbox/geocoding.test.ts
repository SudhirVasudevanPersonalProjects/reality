/**
 * Unit tests for Mapbox geocoding helper
 * Story 2.5: Physical Location Capture & Geocoding
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeLocation } from '@/lib/mapbox/geocoding'

// Mock Mapbox SDK before tests run
let mockForwardGeocode = vi.fn()
let mockSend = vi.fn()

vi.mock('@mapbox/mapbox-sdk/services/geocoding', () => {
  return {
    default: vi.fn(() => ({
      forwardGeocode: (...args: any[]) => {
        mockForwardGeocode(...args)
        return { send: mockSend }
      }
    }))
  }
})

describe('geocodeLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return array of geocoding results with correct structure', async () => {
    // Mock successful Mapbox response
    mockSend.mockResolvedValue({
      body: {
        features: [
          {
            place_name: 'La Jolla Cove, San Diego, CA',
            center: [-117.271, 32.851]
          },
          {
            place_name: 'La Jolla, San Diego, CA 92037',
            center: [-117.271, 32.847]
          }
        ]
      }
    })

    const results = await geocodeLocation('La Jolla Cove')

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({
      placeName: 'La Jolla Cove, San Diego, CA',
      latitude: 32.851,
      longitude: -117.271,
      formattedAddress: 'La Jolla Cove, San Diego, CA'
    })
  })

  it('should handle API errors gracefully and return empty array', async () => {
    mockSend.mockRejectedValue(new Error('Network error'))

    const results = await geocodeLocation('invalid query')

    expect(results).toEqual([])
  })

  it('should respect 5-result limit', async () => {
    mockSend.mockResolvedValue({
      body: {
        features: Array(10).fill(null).map((_, i) => ({
          place_name: `Location ${i}`,
          center: [-117.0 + i, 32.0 + i]
        }))
      }
    })

    await geocodeLocation('test')

    // Verify API called with limit 5
    expect(mockForwardGeocode).toHaveBeenCalledWith({
      query: 'test',
      limit: 5,
      types: ['place', 'address', 'poi']
    })
  })

  it('should format coordinates correctly from center array', async () => {
    mockSend.mockResolvedValue({
      body: {
        features: [
          {
            place_name: 'Test Location',
            center: [-117.271, 32.851] // [lng, lat] format
          }
        ]
      }
    })

    const results = await geocodeLocation('test')

    // Should extract latitude from index 1, longitude from index 0
    expect(results[0].latitude).toBe(32.851)
    expect(results[0].longitude).toBe(-117.271)
  })
})
