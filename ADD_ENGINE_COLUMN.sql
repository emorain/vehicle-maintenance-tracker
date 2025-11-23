-- Add engine column to vehicles table

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS engine TEXT;

-- Add a comment to the column
COMMENT ON COLUMN vehicles.engine IS 'Engine specifications (e.g., 2.0L 4-Cylinder, V6, etc.)';
