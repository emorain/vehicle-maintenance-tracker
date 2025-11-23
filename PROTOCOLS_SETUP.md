# Maintenance Protocols Setup Guide

This guide will help you set up the maintenance protocols and reminders system in your Supabase database.

## Database Tables

We need to create two new tables:
1. **maintenance_protocols** - Stores protocol definitions (both user-created and default)
2. **vehicle_protocols** - Links protocols to vehicles and tracks when they were last performed

## Step 1: Create Tables

Go to your Supabase project → SQL Editor → New Query, and run this SQL:

```sql
-- Create maintenance_protocols table
CREATE TABLE IF NOT EXISTS maintenance_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  interval_months INTEGER,
  interval_miles INTEGER,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicle_protocols table (junction table)
CREATE TABLE IF NOT EXISTS vehicle_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  protocol_id UUID REFERENCES maintenance_protocols(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_service_date DATE,
  last_service_mileage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vehicle_id, protocol_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_protocols_user_id ON maintenance_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_protocols_is_default ON maintenance_protocols(is_default);
CREATE INDEX IF NOT EXISTS idx_vehicle_protocols_vehicle_id ON vehicle_protocols(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_protocols_protocol_id ON vehicle_protocols(protocol_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_protocols_user_id ON vehicle_protocols(user_id);
```

## Step 2: Set Up RLS Policies

Enable Row Level Security and create policies:

```sql
-- Enable RLS on both tables
ALTER TABLE maintenance_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_protocols ENABLE ROW LEVEL SECURITY;

-- Policies for maintenance_protocols
-- Users can view their own protocols and all default protocols
CREATE POLICY "Users can view own and default protocols" ON maintenance_protocols
  FOR SELECT
  USING (
    is_default = true OR
    auth.uid() = user_id
  );

-- Users can insert their own protocols
CREATE POLICY "Users can insert own protocols" ON maintenance_protocols
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own protocols (not defaults)
CREATE POLICY "Users can update own protocols" ON maintenance_protocols
  FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

-- Users can delete their own protocols (not defaults)
CREATE POLICY "Users can delete own protocols" ON maintenance_protocols
  FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- Policies for vehicle_protocols
CREATE POLICY "Users can view own vehicle protocols" ON vehicle_protocols
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicle protocols" ON vehicle_protocols
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicle protocols" ON vehicle_protocols
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicle protocols" ON vehicle_protocols
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 3: Insert Default Protocols

Insert the default maintenance protocols:

```sql
-- Insert default maintenance protocols
INSERT INTO maintenance_protocols (user_id, name, service_type, interval_months, interval_miles, description, is_default)
VALUES
  (NULL, 'Oil Change - 3k/3mo', 'Oil Change', 3, 3000, 'Standard oil change every 3 months or 3,000 miles', true),
  (NULL, 'Oil Change - 5k/5mo', 'Oil Change', 5, 5000, 'Extended oil change every 5 months or 5,000 miles', true),
  (NULL, 'Tire Rotation - 6k/6mo', 'Tire Rotation', 6, 6000, 'Rotate tires every 6 months or 6,000 miles', true),
  (NULL, 'Air Filter - 12k/12mo', 'Air Filter Replacement', 12, 12000, 'Replace air filter annually or every 12,000 miles', true),
  (NULL, 'Brake Inspection - 12k/12mo', 'Brake Service', 12, 12000, 'Inspect brakes annually or every 12,000 miles', true);
```

## How It Works

### Protocols
- **user_id = NULL**: Default protocols visible to all users
- **user_id = [user's id]**: Custom user-created protocols
- **interval_months**: Time-based interval (e.g., every 3 months)
- **interval_miles**: Mileage-based interval (e.g., every 3,000 miles)
- Both intervals can be set, and the reminder will trigger based on whichever comes first

### Vehicle Protocols
- Links a protocol to a specific vehicle
- Tracks when the service was last performed (`last_service_date`, `last_service_mileage`)
- Used to calculate when the next service is due

### Reminder Calculation
The system will calculate reminders by:
1. Getting all protocols assigned to a vehicle
2. For each protocol, checking:
   - If time-based: `last_service_date + interval_months < today`
   - If mileage-based: `last_service_mileage + interval_miles < current_mileage`
3. Showing upcoming or overdue services on the Dashboard

## Next Steps

After running these SQL statements:
1. The frontend will allow users to browse and assign default protocols
2. Users can create custom protocols with their own intervals
3. The Dashboard will display upcoming maintenance based on assigned protocols
4. When maintenance is performed, the last service date/mileage is updated
