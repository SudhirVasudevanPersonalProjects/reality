-- Add RLS policies for users table
-- Users are automatically created by auth trigger, so no INSERT policy needed
-- Users can update their own profile after authentication

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Add comment for documentation
COMMENT ON POLICY "Users can update own profile" ON users IS 'Users can only modify their own user profile data';
COMMENT ON TABLE users IS 'User profiles created automatically via auth.users trigger on phone authentication';
