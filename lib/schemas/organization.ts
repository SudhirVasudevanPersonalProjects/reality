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
  tags: z.array(z.string()).optional()
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
