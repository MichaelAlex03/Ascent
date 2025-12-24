-- =============================================
-- Climbing App Database Schema
-- =============================================

-- 1. USERS TABLE
-- =============================================
-- Note: If this table already exists from your webhook, you can skip this
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 2. CLIMBS TABLE
-- =============================================
CREATE TABLE climbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL,

  -- Climb details
  climb_type TEXT NOT NULL CHECK (climb_type IN ('boulder', 'route')),
  grade TEXT NOT NULL,
  wall_type TEXT CHECK (wall_type IN ('slab', 'vertical', 'overhang')),
  attempts INTEGER DEFAULT 1 CHECK (attempts >= 1),
  notes TEXT,

  -- Session metadata
  session_date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Foreign key
  CONSTRAINT fk_user FOREIGN KEY (clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE
);

CREATE INDEX idx_climbs_clerk_id ON climbs(clerk_id);
CREATE INDEX idx_climbs_session_date ON climbs(session_date);
CREATE INDEX idx_climbs_type_grade ON climbs(climb_type, grade);

-- 3. SESSIONS TABLE (Optional - for grouping climbs)
-- =============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL,

  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  duration_minutes INTEGER,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_clerk_id ON sessions(clerk_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);

-- 4. ROW LEVEL SECURITY SETUP
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE climbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can insert own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can update own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can delete own climbs" ON climbs;
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

-- Users table policies
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (clerk_id = auth.jwt()->>'clerk_id');

-- Climbs table policies
CREATE POLICY "Users can view own climbs"
ON climbs FOR SELECT
USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can insert own climbs"
ON climbs FOR INSERT
WITH CHECK (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can update own climbs"
ON climbs FOR UPDATE
USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can delete own climbs"
ON climbs FOR DELETE
USING (clerk_id = auth.jwt()->>'clerk_id');

-- Sessions table policies
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can insert own sessions"
ON sessions FOR INSERT
WITH CHECK (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can update own sessions"
ON sessions FOR UPDATE
USING (clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can delete own sessions"
ON sessions FOR DELETE
USING (clerk_id = auth.jwt()->>'clerk_id');

-- 5. HELPER FUNCTIONS & TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_climbs_updated_at ON climbs;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_climbs_updated_at
BEFORE UPDATE ON climbs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. USER PROFILE FIELDS (for search functionality)
-- =============================================

-- Add user profile fields for search
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username_search ON users USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_fullname_search ON users USING gin(full_name gin_trgm_ops);

-- Update RLS policies for users table to allow public search
DROP POLICY IF EXISTS "Anyone can search user profiles" ON users;
CREATE POLICY "Anyone can search user profiles"
ON users FOR SELECT
USING (true); -- Public read for search (usernames/avatars only)

-- 7. USER RELATIONSHIPS TABLE (follows/friends)
-- =============================================

CREATE TABLE IF NOT EXISTS user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_clerk_id TEXT NOT NULL,
  following_clerk_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_follower FOREIGN KEY (follower_clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE,
  CONSTRAINT fk_following FOREIGN KEY (following_clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE,
  CONSTRAINT unique_relationship UNIQUE (follower_clerk_id, following_clerk_id),
  CONSTRAINT no_self_follow CHECK (follower_clerk_id != following_clerk_id)
);

CREATE INDEX IF NOT EXISTS idx_relationships_follower ON user_relationships(follower_clerk_id);
CREATE INDEX IF NOT EXISTS idx_relationships_following ON user_relationships(following_clerk_id);

-- RLS policies for relationships
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all relationships" ON user_relationships;
DROP POLICY IF EXISTS "Users can create own relationships" ON user_relationships;
DROP POLICY IF EXISTS "Users can delete own relationships" ON user_relationships;

CREATE POLICY "Users can view all relationships"
ON user_relationships FOR SELECT
USING (true);

CREATE POLICY "Users can create own relationships"
ON user_relationships FOR INSERT
WITH CHECK (follower_clerk_id = auth.jwt()->>'clerk_id');

CREATE POLICY "Users can delete own relationships"
ON user_relationships FOR DELETE
USING (follower_clerk_id = auth.jwt()->>'clerk_id');

-- 8. USEFUL VIEWS
-- =============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS climb_stats;

-- View for climb statistics per user
CREATE VIEW climb_stats AS
SELECT
  clerk_id,
  climb_type,
  grade,
  COUNT(*) as total_sends,
  ROUND(AVG(attempts)::numeric, 2) as avg_attempts,
  MIN(session_date) as first_send,
  MAX(session_date) as last_send
FROM climbs
GROUP BY clerk_id, climb_type, grade;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
--
-- To apply this migration:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
--
-- To set up Clerk JWT integration:
-- 1. Go to Clerk Dashboard > JWT Templates
-- 2. Create template named "supabase"
-- 3. Add claims: {"clerk_id": "{{user.id}}"}
-- 4. In Supabase Dashboard > Authentication > Providers
-- 5. Enable JWT provider and paste Clerk's JWKS URL
--