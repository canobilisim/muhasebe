-- Authentication Fixes Migration
-- Fixes for auth.users and users table synchronization

-- ============================================================================
-- PART 1: Auth.users to users synchronization trigger
-- ============================================================================

-- Function to automatically create users record when auth.users record is created
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    default_branch_id UUID;
BEGIN
    -- Get the first available branch (or create a default one if none exists)
    SELECT id INTO default_branch_id
    FROM branches
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- If no branch exists, we cannot create the user record
    -- This should be handled by ensuring at least one branch exists
    IF default_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch available. Please create a branch first.';
    END IF;
    
    -- Insert into users table
    -- Note: This uses default values for role (cashier) and is_active (true)
    -- These can be updated later by an admin
    INSERT INTO users (
        id,
        branch_id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        default_branch_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- Use metadata or email as fallback
        'cashier', -- Default role
        true, -- Default active status
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
-- This trigger fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_auth_user();

-- ============================================================================
-- PART 2: Fix existing mismatched users
-- ============================================================================

-- Function to fix users that exist in auth.users but not in users table
CREATE OR REPLACE FUNCTION fix_missing_user_profiles()
RETURNS TABLE (
    fixed_user_id UUID,
    email TEXT,
    status TEXT
) AS $$
DECLARE
    default_branch_id UUID;
    auth_user RECORD;
    fix_count INTEGER := 0;
BEGIN
    -- Get the first available branch
    SELECT id INTO default_branch_id
    FROM branches
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF default_branch_id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, 'ERROR'::TEXT, 'No branch available'::TEXT;
        RETURN;
    END IF;
    
    -- Find all auth.users that don't have a corresponding users record
    FOR auth_user IN
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN users u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
        BEGIN
            -- Create the missing users record
            INSERT INTO users (
                id,
                branch_id,
                email,
                full_name,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                auth_user.id,
                default_branch_id,
                auth_user.email,
                COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.email),
                'cashier',
                true,
                NOW(),
                NOW()
            );
            
            fix_count := fix_count + 1;
            
            RETURN QUERY SELECT 
                auth_user.id,
                auth_user.email,
                'FIXED: Created missing user profile'::TEXT;
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                auth_user.id,
                auth_user.email,
                ('ERROR: ' || SQLERRM)::TEXT;
        END;
    END LOOP;
    
    -- Return summary if no users were processed
    IF fix_count = 0 THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            'INFO'::TEXT,
            'No missing user profiles found'::TEXT;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 3: Diagnostic queries for user data issues
-- ============================================================================

