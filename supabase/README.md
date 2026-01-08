# Supabase Directory

This directory contains database migrations, configuration, and seed data for (ur "reality").

## Structure

```
supabase/
├── migrations/          # Database schema migrations (timestamped)
├── config.toml          # Supabase local configuration
└── seed.sql            # (Optional) Seed data for development

```

---

## Migrations

All database schema changes are tracked as SQL migration files in `migrations/`.

### Migration Naming Convention

```
YYYYMMDDHHMMSS_description.sql

Example: 20251101120000_evolve_captures_to_somethings.sql
```

**Timestamp Format:** YYYYMMDDHHmmss (year, month, day, hour, minute, second)

### Current Migrations

| Migration | Date | Description |
|-----------|------|-------------|
| `20251027000001_create_users_table.sql` | Oct 27 | Create users table |
| `20251027000002_create_captures_table.sql` | Oct 27 | Create captures table (original) |
| `20251027000003_enable_rls.sql` | Oct 27 | Enable Row Level Security |
| `20251027000004_add_users_rls_policies.sql` | Oct 27 | Add RLS policies for users |
| `20251027000005_add_user_name.sql` | Oct 27 | Add name column to users |
| `20251031000006_handle_new_user.sql` | Oct 31 | Trigger for new user creation |
| `20251031000007_fix_phone_nullable_for_email_auth.sql` | Oct 31 | Make phone nullable |
| `20251101000008_create_captures_media_bucket.sql` | Nov 1 | Create storage bucket for media |
| **`20251101120000_evolve_captures_to_somethings.sql`** | **Nov 1** | **Major: Rename captures → somethings, add realm/care fields** |
| `20251104000001_update_realm_check_constraint.sql` | Nov 4 | Update realm constraint |
| `20251105000001_add_location_fields.sql` | Nov 5 | Add latitude/longitude |
| `20251106000001_create_connections_table.sql` | Nov 6 | Create connections table |
| `20251110000001_add_max_somethings_bound.sql` | Nov 10 | Add bound check for somethings |
| `20251112000001_make_captures_media_public.sql` | Nov 12 | Make media bucket public |
| `20251121000001_fix_content_type_constraint.sql` | Nov 21 | Fix content_type constraint |

---

## Core Database Schema

### Tables

#### `users`
Extends Supabase Auth users with profile data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile

---

#### `somethings`
Stores all captured content (formerly `captures`).

```sql
CREATE TABLE somethings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT CHECK (content_type IN ('text', 'image', 'video', 'audio', 'url')),
  text_content TEXT,
  media_url TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,

  -- Realm & organization
  realm TEXT CHECK (realm IN ('reality', 'mind', 'heart')),
  domain TEXT,
  category_path TEXT,

  -- Care level (beauty/ugly spectrum)
  care INT CHECK (care BETWEEN -2 AND 2),
  care_frequency INT DEFAULT 0,

  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Hierarchy
  parent_id UUID REFERENCES somethings(id) ON DELETE CASCADE,

  -- Timestamps
  captured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Columns:**
- `content_type` - Type of content (text, image, video, audio, url)
- `attributes` - JSONB for extensible metadata (link preview, OCR text, etc.)
- `realm` - Three Realms categorization (reality, mind, heart)
- `care` - Beauty/ugly spectrum (-2=hate, -1=dislike, 0=neutral, 1=like, 2=love)
- `latitude/longitude` - Geolocation of capture
- `parent_id` - Self-referencing FK for nested captures

**RLS Policies:**
- Users can only access their own somethings (filtered by `user_id`)
- All CRUD operations enforced via RLS

**Indexes:**
- `idx_somethings_user_id` - Fast user filtering
- `idx_somethings_created_at` - Time-based sorting

---

#### `connections`
Links between somethings and/or lenses.

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  from_id UUID NOT NULL,
  to_id UUID NOT NULL,
  from_type TEXT CHECK (from_type IN ('something', 'lens')),
  to_type TEXT CHECK (to_type IN ('something', 'lens')),

  relationship_type TEXT CHECK (relationship_type IN ('through', 'contains', 'drives', 'fulfills', 'related')),
  meaning TEXT,
  strength INT CHECK (strength BETWEEN 1 AND 10),

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Relationship Types:**
- `through` - Capture came through this lens
- `contains` - Lens contains sub-lenses
- `drives` - Lens drives another lens
- `fulfills` - Lens fulfills another lens
- `related` - Generic connection

**RLS Policies:**
- Users can only access their own connections

---

#### `lenses` (Planned - Epic 5.1)
The drives/question marks discovered through pattern recognition.

```sql
CREATE TABLE lenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  name TEXT,                    -- NULL initially (starts as ?)
  description TEXT,
  care_level INT CHECK (care_level BETWEEN -2 AND 2),
  type TEXT CHECK (type IN ('discovered', 'system', 'meta')),

  discovered_at TIMESTAMPTZ DEFAULT now(),
  capture_count INT DEFAULT 0,  -- Denormalized for performance

  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Status:** Not yet implemented (Epic 5.1)

