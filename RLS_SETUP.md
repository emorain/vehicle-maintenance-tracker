# Row Level Security (RLS) Setup Guide

## What is RLS?

**Row Level Security** is Supabase's way of protecting your data. It ensures:
- Users can only see their own vehicles
- Users can't access or modify other users' data
- Data is secure by default

## The Error You're Seeing

When you try to add a vehicle, you get an error like:
```
new row violates row-level security policy for table "vehicles"
```

This means RLS is enabled but there are no policies allowing you to insert data.

---

## Fix: Setup RLS Policies

### Step 1: Run This SQL

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste this SQL:

```sql
-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own vehicles
CREATE POLICY "Users can view their own vehicles"
ON vehicles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own vehicles
CREATE POLICY "Users can insert their own vehicles"
ON vehicles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own vehicles
CREATE POLICY "Users can update their own vehicles"
ON vehicles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own vehicles
CREATE POLICY "Users can delete their own vehicles"
ON vehicles
FOR DELETE
USING (auth.uid() = user_id);
```

5. Click **Run** (or Ctrl+Enter)

### Step 2: Verify Policies Were Created

In the SQL Editor, run:
```sql
SELECT * FROM pg_policies WHERE tablename = 'vehicles';
```

You should see 4 policies listed.

---

## How It Works

### Policy Breakdown

Each policy has:
1. **Operation** (SELECT, INSERT, UPDATE, DELETE)
2. **Condition** (`auth.uid() = user_id`)

#### auth.uid()
- Returns the ID of the currently logged-in user
- Comes from the authentication token

#### user_id column
- The column in your vehicles table that stores who owns each vehicle
- Set automatically by VehicleService when creating vehicles

### Example Flow

**When you create a vehicle:**
1. You're logged in as user with ID `abc-123`
2. VehicleService automatically adds `user_id: "abc-123"` to the vehicle data
3. Supabase checks: "Does `auth.uid()` (abc-123) = `user_id` (abc-123)?" ✅
4. Insert allowed!

**When you try to view all vehicles:**
1. Supabase runs: `SELECT * FROM vehicles WHERE user_id = 'abc-123'`
2. You only see vehicles where `user_id` matches your account
3. Other users' vehicles are invisible to you

---

## Code Changes Made

I updated `VehicleService.ts` to automatically set `user_id`:

### Before:
```typescript
async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([vehicle])  // ❌ Missing user_id!
    .select()
    .maybeSingle();
}
```

### After:
```typescript
async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Add user_id automatically
  const vehicleWithUser = {
    ...vehicle,
    user_id: user.id,  // ✅ Auto-set!
  };

  const { data, error } = await supabase
    .from('vehicles')
    .insert([vehicleWithUser])
    .select()
    .maybeSingle();
}
```

---

## Testing RLS

### Test 1: Create a Vehicle
1. Log in to your app
2. Add a vehicle
3. Should work without errors! ✅

### Test 2: View Vehicles
1. Go to Dashboard or Inventory
2. Should see only your vehicles ✅

### Test 3: Multi-User Test
1. Create Account A, add 2 vehicles
2. Log out, create Account B, add 3 vehicles
3. Log back into Account A
4. Should only see 2 vehicles (your own) ✅

---

## Troubleshooting

### Still getting RLS error?
**Check:**
1. Did you run the SQL in Supabase?
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'vehicles';`
3. Is `user_id` column in your vehicles table?
4. Are you logged in when trying to add a vehicle?

### "User not authenticated" error
**Cause:** You're not logged in
**Solution:** Log in first, then try adding a vehicle

### Can't see any vehicles
**Possible causes:**
1. No vehicles created yet
2. Vehicles were created before RLS setup (user_id might be null)

**Fix old vehicles:**
```sql
-- Check for vehicles with null user_id
SELECT id, make, model, user_id FROM vehicles WHERE user_id IS NULL;

-- If you want to assign them to your account:
-- First, get your user ID
SELECT auth.uid();

-- Then update those vehicles (replace 'YOUR_USER_ID' with your actual ID)
UPDATE vehicles
SET user_id = 'YOUR_USER_ID'
WHERE user_id IS NULL;
```

---

## Production Considerations

### Security Best Practices

1. **Never disable RLS** - Always keep it enabled in production
2. **Test policies thoroughly** - Make sure users can't access others' data
3. **Use specific policies** - Don't use overly permissive policies like `USING (true)`

### Advanced Policies

If you want to add features like:
- **Admins can see all vehicles:**
```sql
CREATE POLICY "Admins can view all vehicles"
ON vehicles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

- **Share vehicles with other users:**
```sql
-- Add a vehicle_shares table first, then:
CREATE POLICY "Users can view shared vehicles"
ON vehicles
FOR SELECT
USING (
  auth.uid() = user_id OR
  id IN (
    SELECT vehicle_id FROM vehicle_shares
    WHERE shared_with_user_id = auth.uid()
  )
);
```

---

## Summary

✅ **What we did:**
1. Enabled RLS on vehicles table
2. Created 4 policies (SELECT, INSERT, UPDATE, DELETE)
3. Updated VehicleService to auto-set user_id
4. Now users can only access their own vehicles

✅ **What you need to do:**
1. Run the SQL in Supabase SQL Editor
2. Test adding a vehicle
3. Celebrate! 🎉

---

## Need More Help?

Check Supabase docs on RLS: https://supabase.com/docs/guides/auth/row-level-security
