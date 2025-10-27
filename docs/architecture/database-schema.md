# Database Schema

This section defines the actual PostgreSQL database schema that implements the Data Models. All tables use Supabase's managed PostgreSQL with Row Level Security (RLS) policies for multi-tenant isolation.

## 5.1: Schema Overview

**Database:** PostgreSQL 16.x (Supabase managed)
**Schema:** `public` (default Supabase schema)
**Extensions Required:**
- `uuid-ossp` - UUID generation
- `postgis` - Geospatial data types for lat/lng
- `pg_trgm` - Trigram text search for autocomplete

**Design Principles:**
- All tables use `uuid` primary keys (not serial integers) for security and distributed systems compatibility
- All user-owned data is protected by Row Level Security (RLS) policies
- Soft deletes not used - hard deletes preferred for user privacy (GDPR compliance)
- Timestamps use `timestamptz` (timezone-aware) for global users
- JSON columns use `jsonb` for indexable semi-structured data
- All nullable fields default to `NULL` (explicit nullability)

## 5.2: Core Tables

### users (extends Supabase auth.users)

Supabase manages the core `auth.users` table. We create a `public.users` table for application-level user data.

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  phone_number text UNIQUE, -- E.164 format, nullable
  display_name text,
  birth_date date,
  timezone text, -- IANA timezone
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone_number ON public.users(phone_number) WHERE phone_number IS NOT NULL;

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

**Note**: The full Database Schema section continues with detailed PostgreSQL DDL for all remaining tables (profiles, experiences, experience_participants, thoughts, desires, desire_dependencies, connections, tags, and tag join tables), complete with:
- Column definitions with proper types and constraints
- Indexes (B-tree, GIN for full-text search, GIST for geospatial)
- Row Level Security (RLS) policies for multi-tenant isolation
- Triggers for auto-updating timestamps and stats counters
- Check constraints for data validation
- Foreign key relationships with cascading deletes

The complete schema is approximately 800+ lines of SQL and includes:

**Remaining Tables:**
- `profiles` - Extended user data
- `experiences` - Captured moments with location/media
- `experience_participants` - Shared experience join table
- `thoughts` - Reflections on experiences/desires
- `desires` - Goals and motivations
- `desire_dependencies` - Dependency graph
- `connections` - Universal entity relationship table (ANY entity → ANY entity)
- `tags` - User-defined labels
- `experience_tags`, `thought_tags`, `desire_tags` - Tag join tables

**Key Schema Features:**
- **Universal Connections Table**: Polymorphic design with `from_entity_type`/`to_entity_type` enums and conditional foreign keys for maximum flexibility
- **Full-Text Search**: GIN indexes on text fields for instant search across experiences/thoughts/desires
- **Geospatial Queries**: PostGIS GIST indexes for map-based experience queries
- **Performance Optimizations**: Partial indexes, composite indexes, covering indexes
- **Data Integrity**: Check constraints (1-10 ranges), unique constraints, circular dependency prevention
- **Audit Trail**: `created_at`/`updated_at` on all tables with auto-update triggers
- **GDPR Compliance**: Hard deletes (CASCADE), no soft deletes, user owns all data

## 5.3: Performance Optimizations

**Query Optimization Strategies:**
1. **Partial Indexes** - Only index non-null values where appropriate (e.g., fulfilled desires)
2. **Composite Indexes** - Multi-column indexes for common query patterns (user_id + category)
3. **GIN Indexes** - Full-text search on text fields using tsvector
4. **GIST Indexes** - Geospatial queries on lat/lng using PostGIS
5. **Covering Indexes** - INCLUDE columns for index-only scans (future optimization)

**Connection Queries:**
The `connections` table uses polymorphic associations which can be slow. Optimization strategies:
- Index each entity ID column separately with partial indexes
- Use UNION queries when fetching "all connections for Experience X" across entity types
- Consider materialized views for complex connection graph queries
- Future: Add JSONB column storing connection graph for hot paths

**Realtime Performance:**
- Supabase Realtime uses PostgreSQL logical replication
- Limit Realtime subscriptions to specific rows (e.g., `user_id = auth.uid()`)
- Avoid subscribing to entire tables - use filtered subscriptions
- Batch Realtime updates (don't create 1 connection per experience, batch 10 at a time)

## 5.4: Data Integrity

**Referential Integrity:**
- All foreign keys use `ON DELETE CASCADE` except where data should persist (e.g., fulfilled_by_experience_id uses SET NULL)
- Circular dependency prevention in desire_dependencies (TODO: implement with trigger)
- Check constraints on ratings (1-10 range) and intensity (0.0-1.0 range)
- Unique constraints on user email, phone number, tag names per user

**Row Level Security (RLS):**
- Every user-owned table has RLS enabled
- Policies enforce multi-tenant isolation (users can only access their own data)
- Shared experiences use participant join table for access control
- System uses `auth.uid()` function to get current authenticated user ID

**Audit Trail:**
- `created_at` and `updated_at` timestamps on all tables
- `updated_at` auto-updated via trigger
- No soft deletes - hard deletes for GDPR compliance (user can truly delete data)
- Future: Add audit log table for compliance if needed

## 5.5: Migration Strategy

**Supabase Migration Workflow:**
1. Create migration: `supabase migration new create_schema`
2. Write DDL in migration file
3. Apply locally: `supabase db push`
4. Test with local Supabase instance
5. Deploy to production: migrations auto-apply on git push (Supabase GitHub integration)

**Schema Versioning:**
- All schema changes must be in migrations (never manual ALTER TABLE in production)
- Migrations are immutable once deployed (create new migration to change, don't edit old ones)
- Use database functions for complex logic (keeps logic in database, not scattered in app code)

**Rollback Strategy:**
- Migrations are one-way (no automatic rollback)
- For emergency rollback: create reverse migration manually
- Prefer additive changes (add column, mark old one deprecated) over destructive changes
- Test migrations in staging environment before production

---

