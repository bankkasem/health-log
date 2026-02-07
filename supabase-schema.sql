-- Health Log Database Schema
-- Supabase PostgreSQL Setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  height NUMERIC(5,2) CHECK (height > 0 AND height <= 300), -- in centimeters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- WEIGHT METRICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS weight_metrics (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  body_fat_percentage NUMERIC(5,2) NOT NULL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass NUMERIC(6,2) NOT NULL CHECK (muscle_mass >= 0),
  visceral_fat NUMERIC(5,2) NOT NULL CHECK (visceral_fat >= 0),
  bmr NUMERIC(6,2) NOT NULL CHECK (bmr >= 0),
  bmi NUMERIC(5,2) NOT NULL CHECK (bmi >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_weight_metrics_user_id ON weight_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_metrics_timestamp ON weight_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weight_metrics_user_timestamp ON weight_metrics(user_id, timestamp DESC);

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to weight_metrics table
DROP TRIGGER IF EXISTS update_weight_metrics_updated_at ON weight_metrics;
CREATE TRIGGER update_weight_metrics_updated_at
  BEFORE UPDATE ON weight_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid()::TEXT = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::TEXT = id);

-- Users can insert their own data (signup)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = id);

-- Enable RLS on weight_metrics table
ALTER TABLE weight_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read their own weight metrics
CREATE POLICY "Users can read own weight metrics"
  ON weight_metrics
  FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Users can insert their own weight metrics
CREATE POLICY "Users can insert own weight metrics"
  ON weight_metrics
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

-- Users can update their own weight metrics
CREATE POLICY "Users can update own weight metrics"
  ON weight_metrics
  FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

-- Users can delete their own weight metrics
CREATE POLICY "Users can delete own weight metrics"
  ON weight_metrics
  FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- ============================================================================
-- HELPER FUNCTIONS (Optional)
-- ============================================================================

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'User profile information including demographic data for health calculations';
COMMENT ON COLUMN users.gender IS 'User gender: male, female, or other - used for BMR calculations';
COMMENT ON COLUMN users.date_of_birth IS 'Date of birth for age calculation';
COMMENT ON COLUMN users.height IS 'Height in centimeters (cm)';

COMMENT ON TABLE weight_metrics IS 'Time-series health metrics tracked by users';
COMMENT ON COLUMN weight_metrics.body_fat_percentage IS 'Body fat percentage (0-100)';
COMMENT ON COLUMN weight_metrics.muscle_mass IS 'Muscle mass in kg';
COMMENT ON COLUMN weight_metrics.visceral_fat IS 'Visceral fat level';
COMMENT ON COLUMN weight_metrics.bmr IS 'Basal Metabolic Rate in kcal/day';
COMMENT ON COLUMN weight_metrics.bmi IS 'Body Mass Index';
