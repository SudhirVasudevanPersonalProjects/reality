import { describe, it, expect } from 'vitest'
import { organizeRequestSchema } from '@/lib/schemas/organization'

describe('Organize Request Validation', () => {
  it('should validate correct physical organization request', () => {
    const validRequest = {
      realm: 'physical' as const,
      care: 3,
      location_name: 'Palo Alto Blue Bottle'
    }

    const result = organizeRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should validate correct mind organization request', () => {
    const validRequest = {
      realm: 'mind' as const,
      care: 4,
      tags: ['coffee', 'reflection']
    }

    const result = organizeRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should reject invalid realm value', () => {
    const invalidRequest = {
      realm: 'invalid',
      care: 3
    }

    const result = organizeRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
    if (!result.success) {
      // Zod enum validation produces an error - just check it failed
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })

  it('should reject care below 1', () => {
    const invalidRequest = {
      realm: 'physical' as const,
      care: 0,
      location_name: 'Test Location'
    }

    const result = organizeRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should reject care above 5', () => {
    const invalidRequest = {
      realm: 'physical' as const,
      care: 6,
      location_name: 'Test Location'
    }

    const result = organizeRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message)
      expect(errorMessages.some(msg => msg.includes('Care must be between'))).toBe(true)
    }
  })

  it('should reject physical without location_name', () => {
    const invalidRequest = {
      realm: 'physical' as const,
      care: 3
    }

    const result = organizeRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message)
      expect(errorMessages.some(msg => msg.includes('Location name is required'))).toBe(true)
    }
  })

  it('should accept mind without tags', () => {
    const validRequest = {
      realm: 'mind' as const,
      care: 3
    }

    const result = organizeRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should accept mind with empty tags array', () => {
    const validRequest = {
      realm: 'mind' as const,
      care: 3,
      tags: []
    }

    const result = organizeRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should reject non-integer care value', () => {
    const invalidRequest = {
      realm: 'physical' as const,
      care: 3.5,
      location_name: 'Test Location'
    }

    const result = organizeRequestSchema.safeParse(invalidRequest)
    expect(result.success).toBe(false)
  })

  it('should accept all valid care values (1-5)', () => {
    const careValues = [1, 2, 3, 4, 5]

    careValues.forEach(care => {
      const validRequest = {
        realm: 'physical' as const,
        care,
        location_name: 'Test Location'
      }

      const result = organizeRequestSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })
  })
})
