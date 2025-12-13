-- =====================================================
-- Add Multiple Images Support to Vehicles
-- =====================================================
-- This script adds support for multiple images per vehicle
-- and migrates existing single image URLs to the new format

-- Add images column (JSONB array)
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url values to images array
UPDATE vehicles
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != ''
AND (images IS NULL OR images = '[]'::jsonb);

-- Optional: Keep image_url for backward compatibility or drop it
-- COMMENT: We're keeping image_url for now for backward compatibility
-- If you want to remove it later, uncomment the next line:
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS image_url;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Multiple images support added successfully!';
  RAISE NOTICE 'Existing image_url values have been migrated to images array.';
  RAISE NOTICE 'Vehicles can now have multiple photos.';
END $$;
