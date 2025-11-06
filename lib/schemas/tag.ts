import { z } from 'zod';

// Tag insert schema
export const tagInsertSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // Hex color
});

// Tag update schema
export const tagUpdateSchema = tagInsertSchema.partial();

// Type exports
export type TagInsertInput = z.infer<typeof tagInsertSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
