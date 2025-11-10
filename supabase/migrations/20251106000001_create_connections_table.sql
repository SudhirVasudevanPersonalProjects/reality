-- Migration: Create Connections Table for Mind's Abode
-- Date: 2025-11-06
-- Purpose: Enable universal connections between any somethings (Experience/Thought/Desire)
-- Part of: Story 2.8 (Mind Card View) + Mind's Abode Architecture

-- =====================================================
-- CONNECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Connection endpoints (any something can connect to any something)
  from_something_id UUID NOT NULL REFERENCES somethings(id) ON DELETE CASCADE,
  to_something_id UUID NOT NULL REFERENCES somethings(id) ON DELETE CASCADE,

  -- Connection metadata
  relationship_type TEXT,  -- 'reveals', 'fulfills', 'questions', 'caused', 'depends_on', etc. (user-extensible)
  meaning TEXT,            -- Why this connection exists - the CORE of the connection
  strength INT CHECK (strength BETWEEN 1 AND 10),  -- Optional user-defined strength

  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT no_self_connection CHECK (from_something_id != to_something_id),
  CONSTRAINT user_owns_from_something CHECK (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = connections.from_something_id
      AND somethings.user_id = connections.user_id
    )
  ),
  CONSTRAINT user_owns_to_something CHECK (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = connections.to_something_id
      AND somethings.user_id = connections.user_id
    )
  )
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for querying connections by user
CREATE INDEX idx_connections_user_id ON connections(user_id);

-- Index for finding connections FROM a something
CREATE INDEX idx_connections_from_something ON connections(from_something_id);

-- Index for finding connections TO a something
CREATE INDEX idx_connections_to_something ON connections(to_something_id);

-- Index for bidirectional queries (finding all connections involving a something)
CREATE INDEX idx_connections_bidirectional ON connections(from_something_id, to_something_id);

-- Index for relationship type filtering
CREATE INDEX idx_connections_relationship_type ON connections(relationship_type) WHERE relationship_type IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can only access their own connections
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create connections between their own somethings
CREATE POLICY "Users can create connections for their own somethings"
  ON connections FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM somethings WHERE somethings.id = from_something_id AND somethings.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM somethings WHERE somethings.id = to_something_id AND somethings.user_id = auth.uid())
  );

-- Users can update their own connections
CREATE POLICY "Users can update their own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Get Connection Count for Something
-- =====================================================

-- Function to count connections for a given something (bidirectional)
CREATE OR REPLACE FUNCTION get_connection_count(something_id_param UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result INT;
BEGIN
  SELECT COUNT(*)
  INTO count_result
  FROM connections
  WHERE
    (from_something_id = something_id_param OR to_something_id = something_id_param)
    AND user_id = auth.uid();

  RETURN count_result;
END;
$$;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to connections table
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE connections IS 'Universal connection entity - links any something to any other something with relationship metadata';
COMMENT ON COLUMN connections.relationship_type IS 'User-extensible relationship vocabulary (reveals, fulfills, questions, caused, depends_on, etc.)';
COMMENT ON COLUMN connections.meaning IS 'Why this connection exists - the core semantic content of the connection';
COMMENT ON COLUMN connections.strength IS 'Optional user-defined strength rating (1-10)';
COMMENT ON CONSTRAINT no_self_connection ON connections IS 'Prevent somethings from connecting to themselves';
