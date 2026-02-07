-- Migration: Make visceral_fat nullable in weight_metrics table
-- Date: 2026-02-07
-- Description: Changes visceral_fat to nullable since it requires special equipment to measure

-- ============================================================================
-- ALTER VISCERAL_FAT COLUMN TO NULLABLE
-- ============================================================================

-- Drop the NOT NULL constraint
ALTER TABLE weight_metrics 
ALTER COLUMN visceral_fat DROP NOT NULL;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN weight_metrics.visceral_fat IS 'Visceral fat level (optional - requires body composition analyzer)';

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
--   AND column_name = 'visceral_fat'
-- ORDER BY ordinal_position;
