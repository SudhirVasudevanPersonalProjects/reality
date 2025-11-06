-- ============================================================================
-- Migration: Evolve captures table to somethings with Three Realms Foundation
-- Story: 2.1 - Database Schema Evolution
-- ============================================================================

-- ============================================================================
-- SECTION 1: RENAME AND EXTEND BASE TABLE
-- ============================================================================

-- Rename captures table to somethings
ALTER TABLE captures RENAME TO somethings;

-- Add new columns for realm-based organization
ALTER TABLE somethings ADD COLUMN realm TEXT CHECK (realm IN ('reality', 'mind', 'heart'));
ALTER TABLE somethings ADD COLUMN domain TEXT;
ALTER TABLE somethings ADD COLUMN category_path TEXT;

-- Add care fields (emotional response and frequency)
ALTER TABLE somethings ADD COLUMN care INT CHECK (care BETWEEN 1 AND 5);  -- 1=Hate, 2=Dislike, 3=Care, 4=Like, 5=Love
ALTER TABLE somethings ADD COLUMN care_frequency INT DEFAULT 1;  -- Counter for repeated encounters

-- Add extensibility and hierarchy fields
ALTER TABLE somethings ADD COLUMN attributes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE somethings ADD COLUMN parent_id UUID REFERENCES somethings(id) ON DELETE CASCADE;

-- Add new timestamp fields
ALTER TABLE somethings ADD COLUMN captured_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE somethings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Migrate timestamp data: copy created_at to captured_at for existing records
UPDATE somethings SET captured_at = created_at WHERE captured_at IS NULL;

-- Make captured_at NOT NULL after migration
ALTER TABLE somethings ALTER COLUMN captured_at SET NOT NULL;

-- Rename existing indexes
ALTER INDEX idx_captures_user_id RENAME TO idx_somethings_user_id;
ALTER INDEX idx_captures_created_at RENAME TO idx_somethings_created_at;

-- Update RLS policies: Drop old policies and create new ones with somethings table name
DROP POLICY IF EXISTS "Users can insert own captures" ON somethings;
DROP POLICY IF EXISTS "Users can read own captures" ON somethings;
DROP POLICY IF EXISTS "Users can update own captures" ON somethings;
DROP POLICY IF EXISTS "Users can delete own captures" ON somethings;

CREATE POLICY "Users can insert own somethings"
  ON somethings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own somethings"
  ON somethings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own somethings"
  ON somethings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own somethings"
  ON somethings FOR DELETE
  USING (auth.uid() = user_id);

-- Update table and column comments
COMMENT ON TABLE somethings IS 'Stores all user captures organized into three realms: Reality (physical), Mind (mental), Heart (emotional)';
COMMENT ON COLUMN somethings.realm IS 'Which realm this something belongs to: reality (physical), mind (mental), or heart (emotional)';
COMMENT ON COLUMN somethings.domain IS 'User-defined domain for navigation (e.g., abode, reality, mind, heart, custom)';
COMMENT ON COLUMN somethings.category_path IS 'Hierarchical path within domain (e.g., abilities/strengths/physical)';
COMMENT ON COLUMN somethings.care IS 'Emotional response: 1=Hate, 2=Dislike, 3=Care, 4=Like, 5=Love (visual coding: dark to bright)';
COMMENT ON COLUMN somethings.care_frequency IS 'Counter for repeated encounters (increments when same something noted again)';
COMMENT ON COLUMN somethings.attributes IS 'Custom user-defined fields as JSONB (unlimited extensibility)';
COMMENT ON COLUMN somethings.parent_id IS 'Self-referencing FK for splits or nesting (e.g., split captures, nested thoughts)';
COMMENT ON COLUMN somethings.captured_at IS 'When this something was originally captured (distinct from created_at)';
COMMENT ON COLUMN somethings.updated_at IS 'Auto-updated timestamp for last modification';

-- ============================================================================
-- SECTION 2: CREATE REALM EXTENSION TABLES
-- ============================================================================

-- Extension table for Reality realm (physical experiences)
CREATE TABLE my_reality (
  something_id UUID PRIMARY KEY REFERENCES somethings(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  quality_score INT CHECK (quality_score BETWEEN 1 AND 10)
);

-- Enable RLS
ALTER TABLE my_reality ENABLE ROW LEVEL SECURITY;

-- RLS policies for my_reality (enforced via somethings join)
CREATE POLICY "Users can insert own reality experiences"
  ON my_reality FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = my_reality.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own reality experiences"
  ON my_reality FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = my_reality.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reality experiences"
  ON my_reality FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = my_reality.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reality experiences"
  ON my_reality FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = my_reality.something_id
      AND somethings.user_id = auth.uid()
    )
  );

