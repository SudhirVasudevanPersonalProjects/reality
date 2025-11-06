import { z } from 'zod';
import { realmSchema } from './something';

// Domain insert schema
export const domainInsertSchema = z.object({
  domainName: z.string().min(1).max(50).regex(/^[a-z_]+$/), // lowercase with underscores
  displayName: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // Hex color
  includesRealms: z.array(realmSchema).optional(),
  sortOrder: z.number().int().min(0),
});

// Domain update schema
export const domainUpdateSchema = domainInsertSchema.partial();

// Type exports
export type DomainInsertInput = z.infer<typeof domainInsertSchema>;
export type DomainUpdateInput = z.infer<typeof domainUpdateSchema>;
