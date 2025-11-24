-- Migration: Add vehicle status field
-- Description: Adds a status field to track vehicle state (Active, Sold, Stored, etc.)

-- Add status column to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active'
CHECK (status IN ('Active', 'Inactive', 'Sold', 'Stored', 'In Repair'));

-- Update existing vehicles to have 'Active' status
UPDATE vehicles
SET status = 'Active'
WHERE status IS NULL;

-- Add comment to the column
COMMENT ON COLUMN vehicles.status IS 'Current status of the vehicle: Active, Inactive, Sold, Stored, or In Repair';
