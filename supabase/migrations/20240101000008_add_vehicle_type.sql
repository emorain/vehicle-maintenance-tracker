-- Migration: Add vehicle type fields
-- Description: Adds vehicle_type and custom_type fields to support different equipment types (Cars, Trucks, ATVs, Tractors, etc.)

-- Add vehicle_type column to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS vehicle_type TEXT
CHECK (vehicle_type IN ('Car', 'Truck', 'SUV', 'Van', 'Motorcycle', 'ATV', 'UTV', 'Trailer', 'Tractor', 'Other'));

-- Add custom_type column for when "Other" is selected
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS custom_type TEXT;

-- Add comments to the columns
COMMENT ON COLUMN vehicles.vehicle_type IS 'Type of vehicle or equipment: Car, Truck, SUV, Van, Motorcycle, ATV, UTV, Trailer, Tractor, or Other';
COMMENT ON COLUMN vehicles.custom_type IS 'Custom vehicle type name when vehicle_type is "Other"';
