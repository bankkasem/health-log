-- Migration: Add demographic fields to users table
-- Date: 2026-02-07
-- Description: Adds gender, date_of_birth, and height fields to users table for health calculations

-- ============================================================================
-- ADD NEW COLUMNS TO USERS TABLE
-- ============================================================================

-- Add gender column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

-- Add date_of_birth column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add height column (in centimeters)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS height NUMERIC(5,2) CHECK (height > 0 AND height <= 300);

-- Add created_at if not exists (for older schemas)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at if not exists (for older schemas)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Index for filtering by gender (if needed for analytics)
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender) WHERE gender IS NOT NULL;

-- ============================================================================
-- UPDATE TRIGGER (if not already exists)
-- ============================================================================

-- Ensure the update trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table (recreate if exists)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION FOR AGE CALCULATION
-- ============================================================================

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN users.gender IS 'User gender: male, female, or other - used for BMR calculations';
COMMENT ON COLUMN users.date_of_birth IS 'Date of birth for age calculation';
COMMENT ON COLUMN users.height IS 'Height in centimeters (cm)';

-- ============================================================================
-- VERIFICATION QUERY (Optional - run separately to verify)
-- ============================================================================

-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
--   AND column_name IN ('gender', 'date_of_birth', 'height')
-- ORDER BY ordinal_position;
