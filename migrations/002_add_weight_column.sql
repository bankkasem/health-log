-- Migration: Add weight column to weight_metrics table
-- Date: 2026-02-07
-- Description: Adds weight column for direct weight input instead of calculation

-- ============================================================================
-- ADD WEIGHT COLUMN TO WEIGHT_METRICS TABLE
-- ============================================================================

-- Add weight column (nullable first to allow migration)
ALTER TABLE weight_metrics 
ADD COLUMN IF NOT EXISTS weight NUMERIC(6,2) CHECK (weight >= 0);

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Calculate weight from existing muscle_mass and body_fat_percentage for old records
-- Formula: weight = muscle_mass / (1 - body_fat_percentage/100)
UPDATE weight_metrics 
SET weight = GREATEST(muscle_mass / (1 - body_fat_percentage/100), 0.1)
WHERE weight IS NULL;

-- Set a default value for any remaining NULL weights
UPDATE weight_metrics SET weight = 70 WHERE weight IS NULL;

-- ============================================================================
-- MAKE WEIGHT COLUMN NON-NULLABLE
-- ============================================================================

-- Add NOT NULL constraint
ALTER TABLE weight_metrics 
ALTER COLUMN weight SET NOT NULL;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN weight_metrics.weight IS 'Weight in kilograms (kg) - used for BMI calculations';

-- ============================================================================
-- VERIFICATION QUERY (Optional - run separately to verify)
-- ============================================================================

-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'weight_metrics' 
--   AND column_name = 'weight'
-- ORDER BY ordinal_position;

-- SELECT COUNT(*) as total_records, 
--        COUNT(weight) as records_with_weight,
--        COUNT(*) - COUNT(weight) as records_without_weight
-- FROM weight_metrics;
