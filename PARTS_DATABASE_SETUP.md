# Parts Database Setup Guide

This guide sets up the community-driven parts database system.

## Features

- **Community parts database** - Users share part numbers
- **Smart suggestions** - Based on make/model/year/service type
- **Toggle view** - See community parts or your parts only
- **Auto-verification** - Parts become verified after 10 uses
- **Flag system** - Users can report incorrect parts
- **Hybrid UI** - Quick checkboxes for common parts + flexible custom additions

## Step 1: Create Vehicle Parts Table

Run this SQL in Supabase → SQL Editor:

```sql
-- Create vehicle_parts table
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
```

## Step 2: Update Maintenance Records Table

Add parts_used field to maintenance_records:

```sql
-- Add parts_used column to maintenance_records
ALTER TABLE maintenance_records
ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]'::jsonb;

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_maintenance_records_parts_used
  ON maintenance_records USING GIN (parts_used);

-- Add comment
COMMENT ON COLUMN maintenance_records.parts_used IS 'Array of parts used: [{type, number, brand}, ...]';
```

## Step 3: Set Up RLS Policies

Enable Row Level Security and create policies:

```sql
-- Enable RLS
ALTER TABLE vehicle_parts ENABLE ROW LEVEL SECURITY;

-- Users can view all parts (community + their own)
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

-- Allow incrementing times_used for any part (when someone uses it)
CREATE POLICY "Users can increment part usage" ON vehicle_parts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

## Step 4: Insert Sample Parts (Optional)

Add some starter parts for common vehicles:

```sql
-- Sample parts for common vehicles
INSERT INTO vehicle_parts (make, model, year_start, year_end, service_type, part_type, part_number, brand, user_id, times_used, verified)
VALUES
  -- Honda Accord Oil Change
  ('Honda', 'Accord', 2018, 2023, 'Oil Change', 'Oil Filter', '15400-PLM-A02', 'Honda OEM', (SELECT id FROM auth.users LIMIT 1), 15, true),
  ('Honda', 'Accord', 2018, 2023, 'Oil Change', 'Motor Oil', '0W-20', 'Honda Genuine', (SELECT id FROM auth.users LIMIT 1), 15, true),

  -- Toyota Camry Oil Change
  ('Toyota', 'Camry', 2018, 2023, 'Oil Change', 'Oil Filter', '04152-YZZA6', 'Toyota OEM', (SELECT id FROM auth.users LIMIT 1), 12, true),
  ('Toyota', 'Camry', 2018, 2023, 'Oil Change', 'Motor Oil', '0W-20', 'Toyota Genuine', (SELECT id FROM auth.users LIMIT 1), 12, true),

  -- Ford F-150 Oil Change
  ('Ford', 'F-150', 2018, 2023, 'Oil Change', 'Oil Filter', 'FL-820S', 'Motorcraft', (SELECT id FROM auth.users LIMIT 1), 20, true),
  ('Ford', 'F-150', 2018, 2023, 'Oil Change', 'Motor Oil', '5W-20', 'Motorcraft', (SELECT id FROM auth.users LIMIT 1), 20, true)
ON CONFLICT DO NOTHING;
```

## How It Works

### Community Parts
- All users can see all parts
- Parts are sorted by popularity (`times_used`)
- Verified parts (10+ uses) show ✅ badge
- New parts show 🆕 badge

### My Parts Only
- Filter to show only parts YOU have added
- Helps you track your preferred brands/suppliers
- Quick access to your go-to parts

### Auto-Verification
- New parts start unverified
- After 10 uses across all users → automatically verified ✅
- Verified parts show higher in suggestions

### Flagging System
- Users can flag incorrect parts
- After 3 flags → part gets hidden from suggestions
- Admin can review and restore/delete

## Next Steps

After running this SQL:
1. The frontend will allow users to see suggested parts
2. Users can add their own part numbers
3. System learns and improves over time
4. Popular parts rise to the top
