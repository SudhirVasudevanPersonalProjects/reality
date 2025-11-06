import { Database } from '@/lib/supabase/database.types';

// Database types
export type TagRow = Database['public']['Tables']['tags']['Row'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];

// Something-tag relationship
export type SomethingTagRow = Database['public']['Tables']['something_tags']['Row'];
export type SomethingTagInsert = Database['public']['Tables']['something_tags']['Insert'];

// Extended interface for tags
export interface Tag extends TagRow {
  // Computed fields can be added here
}