---

#### `intentions` (Planned - Epic 5.2)
Goals/questions that activate the attention mechanism.

```sql
CREATE TABLE intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  query TEXT NOT NULL,
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

**Status:** Not yet implemented (Epic 5.2)

---

#### `attention_results` (Planned - Epic 5.2)
Which lenses surfaced for an intention (AI output).

```sql
CREATE TABLE attention_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id UUID REFERENCES intentions(id) ON DELETE CASCADE,
  lens_id UUID REFERENCES lenses(id) ON DELETE CASCADE,

  relevance_score FLOAT CHECK (relevance_score BETWEEN 0.0 AND 1.0),
  surfaced_at TIMESTAMPTZ DEFAULT now()
);
```

**Status:** Not yet implemented (Epic 5.2)

---

### Storage Buckets

#### `captures-media`
Stores uploaded media files (images, videos, audio).

**Configuration:**
- **Public:** Yes (files accessible via URL)
- **File size limit:** 50MB
- **Allowed types:** image/*, video/*, audio/*

**RLS Policies:**
- Users can upload to their own folder (`user_id/`)
- Files are publicly readable (but URLs are unguessable)

**File naming:**
```
{user_id}/{timestamp}_{random_uuid}.{ext}

Example: abc123-def456/1698765432_xyz789.jpg
```

---

## Row Level Security (RLS)

All tables use RLS to enforce multi-tenant data isolation.

### How RLS Works

```sql
-- Enable RLS on table
ALTER TABLE somethings ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can read own somethings"
  ON somethings FOR SELECT
  USING (auth.uid() = user_id);
```

**Result:** Queries automatically filter by `user_id = auth.uid()`. No manual filtering needed in application code.

### Benefits
- **Security:** Users can't access other users' data
- **Simplicity:** No need for `WHERE user_id = ?` in every query
- **Performance:** PostgreSQL optimizes RLS at query plan level

### Important Notes
- RLS is **always enabled** on production
- Test RLS locally with different user sessions
- RLS policies apply to all queries (SELECT, INSERT, UPDATE, DELETE)

---

## Working with Migrations

### Creating a New Migration

```bash
# Generate timestamped migration file
supabase migration new description_of_change

# Example output: supabase/migrations/20251201120000_description_of_change.sql
```

### Writing Migrations

**Best Practices:**
1. **Idempotent** - Use `IF NOT EXISTS`, `IF EXISTS` checks
2. **Backward compatible** - Add columns with defaults, don't drop columns
3. **Data migrations** - Update existing data before adding constraints
4. **Comments** - Explain the "why" in SQL comments

**Example Migration:**
```sql
-- ============================================================================
-- Migration: Add abode_id to somethings
-- Story: 5.4 - Send to Abode System
-- ============================================================================

-- Add abode_id column (nullable for now)
ALTER TABLE somethings ADD COLUMN abode_id UUID REFERENCES abodes(id) ON DELETE SET NULL;

-- Add index for fast abode filtering
CREATE INDEX idx_somethings_abode_id ON somethings(abode_id);

-- Update RLS policies (if needed)
-- ...

-- Add comments
COMMENT ON COLUMN somethings.abode_id IS 'Which abode this something belongs to (Beauty, Dreams, Ugly, etc.)';
```

### Applying Migrations

```bash
# Local development (Supabase running via Docker)
supabase db reset              # Reset and apply all migrations

# Or apply specific migration
supabase migration up

# Production (via Supabase Dashboard or CLI)
supabase db push
```

### Rolling Back Migrations

**Not recommended** - Migrations are forward-only.

**Instead:**
- Create a new migration that reverses changes
- Or use `ALTER TABLE ... DROP COLUMN ...` in a new migration

---

## Local Development

### Starting Supabase Locally

```bash
# Start Supabase (Docker required)
supabase start

