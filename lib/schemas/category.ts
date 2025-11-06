import { z } from 'zod';
import { realmSchema } from './something';

// Category insert schema
export const categoryInsertSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
  domain: realmSchema.optional(),
  sortOrder: z.number().int().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // Hex color
});

// Category update schema
export const categoryUpdateSchema = categoryInsertSchema.partial();

// Type exports
export type CategoryInsertInput = z.infer<typeof categoryInsertSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
