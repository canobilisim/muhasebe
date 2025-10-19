# Turkcell Tables Migration (005)

This migration adds the necessary database tables and functions for the Turkcell Dashboard feature.

## Overview

The migration creates:
- `turkcell_transactions` table for storing daily transaction records
- `turkcell_targets` table for storing monthly target settings
- Helper functions for data retrieval and management
- Row Level Security (RLS) policies for multi-tenant support
- Indexes for optimal performance

## Tables Created

### turkcell_transactions
Stores daily Turkcell transaction records for tracking operator performance.

**Columns:**
- `id` (UUID, Primary Key)
- `branch_id` (UUID, Foreign Key to branches)
- `user_id` (UUID, Foreign Key to users)
- `transaction_date` (DATE, defaults to current date)
- `transaction_type` (VARCHAR(50), defaults to 'general')
- `count` (INTEGER, defaults to 1)
- `description` (TEXT, optional)
- `reference_number` (VARCHAR(100), optional)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### turkcell_targets
Stores monthly target settings for Turkcell operations per branch.

**Columns:**
- `id` (UUID, Primary Key)
- `branch_id` (UUID, Foreign Key to branches)
- `user_id` (UUID, Foreign Key to users)
- `target_month` (DATE, YYYY-MM-01 format)
- `target_count` (INTEGER, must be > 0)
- `description` (TEXT, optional)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**Constraints:**
- Unique constraint on (branch_id, target_month)
- Check constraint: target_count > 0

## Functions Created

### get_daily_turkcell_count(branch_uuid, target_date)
Returns the total count of Turkcell transactions for a specific branch and date.

**Parameters:**
- `branch_uuid` (UUID): Branch identifier
- `target_date` (DATE, optional): Target date (defaults to current date)

**Returns:** INTEGER

### get_monthly_turkcell_target(branch_uuid, target_month)
Returns the monthly target count for Turkcell operations.

**Parameters:**
- `branch_uuid` (UUID): Branch identifier
- `target_month` (DATE, optional): Target month (defaults to current month)

**Returns:** INTEGER

### get_monthly_turkcell_progress(branch_uuid, target_month)
Returns monthly progress statistics including total count, target, and percentage.

**Parameters:**
- `branch_uuid` (UUID): Branch identifier
- `target_month` (DATE, optional): Target month (defaults to current month)

**Returns:** TABLE with columns:
- `total_count` (INTEGER)
- `target_count` (INTEGER)
- `progress_percentage` (DECIMAL(5,2))

### set_monthly_turkcell_target(branch_uuid, target_count_param, target_month_param, user_uuid)
Sets or updates the monthly Turkcell target for a specific branch and month.

**Parameters:**
- `branch_uuid` (UUID): Branch identifier
- `target_count_param` (INTEGER): Target count (must be > 0)
- `target_month_param` (DATE, optional): Target month (defaults to current month)
- `user_uuid` (UUID, optional): User identifier (defaults to current user)

**Returns:** BOOLEAN

### create_sample_turkcell_data()
Creates sample Turkcell data for testing purposes.

**Returns:** TABLE with columns:
- `action` (TEXT)
- `details` (TEXT)
- `status` (TEXT)

## Security (RLS Policies)

Both tables have Row Level Security enabled with the following policies:

### turkcell_transactions
- **SELECT**: Users can view transactions in their branch
- **INSERT**: Users can insert transactions in their branch
- **UPDATE**: Users can update their own transactions; managers/admins can update any in their branch
- **DELETE**: Only managers and admins can delete transactions in their branch

### turkcell_targets
- **SELECT**: Users can view targets in their branch
- **INSERT**: Only managers and admins can insert targets in their branch
- **UPDATE**: Only managers and admins can update targets in their branch
- **DELETE**: Only managers and admins can delete targets in their branch

## Indexes

Performance indexes are created on:
- `branch_id` for both tables
- `user_id` for both tables
- `transaction_date` for transactions
- `transaction_type` for transactions
- `target_month` for targets
- Composite indexes for common query patterns

## How to Apply

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `005_turkcell_tables.sql`
4. Paste and execute the SQL

### Method 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Apply the migration
supabase db push
```

### Method 3: Direct Database Connection
Connect to your PostgreSQL database and execute the migration file.

## Verification

After applying the migration, run the verification script:

```bash
npx tsx scripts/test-turkcell-tables.ts
```

This script will:
1. Verify table structure
2. Test helper functions
3. Create sample data
4. Validate RLS policies

## Sample Usage

### Setting a Monthly Target
```sql
SELECT set_monthly_turkcell_target(
    'your-branch-id'::UUID,
    100,  -- Target: 100 transactions
    '2024-01-01'::DATE,
    'your-user-id'::UUID
);
```

### Getting Daily Count
```sql
SELECT get_daily_turkcell_count(
    'your-branch-id'::UUID,
    CURRENT_DATE
);
```

### Getting Monthly Progress
```sql
SELECT * FROM get_monthly_turkcell_progress(
    'your-branch-id'::UUID,
    CURRENT_DATE
);
```

### Inserting a Transaction
```sql
INSERT INTO turkcell_transactions (
    branch_id,
    user_id,
    transaction_type,
    count,
    description
) VALUES (
    'your-branch-id'::UUID,
    'your-user-id'::UUID,
    'general',
    5,
    'Daily Turkcell transactions'
);
```

## Rollback

If you need to rollback this migration, execute:

```sql
-- Drop functions
DROP FUNCTION IF EXISTS create_sample_turkcell_data();
DROP FUNCTION IF EXISTS set_monthly_turkcell_target(UUID, INTEGER, DATE, UUID);
DROP FUNCTION IF EXISTS get_monthly_turkcell_progress(UUID, DATE);
DROP FUNCTION IF EXISTS get_monthly_turkcell_target(UUID, DATE);
DROP FUNCTION IF EXISTS get_daily_turkcell_count(UUID, DATE);

-- Drop tables (this will also drop indexes and policies)
DROP TABLE IF EXISTS turkcell_targets;
DROP TABLE IF EXISTS turkcell_transactions;
```

## Next Steps

After successfully applying this migration:

1. Continue with Task 2: Create TypeScript types (`src/types/turkcell.ts`)
2. Implement the Turkcell service (`src/services/turkcellService.ts`)
3. Create the Zustand store (`src/stores/turkcellStore.ts`)
4. Build the UI components

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure you're using the service role key
2. **Function Already Exists**: Some functions might already exist; use `CREATE OR REPLACE FUNCTION`
3. **Table Already Exists**: Drop existing tables if you need to recreate them
4. **RLS Policies**: Ensure the helper functions `get_user_branch_id()` and `is_admin()` exist from previous migrations

### Getting Help

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your database connection
3. Ensure all previous migrations have been applied
4. Run the verification script to identify specific problems