COMMENT ON TABLE my_reality IS 'Reality realm extensions: physical experiences with location and quality data';
COMMENT ON COLUMN my_reality.latitude IS 'Geographic latitude (±90.00000000)';
COMMENT ON COLUMN my_reality.longitude IS 'Geographic longitude (±180.00000000)';
COMMENT ON COLUMN my_reality.location_name IS 'User-friendly location name';
COMMENT ON COLUMN my_reality.quality_score IS 'Quality rating 1-10 for physical experience';

-- Extension table for Heart realm (emotional cares)
-- NOTE: Created before thoughts table because thoughts references cares
CREATE TABLE cares (
  something_id UUID PRIMARY KEY REFERENCES somethings(id) ON DELETE CASCADE,
  intensity DECIMAL(3, 2) CHECK (intensity BETWEEN 0 AND 1),
  why TEXT,
  fulfilled BOOLEAN DEFAULT false,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  fulfilled_by_reality_id UUID REFERENCES my_reality(something_id)
);

-- Enable RLS
ALTER TABLE cares ENABLE ROW LEVEL SECURITY;

-- RLS policies for cares
CREATE POLICY "Users can insert own cares"
  ON cares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = cares.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own cares"
  ON cares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = cares.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cares"
  ON cares FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = cares.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cares"
  ON cares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = cares.something_id
      AND somethings.user_id = auth.uid()
    )
  );

COMMENT ON TABLE cares IS 'Heart realm extensions: emotional cares, wants, and yearnings';
COMMENT ON COLUMN cares.intensity IS 'Emotional intensity 0.0-1.0 (how deeply you care)';
COMMENT ON COLUMN cares.why IS 'Deeper motivation explaining why this matters';
COMMENT ON COLUMN cares.fulfilled IS 'Whether this care has been fulfilled';
COMMENT ON COLUMN cares.fulfilled_at IS 'When this care was fulfilled';
COMMENT ON COLUMN cares.fulfilled_by_reality_id IS 'Physical experience that fulfilled this care';

-- Care dependencies join table (cares can depend on other cares)
CREATE TABLE care_dependencies (
  care_id UUID REFERENCES cares(something_id) ON DELETE CASCADE,
  depends_on_care_id UUID REFERENCES cares(something_id) ON DELETE CASCADE,
  PRIMARY KEY (care_id, depends_on_care_id),
  CHECK (care_id != depends_on_care_id)  -- No self-dependencies
);

-- Enable RLS
ALTER TABLE care_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS policies for care_dependencies
CREATE POLICY "Users can insert own care dependencies"
  ON care_dependencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM somethings s
      JOIN cares c ON c.something_id = s.id
      WHERE c.something_id = care_dependencies.care_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own care dependencies"
  ON care_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM somethings s
      JOIN cares c ON c.something_id = s.id
      WHERE c.something_id = care_dependencies.care_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own care dependencies"
  ON care_dependencies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM somethings s
      JOIN cares c ON c.something_id = s.id
      WHERE c.something_id = care_dependencies.care_id
      AND s.user_id = auth.uid()
    )
  );

COMMENT ON TABLE care_dependencies IS 'Join table for care dependency relationships (care A depends on care B)';

-- Extension table for Mind realm (thoughts and reflections)
-- NOTE: Created after cares table because it references cares
CREATE TABLE thoughts (
  something_id UUID PRIMARY KEY REFERENCES somethings(id) ON DELETE CASCADE,
  parent_thought_id UUID REFERENCES thoughts(something_id),
  reality_id UUID REFERENCES my_reality(something_id),
  care_id UUID REFERENCES cares(something_id),
  thought_type TEXT
);

-- Enable RLS
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- RLS policies for thoughts
CREATE POLICY "Users can insert own thoughts"
  ON thoughts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = thoughts.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own thoughts"
  ON thoughts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = thoughts.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own thoughts"
  ON thoughts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = thoughts.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own thoughts"
  ON thoughts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = thoughts.something_id
      AND somethings.user_id = auth.uid()
    )
  );

