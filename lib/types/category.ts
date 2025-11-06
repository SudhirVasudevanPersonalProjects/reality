import { Database } from '@/lib/supabase/database.types';

// Database types
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

// Extended interface for categories
export interface Category extends CategoryRow {
  // Optional nested categories (loaded on demand)
  children?: Category[];
  parent?: Category;
}

// Helper type for category tree navigation
export interface CategoryTree extends Category {
  children: CategoryTree[];
}
