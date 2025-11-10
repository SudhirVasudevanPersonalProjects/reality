/**
 * Zod validation schemas for Chamber organization
 */

import { z } from 'zod'

export const organizeRequestSchema = z.object({
  realm: z.enum(['physical', 'mind']),
  care: z.number().int().min(1).max(5, {
    message: 'Care must be between 1 and 5'
  }),
  location_name: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  formatted_address: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  // Story 2.4 PATCH: Mind-specific attributes
  attributes: z.object({
    mind_category: z.enum(['experience', 'thought', 'desire']).optional(),
    why: z.string().max(1000).optional(),
    desire_intensity: z.number().min(0).max(1).optional(),
    desire_status: z.enum(['nascent', 'active', 'fulfilled']).optional(),
    sun_domain: z.string().optional()
  }).optional()
}).refine(
  (data) => {
    // If realm is physical, location_name is required
    if (data.realm === 'physical' && !data.location_name) {
      return false
    }
    return true
  },
  {
    message: 'Location name is required for physical experiences',
    path: ['location_name']
  }
)

export type OrganizeRequestSchema = z.infer<typeof organizeRequestSchema>
