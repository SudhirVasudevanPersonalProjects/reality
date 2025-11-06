import { Database } from '@/lib/supabase/database.types';

// Database types
export type MyRealityRow = Database['public']['Tables']['my_reality']['Row'];
export type MyRealityInsert = Database['public']['Tables']['my_reality']['Insert'];
export type MyRealityUpdate = Database['public']['Tables']['my_reality']['Update'];

// Extended interface for Reality realm
export interface MyReality extends MyRealityRow {
  // Computed fields can be added here
}

// Location interface for convenience
export interface Location {
  latitude: number;
  longitude: number;
  locationName?: string;
}