COMMENT ON TABLE thoughts IS 'Mind realm extensions: thoughts, reflections, questions, and insights';
COMMENT ON COLUMN thoughts.parent_thought_id IS 'FK to parent thought for nested thinking';
COMMENT ON COLUMN thoughts.reality_id IS 'FK to physical experience this thought is about';
COMMENT ON COLUMN thoughts.care_id IS 'FK to emotional care this thought is about';
COMMENT ON COLUMN thoughts.thought_type IS 'Type of thought: reflection, question, insight, etc.';

-- ============================================================================
-- SECTION 3: CREATE DOMAIN SYSTEM
-- ============================================================================

CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  includes_realms TEXT[],
  is_default BOOLEAN DEFAULT false,
  sort_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, domain_name)
);

-- Enable RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- RLS policies for domains
CREATE POLICY "Users can insert own domains"
  ON domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own domains"
  ON domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own non-default domains"
  ON domains FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

COMMENT ON TABLE domains IS 'User-defined domains for navigation (vertical tabs organizing realms)';
COMMENT ON COLUMN domains.domain_name IS 'Internal name (lowercase, no spaces): abode, reality, mind, heart, custom_name';
COMMENT ON COLUMN domains.display_name IS 'Display name shown in UI: Abode, Reality, Mind, Heart, Custom Name';
COMMENT ON COLUMN domains.includes_realms IS 'Array of realms shown in this domain: [reality], [mind], [heart], or combinations';
COMMENT ON COLUMN domains.is_default IS 'System default domains cannot be deleted';
COMMENT ON COLUMN domains.sort_order IS 'Vertical order: 0=top, 1=next, etc. (descending display)';

-- Function to seed default domains for new users
CREATE OR REPLACE FUNCTION public.seed_default_domains(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.domains (user_id, domain_name, display_name, includes_realms, is_default, sort_order)
  VALUES
    (target_user_id, 'abode', 'Abode', '{}', true, 0),
    (target_user_id, 'reality', 'Reality', ARRAY['reality'], true, 1),
    (target_user_id, 'mind', 'Mind', ARRAY['mind'], true, 2),
    (target_user_id, 'heart', 'Heart', ARRAY['heart'], true, 3)
  ON CONFLICT (user_id, domain_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.seed_default_domains IS 'Seeds 4 default domains for a user: Abode, Reality, Mind, Heart';

-- Trigger function to seed default domains on user signup
CREATE OR REPLACE FUNCTION public.trigger_seed_default_domains()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.seed_default_domains(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Seed domains after user insert in public.users
-- Note: This fires after handle_new_user() creates the public.users record
CREATE TRIGGER on_user_created_seed_domains
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_default_domains();

-- Backfill default domains for existing users from public.users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    PERFORM seed_default_domains(user_record.id);
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 4: CREATE CATEGORY HIERARCHY SYSTEM
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  full_path TEXT NOT NULL,
  domain TEXT,
  depth INT DEFAULT 0,
  sort_order INT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, full_path)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE categories IS 'User-defined category hierarchies (unlimited tree structure for organizing somethings)';
COMMENT ON COLUMN categories.name IS 'Category name (e.g., Strengths, Physical strength)';
COMMENT ON COLUMN categories.parent_id IS 'Self-referencing FK for tree structure (NULL = root level)';
COMMENT ON COLUMN categories.full_path IS 'Computed hierarchical path (e.g., abilities/strengths/physical)';
COMMENT ON COLUMN categories.domain IS 'Which domain this hierarchy belongs to (reality, mind, heart, or NULL for universal)';
COMMENT ON COLUMN categories.depth IS 'Tree depth: 0=root, 1=first level, etc.';
COMMENT ON COLUMN categories.sort_order IS 'Manual ordering within same parent';

-- Function to compute category full_path automatically
CREATE OR REPLACE FUNCTION compute_category_full_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT;
  parent_depth INT;
BEGIN
  -- If this is a root category (no parent)
  IF NEW.parent_id IS NULL THEN
    NEW.full_path := NEW.name;
    NEW.depth := 0;
  ELSE
    -- Get parent's full_path and depth
    SELECT full_path, depth INTO parent_path, parent_depth
    FROM categories
    WHERE id = NEW.parent_id AND user_id = NEW.user_id;

    -- Compute this category's full_path and depth
    NEW.full_path := parent_path || '/' || NEW.name;
    NEW.depth := parent_depth + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION compute_category_full_path IS 'Trigger function to auto-compute full_path and depth when category inserted/updated';

-- Trigger: Compute full_path before insert or update
CREATE TRIGGER categories_compute_path
  BEFORE INSERT OR UPDATE OF name, parent_id ON categories
  FOR EACH ROW
  EXECUTE FUNCTION compute_category_full_path();

-- ============================================================================
-- SECTION 5: CREATE TAGS SYSTEM
-- ============================================================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags
CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE tags IS 'User-defined tags for cross-cutting labels (hashtag system)';
COMMENT ON COLUMN tags.name IS 'Tag name (e.g., work, family, urgent)';
COMMENT ON COLUMN tags.color IS 'Hex color for visual coding';

-- Join table for something-tag relationships
CREATE TABLE something_tags (
  something_id UUID REFERENCES somethings(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (something_id, tag_id)
);

-- Enable RLS
ALTER TABLE something_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for something_tags
CREATE POLICY "Users can insert own something tags"
  ON something_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = something_tags.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own something tags"
  ON something_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = something_tags.something_id
      AND somethings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own something tags"
  ON something_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = something_tags.something_id
      AND somethings.user_id = auth.uid()
    )
  );

COMMENT ON TABLE something_tags IS 'Join table for many-to-many relationship between somethings and tags';

-- Create indexes for tags
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_something_tags_something_id ON something_tags(something_id);
CREATE INDEX idx_something_tags_tag_id ON something_tags(tag_id);

-- ============================================================================
-- SECTION 6: CREATE CONNECTIONS TABLE
-- ============================================================================

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_something_id UUID NOT NULL REFERENCES somethings(id) ON DELETE CASCADE,
  to_something_id UUID NOT NULL REFERENCES somethings(id) ON DELETE CASCADE,
  relationship_type TEXT,
  strength INT CHECK (strength BETWEEN 1 AND 10),
  meaning TEXT,
  notes TEXT,
  created_by TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (from_something_id != to_something_id)  -- No self-connections
);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for connections
CREATE POLICY "Users can insert own connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE connections IS 'Connections between somethings (graph edges for Epic 3)';
COMMENT ON COLUMN connections.relationship_type IS 'User-extensible: caused, inspired, fulfills, etc.';
COMMENT ON COLUMN connections.strength IS 'Connection strength 1-10';
COMMENT ON COLUMN connections.meaning IS 'Why this connection exists (the core insight)';
COMMENT ON COLUMN connections.created_by IS 'Source: user or ai_suggested';

