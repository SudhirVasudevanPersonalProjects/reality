import { Database } from '@/lib/supabase/database.types';

// Database types
export type SomethingRow = Database['public']['Tables']['somethings']['Row'];
export type SomethingInsert = Database['public']['Tables']['somethings']['Insert'];
export type SomethingUpdate = Database['public']['Tables']['somethings']['Update'];

// Realm types
export type Realm = 'reality' | 'mind' | 'heart';

// Care rating (emotional response)
export type CareRating = 1 | 2 | 3 | 4 | 5;

// Extended Something interface with computed fields
export interface Something extends SomethingRow {
  // Optional joined data (loaded on demand)
  reality?: MyRealityRow;
  thought?: ThoughtRow;
  careData?: CareRow;  // Named "careData" to avoid conflict with "care" field (1-5 rating)
  tags?: TagRow[];
  connections?: ConnectionRow[];
}

// Import types for relationships (to avoid circular dependencies, we use Row types directly)
import { Database as DB } from '@/lib/supabase/database.types';

type MyRealityRow = DB['public']['Tables']['my_reality']['Row'];
type ThoughtRow = DB['public']['Tables']['thoughts']['Row'];
type CareRow = DB['public']['Tables']['cares']['Row'];
type TagRow = DB['public']['Tables']['tags']['Row'];
type ConnectionRow = DB['public']['Tables']['connections']['Row'];
