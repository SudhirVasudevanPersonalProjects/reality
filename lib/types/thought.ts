import { Database } from '@/lib/supabase/database.types';

// Database types
export type ThoughtRow = Database['public']['Tables']['thoughts']['Row'];
export type ThoughtInsert = Database['public']['Tables']['thoughts']['Insert'];
export type ThoughtUpdate = Database['public']['Tables']['thoughts']['Update'];

// Thought types
export type ThoughtType = 'reflection' | 'question' | 'insight';

// Extended interface for Mind realm
export interface Thought extends ThoughtRow {
  // Optional nested thoughts (loaded on demand)
  children?: Thought[];
  parent?: Thought;
}
