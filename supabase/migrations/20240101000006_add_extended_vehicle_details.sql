-- =====================================================
-- Add Extended Vehicle Details
-- =====================================================
-- This script adds comprehensive vehicle specifications,
-- optional equipment tracking, and purchase information

-- Add extended vehicle specification columns
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS drive_type TEXT,
ADD COLUMN IF NOT EXISTS tire_size TEXT,
ADD COLUMN IF NOT EXISTS trim TEXT,
ADD COLUMN IF NOT EXISTS body_type TEXT,
ADD COLUMN IF NOT EXISTS transmission TEXT,
ADD COLUMN IF NOT EXISTS fuel_type TEXT;

-- Add optional equipment (JSON array)
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS optional_equipment JSONB DEFAULT '[]'::jsonb;

-- Add purchase information columns
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS warranty_expiration DATE;

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_vehicles_drive_type ON vehicles(drive_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_body_type ON vehicles(body_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Extended vehicle details added successfully!';
  RAISE NOTICE 'New fields: drive_type, tire_size, trim, body_type, transmission, fuel_type';
  RAISE NOTICE 'Optional equipment tracking enabled (JSONB array)';
  RAISE NOTICE 'Purchase information fields: purchase_date, purchase_price, warranty_expiration';
END $$;
