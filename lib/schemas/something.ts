import { z } from 'zod';

// Realm enum
export const realmSchema = z.enum(['reality', 'mind', 'heart']);

// Care rating (1-5)
export const careRatingSchema = z.number().int().min(1).max(5);

// Care frequency (positive integer)
export const careFrequencySchema = z.number().int().min(1);

// Something insert schema (for API request validation)
export const somethingInsertSchema = z.object({
  contentType: z.enum(['text', 'photo', 'video', 'url']),
  textContent: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  locationName: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  realm: realmSchema.optional(),
  domain: z.string().optional(),
  categoryPath: z.string().optional(),
  care: careRatingSchema.optional(),
  careFrequency: careFrequencySchema.optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  parentId: z.string().uuid().optional(),
  capturedAt: z.string().datetime().optional(),
});

// Something update schema
export const somethingUpdateSchema = somethingInsertSchema.partial();

// Type exports
export type SomethingInsertInput = z.infer<typeof somethingInsertSchema>;
export type SomethingUpdateInput = z.infer<typeof somethingUpdateSchema>;
