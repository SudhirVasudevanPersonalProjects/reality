-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on captures table
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can insert their own captures
CREATE POLICY "Users can insert own captures"
  ON captures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can read their own captures
CREATE POLICY "Users can read own captures"
  ON captures FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own captures
CREATE POLICY "Users can update own captures"
  ON captures FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own captures
CREATE POLICY "Users can delete own captures"
  ON captures FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON POLICY "Users can read own profile" ON users IS 'Users can only view their own profile information';
COMMENT ON POLICY "Users can insert own captures" ON captures IS 'Users can only insert captures with their own user_id';
COMMENT ON POLICY "Users can read own captures" ON captures IS 'Users can only read their own captures';
COMMENT ON POLICY "Users can update own captures" ON captures IS 'Users can only update their own captures';
COMMENT ON POLICY "Users can delete own captures" ON captures IS 'Users can only delete their own captures';
