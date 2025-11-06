import { Database } from '@/lib/supabase/database.types';

// Database types
export type ConnectionRow = Database['public']['Tables']['connections']['Row'];
export type ConnectionInsert = Database['public']['Tables']['connections']['Insert'];
export type ConnectionUpdate = Database['public']['Tables']['connections']['Update'];

// Relationship types (user-extensible)
export type RelationshipType = 'caused' | 'inspired' | 'fulfills' | string;

// Connection source
export type ConnectionCreatedBy = 'user' | 'ai_suggested';

// Extended interface for connections
export interface Connection extends ConnectionRow {
  // Computed fields can be added here
}