-- Function to report users with potential issues
CREATE OR REPLACE FUNCTION diagnose_user_issues()
RETURNS TABLE (
    issue_type TEXT,
    user_id UUID,
    email TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check for users without branch assignment
    RETURN QUERY
    SELECT 
        'NO_BRANCH'::TEXT,
        u.id,
        u.email,
        'User has NULL branch_id'::TEXT
    FROM users u
    WHERE u.branch_id IS NULL;
    
    -- Check for inactive users
    RETURN QUERY
    SELECT 
        'INACTIVE'::TEXT,
        u.id,
        u.email,
        'User is marked as inactive (is_active = false)'::TEXT
    FROM users u
    WHERE u.is_active = false;
    
    -- Check for users with invalid branch references
    RETURN QUERY
    SELECT 
        'INVALID_BRANCH'::TEXT,
        u.id,
        u.email,
        'User references non-existent branch: ' || u.branch_id::TEXT
    FROM users u
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE u.branch_id IS NOT NULL AND b.id IS NULL;
    
    -- Check for auth.users without users profile
    RETURN QUERY
    SELECT 
        'MISSING_PROFILE'::TEXT,
        au.id,
        au.email,
        'Auth user exists but no users profile found'::TEXT
    FROM auth.users au
    LEFT JOIN users u ON au.id = u.id
    WHERE u.id IS NULL;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION handle_new_auth_user() IS 
'Automatically creates a users table record when a new auth.users record is created. Assigns user to the first available branch with default role of cashier.';

COMMENT ON FUNCTION fix_missing_user_profiles() IS 
'Fixes existing auth.users records that do not have corresponding users table records. Run this after applying the migration to fix historical data.';

COMMENT ON FUNCTION diagnose_user_issues() IS 
'Diagnostic function to identify users with potential issues: missing branch, inactive status, invalid branch reference, or missing profile.';


-- ============================================================================
-- PART 4: Test user creation function
-- ============================================================================

-- Function to create test users with proper auth.users and users records
-- This function uses Supabase's admin API approach via SQL
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS TABLE (
    user_email TEXT,
    user_role TEXT,
    status TEXT
) AS $$
DECLARE
    default_branch_id UUID;
    admin_user_id UUID;
    manager_user_id UUID;
    cashier_user_id UUID;
BEGIN
    -- Get or create default branch
    SELECT id INTO default_branch_id
    FROM branches
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- If no branch exists, create a default one
    IF default_branch_id IS NULL THEN
        INSERT INTO branches (name, address, phone)
        VALUES ('Ana Şube', 'Test Adresi', '0555 555 5555')
        RETURNING id INTO default_branch_id;
        
        RETURN QUERY SELECT 
            'SYSTEM'::TEXT,
            'SETUP'::TEXT,
            'Created default branch: Ana Şube'::TEXT;
    END IF;
    
    -- Note: Creating auth.users records directly requires service role access
    -- This function creates the users table records
    -- The actual auth.users creation should be done via Supabase Dashboard or API
    
    -- Generate UUIDs for test users (these should match the auth.users IDs)
    admin_user_id := gen_random_uuid();
    manager_user_id := gen_random_uuid();
    cashier_user_id := gen_random_uuid();
    
    -- Create admin user profile (auth.users must be created separately)
    BEGIN
        INSERT INTO users (
            id,
            branch_id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            default_branch_id,
            'admin@demo.com',
            'Admin User',
            'admin',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'admin',
            is_active = true,
            branch_id = default_branch_id,
            updated_at = NOW();
        
        RETURN QUERY SELECT 
            'admin@demo.com'::TEXT,
            'admin'::TEXT,
            'User profile ready (auth.users must be created via Supabase)'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'admin@demo.com'::TEXT,
            'admin'::TEXT,
            ('ERROR: ' || SQLERRM)::TEXT;
    END;
    
    -- Create manager user profile
    BEGIN
        INSERT INTO users (
            id,
            branch_id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            manager_user_id,
            default_branch_id,
            'manager@demo.com',
            'Manager User',
            'manager',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'manager',
            is_active = true,
            branch_id = default_branch_id,
            updated_at = NOW();
        
        RETURN QUERY SELECT 
            'manager@demo.com'::TEXT,
            'manager'::TEXT,
            'User profile ready (auth.users must be created via Supabase)'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'manager@demo.com'::TEXT,
            'manager'::TEXT,
            ('ERROR: ' || SQLERRM)::TEXT;
    END;
    
    -- Create cashier user profile
    BEGIN
        INSERT INTO users (
            id,
            branch_id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            cashier_user_id,
            default_branch_id,
            'cashier@demo.com',
            'Cashier User',
            'cashier',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'cashier',
            is_active = true,
            branch_id = default_branch_id,
            updated_at = NOW();
        
        RETURN QUERY SELECT 
            'cashier@demo.com'::TEXT,
            'cashier'::TEXT,
            'User profile ready (auth.users must be created via Supabase)'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'cashier@demo.com'::TEXT,
            'cashier'::TEXT,
            ('ERROR: ' || SQLERRM)::TEXT;
    END;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_test_users() IS 
'Creates test user profiles in the users table. Note: Corresponding auth.users records must be created via Supabase Dashboard or Admin API with password "123456".';
