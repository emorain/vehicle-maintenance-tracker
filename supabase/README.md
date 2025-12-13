# Supabase Migrations

This folder contains database migrations for the maintenance-tracker project.

## Structure

```
supabase/
├── config.toml           # Supabase configuration
├── migrations/           # Database migration files
│   ├── 20240101000001_add_engine_column.sql
│   ├── 20240101000002_parts_database_setup.sql
│   ├── 20240101000003_fuel_tracking_setup.sql
│   ├── 20240101000004_remove_5k_oil_change.sql
│   ├── 20240101000005_add_multiple_images.sql
│   ├── 20240101000006_add_extended_vehicle_details.sql
│   ├── 20240101000007_add_vehicle_status.sql
│   ├── 20240101000008_add_vehicle_type.sql
│   └── 20240101000009_add_maintenance_receipts.sql
└── README.md
```

## How to Run Migrations

Since you don't have Supabase CLI installed globally, you can run migrations in two ways:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Select your **maintenance-tracker** project
3. Navigate to **SQL Editor**
4. Copy the contents of each migration file (in order)
5. Paste and run each migration

**IMPORTANT**: Run migrations in order by their timestamp prefix (e.g., `20240101000001_` first, then `20240101000002_`, etc.)

### Option 2: Run All Migrations at Once

You can combine all migrations into a single file and run them together:

1. Concatenate all migration files in order
2. Run the combined SQL in Supabase SQL Editor

## Creating New Migrations

When you need to make database changes:

1. Create a new SQL file in `supabase/migrations/`
2. Name it with a timestamp and descriptive name:
   ```
   YYYYMMDDHHMMSS_description.sql
   ```
   Example: `20250101120000_add_new_feature.sql`

3. Write your SQL migration
4. Run it in Supabase Dashboard SQL Editor

## Migration Naming Convention

- Use timestamps in format: `YYYYMMDDHHMMSS`
- Use underscores to separate words
- Use lowercase for consistency
- Be descriptive but concise

Examples:
- ✅ `20250113000001_add_vehicle_notes.sql`
- ✅ `20250113000002_create_service_reminders.sql`
- ❌ `add-notes.sql`
- ❌ `migration1.sql`

## Configuration

The `config.toml` file contains Supabase project configuration including:
- Database ports
- API settings
- Authentication settings
- Storage settings

You typically don't need to modify this unless you're running Supabase locally.

## Notes

- Migrations are run manually via Supabase Dashboard
- Always test migrations in a development environment first
- Keep migrations small and focused on one change
- Never modify existing migration files after they've been run
- Create a new migration to fix issues instead of editing old ones
