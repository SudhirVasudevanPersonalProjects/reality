import { Database } from '@/lib/supabase/database.types';

// Database types
export type CareRow = Database['public']['Tables']['cares']['Row'];
export type CareInsert = Database['public']['Tables']['cares']['Insert'];
export type CareUpdate = Database['public']['Tables']['cares']['Update'];

// Care dependency type
export type CareDependencyRow = Database['public']['Tables']['care_dependencies']['Row'];

// Extended interface for Heart realm
export interface Care extends CareRow {
  // Optional dependencies (loaded on demand)
  dependencies?: Care[];
  dependents?: Care[];
}
