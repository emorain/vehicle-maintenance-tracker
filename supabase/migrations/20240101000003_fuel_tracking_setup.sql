-- =====================================================
-- Fuel Tracking Setup
-- =====================================================
-- This script creates the fuel_records table with RLS policies
-- Run this in your Supabase SQL Editor

-- Create fuel_records table
CREATE TABLE IF NOT EXISTS fuel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Fill-up details
  fill_date DATE NOT NULL,
  odometer INTEGER NOT NULL,
  gallons NUMERIC(10, 3) NOT NULL,
  price_per_gallon NUMERIC(10, 3),
  total_cost NUMERIC(10, 2),

  -- Location & details
  station_name TEXT,
  location TEXT,
  fuel_grade TEXT,

  -- Trip details
  trip_type TEXT,
  partial_fill BOOLEAN DEFAULT false,

  -- Optional notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fuel_records_vehicle_id ON fuel_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_user_id ON fuel_records(user_id);
CREATE INDEX IF NOT EXISTS idx_fuel_records_fill_date ON fuel_records(fill_date DESC);

-- Enable Row Level Security
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own fuel records"
  ON fuel_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fuel records"
  ON fuel_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fuel records"
  ON fuel_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fuel records"
  ON fuel_records FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fuel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fuel_records_updated_at
  BEFORE UPDATE ON fuel_records
  FOR EACH ROW
  EXECUTE FUNCTION update_fuel_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fuel tracking setup completed successfully!';
  RAISE NOTICE 'You can now start tracking fuel records.';
END $$;
