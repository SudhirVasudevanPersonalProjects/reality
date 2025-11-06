import { Database } from '@/lib/supabase/database.types';
import { Realm } from './something';

// Database types
export type DomainRow = Database['public']['Tables']['domains']['Row'];
export type DomainInsert = Database['public']['Tables']['domains']['Insert'];
export type DomainUpdate = Database['public']['Tables']['domains']['Update'];

// Extended interface for domains
export interface Domain extends DomainRow {
  // Computed fields can be added here
}

// Default domain names
export type DefaultDomainName = 'abode' | 'reality' | 'mind' | 'heart';

// Default domain configuration
export interface DefaultDomain {
  domainName: DefaultDomainName;
  displayName: string;
  includesRealms: Realm[];
  sortOrder: number;
}

// The 4 default domains
export const DEFAULT_DOMAINS: DefaultDomain[] = [
  {
    domainName: 'abode',
    displayName: 'Abode',
    includesRealms: [],
    sortOrder: 0,
  },
  {
    domainName: 'reality',
    displayName: 'Reality',
    includesRealms: ['reality'],
    sortOrder: 1,
  },
  {
    domainName: 'mind',
    displayName: 'Mind',
    includesRealms: ['mind'],
    sortOrder: 2,
  },
  {
    domainName: 'heart',
    displayName: 'Heart',
    includesRealms: ['heart'],
    sortOrder: 3,
  },
];
