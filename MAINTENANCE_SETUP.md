# Maintenance Tracking Setup Guide

## Database Schema

We'll create a `maintenance_records` table to track all maintenance activities for each vehicle.

---

## Step 1: Create the Maintenance Records Table

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Paste and run this SQL:

```sql
-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  service_date DATE NOT NULL,
  mileage INTEGER,
  cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_service_date ON maintenance_records(service_date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_updated_at
  BEFORE UPDATE ON maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_updated_at();
```

---

## Step 2: Enable Row Level Security

```sql
-- Enable RLS on maintenance_records
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own maintenance records
CREATE POLICY "Users can view their own maintenance records"
ON maintenance_records
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own maintenance records
CREATE POLICY "Users can insert their own maintenance records"
ON maintenance_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own maintenance records
CREATE POLICY "Users can update their own maintenance records"
ON maintenance_records
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own maintenance records
CREATE POLICY "Users can delete their own maintenance records"
ON maintenance_records
FOR DELETE
USING (auth.uid() = user_id);
```

---

## Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vehicle_id` | UUID | Foreign key to vehicles table |
| `user_id` | UUID | Owner of the record |
| `service_type` | TEXT | Type of service (Oil Change, Tire Rotation, etc.) |
| `description` | TEXT | Brief description of work done |
| `service_date` | DATE | When service was performed |
| `mileage` | INTEGER | Vehicle mileage at time of service (optional) |
| `cost` | DECIMAL | Cost of service (optional) |
| `notes` | TEXT | Additional notes (optional) |
| `created_at` | TIMESTAMP | Auto-generated creation time |
| `updated_at` | TIMESTAMP | Auto-updated modification time |

---

## Common Service Types

Pre-defined categories users can select:
- Oil Change
- Tire Rotation
- Brake Service
- Air Filter Replacement
- Battery Replacement
- Coolant Flush
- Transmission Service
- Inspection
- Repair
- Other

---

## Verify Setup

After running the SQL, verify the table was created:

```sql
-- Check table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'maintenance_records';

-- Check RLS policies
SELECT *
FROM pg_policies
WHERE tablename = 'maintenance_records';

-- Should show 4 policies (SELECT, INSERT, UPDATE, DELETE)
```

---

## Features This Enables

✅ **Track All Maintenance**
- Service history per vehicle
- Cost tracking
- Date and mileage tracking

✅ **Organize Records**
- Categorize by service type
- Sort by date
- Filter by vehicle

✅ **Analytics** (Future)
- Total maintenance costs per vehicle
- Average cost per service type
- Maintenance frequency
- Cost trends over time

✅ **Reminders** (Future)
- Based on date (e.g., every 6 months)
- Based on mileage (e.g., every 5,000 miles)
- Custom intervals per service type

---

## Security

Same RLS approach as vehicles:
- ✅ Users can only see their own records
- ✅ Records linked to vehicle via foreign key
- ✅ Cascading delete (if vehicle deleted, records deleted too)
- ✅ User ID automatically set on insert