-- Create indexes for connections
CREATE INDEX idx_connections_from ON connections(from_something_id);
CREATE INDEX idx_connections_to ON connections(to_something_id);
CREATE INDEX idx_connections_user_id ON connections(user_id);

-- ============================================================================
-- SECTION 7: CREATE TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to auto-update updated_at on row modification';

-- Trigger: Auto-update somethings.updated_at
CREATE TRIGGER somethings_updated_at
  BEFORE UPDATE ON somethings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update categories.updated_at
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 8: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Indexes on somethings table
CREATE INDEX idx_somethings_realm ON somethings(realm) WHERE realm IS NOT NULL;
CREATE INDEX idx_somethings_domain ON somethings(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_somethings_category_path ON somethings(category_path) WHERE category_path IS NOT NULL;
CREATE INDEX idx_somethings_captured_at ON somethings(captured_at DESC);
CREATE INDEX idx_somethings_parent ON somethings(parent_id) WHERE parent_id IS NOT NULL;

-- GIST index on my_reality for spatial queries (requires earthdistance extension)
-- Note: We'll use a simple index on lat/lng for now, spatial index can be added later if needed
CREATE INDEX idx_my_reality_latitude ON my_reality(latitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_my_reality_longitude ON my_reality(longitude) WHERE longitude IS NOT NULL;

-- Indexes on thoughts
CREATE INDEX idx_thoughts_parent ON thoughts(parent_thought_id) WHERE parent_thought_id IS NOT NULL;
CREATE INDEX idx_thoughts_reality ON thoughts(reality_id) WHERE reality_id IS NOT NULL;
CREATE INDEX idx_thoughts_care ON thoughts(care_id) WHERE care_id IS NOT NULL;

-- Indexes on cares
CREATE INDEX idx_cares_fulfilled ON cares(fulfilled) WHERE NOT fulfilled;
CREATE INDEX idx_cares_intensity ON cares(intensity DESC) WHERE intensity IS NOT NULL;

-- Indexes on categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_categories_full_path ON categories(full_path);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
