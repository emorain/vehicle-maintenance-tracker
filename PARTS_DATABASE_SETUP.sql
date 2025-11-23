-- ============================================
-- PARTS DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Create vehicle_parts table
CREATE TABLE IF NOT EXISTS vehicle_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  part_type TEXT NOT NULL,
  part_number TEXT NOT NULL,
  brand TEXT,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  times_used INTEGER DEFAULT 1,
  verified BOOLEAN DEFAULT false,
  flagged_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_parts_lookup
  ON vehicle_parts(make, model, service_type, year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_vehicle_parts_user_id ON vehicle_parts(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_parts_times_used ON vehicle_parts(times_used DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_parts_verified ON vehicle_parts(verified);

-- Add constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_parts_unique
  ON vehicle_parts(make, model, year_start, year_end, service_type, part_type, part_number, brand, user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_parts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_parts_updated_at
  BEFORE UPDATE ON vehicle_parts
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_parts_updated_at();

-- Auto-verify parts after 10 uses
CREATE OR REPLACE FUNCTION auto_verify_parts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.times_used >= 10 AND NEW.verified = false THEN
    NEW.verified = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_parts_auto_verify
  BEFORE UPDATE ON vehicle_parts
  FOR EACH ROW
  EXECUTE FUNCTION auto_verify_parts();

-- Step 2: Update maintenance_records table
ALTER TABLE maintenance_records
ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_maintenance_records_parts_used
  ON maintenance_records USING GIN (parts_used);

COMMENT ON COLUMN maintenance_records.parts_used IS 'Array of parts used: [{type, number, brand}, ...]';

-- Step 3: Enable RLS and create policies
ALTER TABLE vehicle_parts ENABLE ROW LEVEL SECURITY;

-- Users can view all parts
CREATE POLICY "Users can view all vehicle parts" ON vehicle_parts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can insert their own parts
CREATE POLICY "Users can insert own vehicle parts" ON vehicle_parts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own parts
CREATE POLICY "Users can update own vehicle parts" ON vehicle_parts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own parts
CREATE POLICY "Users can delete own vehicle parts" ON vehicle_parts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow incrementing times_used for any part
CREATE POLICY "Users can increment part usage" ON vehicle_parts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Step 4: Insert sample parts (optional but recommended)
INSERT INTO vehicle_parts (make, model, year_start, year_end, service_type, part_type, part_number, brand, user_id, times_used, verified)
SELECT
  make, model, year_start, year_end, service_type, part_type, part_number, brand,
  (SELECT id FROM auth.users LIMIT 1) as user_id,
  times_used, verified
FROM (VALUES
  -- Honda Accord Oil Change
  ('Honda', 'Accord', 2018, 2023, 'Oil Change', 'Oil Filter', '15400-PLM-A02', 'Honda OEM', 15, true),
  ('Honda', 'Accord', 2018, 2023, 'Oil Change', 'Motor Oil', '0W-20', 'Honda Genuine', 15, true),
  -- Toyota Camry Oil Change
  ('Toyota', 'Camry', 2018, 2023, 'Oil Change', 'Oil Filter', '04152-YZZA6', 'Toyota OEM', 12, true),
  ('Toyota', 'Camry', 2018, 2023, 'Oil Change', 'Motor Oil', '0W-20', 'Toyota Genuine', 12, true),
  -- Ford F-150 Oil Change
  ('Ford', 'F-150', 2018, 2023, 'Oil Change', 'Oil Filter', 'FL-820S', 'Motorcraft', 20, true),
  ('Ford', 'F-150', 2018, 2023, 'Oil Change', 'Motor Oil', '5W-20', 'Motorcraft', 20, true)
) AS parts(make, model, year_start, year_end, service_type, part_type, part_number, brand, times_used, verified)
ON CONFLICT DO NOTHING;