# Output includes:
# - API URL
# - GraphQL URL
# - Studio URL (http://localhost:54323)
# - Inbucket (email testing)
# - JWT secret
# - anon key
# - service_role key
```

### Accessing Studio

```bash
# Open Supabase Studio in browser
supabase db studio

# Or navigate to: http://localhost:54323
```

**Studio Features:**
- Table editor (view/edit data)
- SQL editor (run queries)
- Database schema visualization
- Authentication management
- Storage browser

### Stopping Supabase

```bash
# Stop Supabase
supabase stop

# Stop and remove volumes (full reset)
supabase stop --no-backup
```

---

## Type Generation

Supabase can auto-generate TypeScript types from your database schema.

### Generate Types

```bash
# Generate types from local database
supabase gen types typescript --local > lib/supabase/database.types.ts

# Or from production
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

### Using Generated Types

```typescript
import type { Database } from '@/lib/supabase/database.types'

// Type-safe table access
type Something = Database['public']['Tables']['somethings']['Row']
type SomethingInsert = Database['public']['Tables']['somethings']['Insert']
type SomethingUpdate = Database['public']['Tables']['somethings']['Update']

// Usage
const something: Something = {
  id: 'abc123',
  user_id: 'def456',
  content_type: 'text',
  text_content: 'Hello',
  // ... all fields typed
}
```

### When to Regenerate Types

- After running new migrations
- When schema changes (new tables, columns)
- Before deploying (to catch type errors)

---

## Production Deployment

### Linking to Supabase Project

```bash
# Link local project to Supabase project
supabase link --project-ref YOUR_PROJECT_ID
```

### Pushing Migrations to Production

```bash
# Push all new migrations
supabase db push

# Confirm migrations to apply
# ✓ All migrations applied successfully
```

### Verifying Production Schema

```bash
# Check production database status
supabase db diff

# If diff shows changes, create migration
supabase db diff --file migration_name
```

---

## Common Operations

### Adding a New Table

```sql
-- Create table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- ... other columns
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own records"
  ON new_table FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON new_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_new_table_user_id ON new_table(user_id);

-- Add comments
COMMENT ON TABLE new_table IS 'Description of what this table stores';
```

### Adding a Column

```sql
-- Add column with default
ALTER TABLE somethings ADD COLUMN new_field TEXT DEFAULT 'default_value';

-- Make NOT NULL after adding
ALTER TABLE somethings ALTER COLUMN new_field SET NOT NULL;

-- Add constraint
ALTER TABLE somethings ADD CONSTRAINT check_new_field
  CHECK (new_field IN ('value1', 'value2'));

-- Add index if needed
CREATE INDEX idx_somethings_new_field ON somethings(new_field);
```

### Updating Existing Data

```sql
-- Update in migration (before adding constraint)
UPDATE somethings SET realm = 'reality' WHERE realm IS NULL;

-- Then add constraint
ALTER TABLE somethings ALTER COLUMN realm SET NOT NULL;
```

---

## Testing Migrations

```bash
# Reset local database and apply all migrations
supabase db reset

# Run application tests
pnpm test

# Check for type errors
pnpm typecheck

# Verify RLS policies work
# (Test in browser with different user accounts)
```

---

## Troubleshooting

### Migration Failed

```bash
# Check Supabase logs
supabase db logs

# Manually fix database (in Studio)
# Then mark migration as applied
supabase migration repair --status applied 20251201120000

# Or rollback (recreate from backup)
supabase db reset
```

### RLS Blocking Queries

```bash
# Disable RLS temporarily (local dev only!)
ALTER TABLE somethings DISABLE ROW LEVEL SECURITY;

# Check if RLS is the issue
# Then fix policy and re-enable
ALTER TABLE somethings ENABLE ROW LEVEL SECURITY;
```

### Type Generation Not Working

```bash
# Ensure Supabase is running
supabase status

# Check TypeScript compiler
pnpm typecheck

# Regenerate types
supabase gen types typescript --local > lib/supabase/database.types.ts
```

---

## Best Practices

1. **Test migrations locally** before pushing to production
2. **Use transactions** for complex migrations
3. **Add comments** explaining the purpose
4. **Never edit old migrations** - create new ones instead
5. **Backup production** before major schema changes
6. **Keep migrations small** - one logical change per migration
7. **Test RLS policies** with different user sessions
8. **Regenerate types** after schema changes

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**The database is the foundation - keep migrations clean, RLS tight, and types up-to-date.**
