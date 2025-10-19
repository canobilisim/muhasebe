-- Turkcell Dashboard Tables Migration
-- Adds tables for tracking Turkcell transactions and monthly targets

-- ============================================================================
-- PART 1: Create Turkcell Tables
-- ============================================================================

-- Turkcell transactions table
-- Stores daily transaction records for Turkcell operations
CREATE TABLE turkcell_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_type VARCHAR(50) NOT NULL DEFAULT 'general',
    count INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    reference_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turkcell monthly targets table
-- Stores monthly target settings for Turkcell operations
CREATE TABLE turkcell_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_month DATE NOT NULL, -- YYYY-MM-01 format for month identification
    target_count INTEGER NOT NULL CHECK (target_count > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one target per branch per month
    UNIQUE(branch_id, target_month)
);

-- ============================================================================
-- PART 2: Create Indexes for Performance
-- ============================================================================

-- Turkcell transactions indexes
CREATE INDEX idx_turkcell_transactions_branch_id ON turkcell_transactions(branch_id);
CREATE INDEX idx_turkcell_transactions_user_id ON turkcell_transactions(user_id);
CREATE INDEX idx_turkcell_transactions_date ON turkcell_transactions(transaction_date);
CREATE INDEX idx_turkcell_transactions_type ON turkcell_transactions(transaction_type);
CREATE INDEX idx_turkcell_transactions_branch_date ON turkcell_transactions(branch_id, transaction_date);

-- Turkcell targets indexes
CREATE INDEX idx_turkcell_targets_branch_id ON turkcell_targets(branch_id);
CREATE INDEX idx_turkcell_targets_user_id ON turkcell_targets(user_id);
CREATE INDEX idx_turkcell_targets_month ON turkcell_targets(target_month);
CREATE INDEX idx_turkcell_targets_branch_month ON turkcell_targets(branch_id, target_month);

-- ============================================================================
-- PART 3: Add Updated At Triggers
-- ============================================================================

-- Add updated_at triggers for new tables
CREATE TRIGGER update_turkcell_transactions_updated_at 
    BEFORE UPDATE ON turkcell_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turkcell_targets_updated_at 
    BEFORE UPDATE ON turkcell_targets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 4: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE turkcell_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE turkcell_targets ENABLE ROW LEVEL SECURITY;

-- Turkcell transactions policies
CREATE POLICY "Users can view turkcell transactions in their branch" ON turkcell_transactions
    FOR SELECT USING (branch_id = get_user_branch_id());

CREATE POLICY "Users can insert turkcell transactions in their branch" ON turkcell_transactions
    FOR INSERT WITH CHECK (branch_id = get_user_branch_id());

CREATE POLICY "Users can update their own turkcell transactions" ON turkcell_transactions
    FOR UPDATE USING (
        branch_id = get_user_branch_id() AND
        (user_id = auth.uid() OR (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Managers and admins can delete turkcell transactions in their branch" ON turkcell_transactions
    FOR DELETE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

-- Turkcell targets policies
CREATE POLICY "Users can view turkcell targets in their branch" ON turkcell_targets
    FOR SELECT USING (branch_id = get_user_branch_id());

CREATE POLICY "Managers and admins can insert turkcell targets in their branch" ON turkcell_targets
    FOR INSERT WITH CHECK (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Managers and admins can update turkcell targets in their branch" ON turkcell_targets
    FOR UPDATE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Managers and admins can delete turkcell targets in their branch" ON turkcell_targets
    FOR DELETE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

-- ============================================================================
-- PART 5: Helper Functions for Turkcell Operations
-- ============================================================================

-- Function to get daily Turkcell transaction count
CREATE OR REPLACE FUNCTION get_daily_turkcell_count(
    branch_uuid UUID,
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $
BEGIN
    RETURN COALESCE(
        (SELECT SUM(count)
         FROM turkcell_transactions
         WHERE branch_id = branch_uuid
         AND transaction_date = target_date),
        0
    );
END;
$ LANGUAGE plpgsql;

-- Function to get monthly Turkcell target
CREATE OR REPLACE FUNCTION get_monthly_turkcell_target(
    branch_uuid UUID,
    target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)
)
RETURNS INTEGER AS $
BEGIN
    RETURN COALESCE(
        (SELECT target_count
         FROM turkcell_targets
         WHERE branch_id = branch_uuid
         AND target_month = DATE_TRUNC('month', target_month)),
        0
    );
END;
$ LANGUAGE plpgsql;

-- Function to get monthly Turkcell progress
CREATE OR REPLACE FUNCTION get_monthly_turkcell_progress(
    branch_uuid UUID,
    target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)
)
RETURNS TABLE (
    total_count INTEGER,
    target_count INTEGER,
    progress_percentage DECIMAL(5,2)
) AS $
DECLARE
    month_start DATE;
    month_end DATE;
    total_transactions INTEGER;
    monthly_target INTEGER;
BEGIN
    -- Calculate month boundaries
    month_start := DATE_TRUNC('month', target_month);
    month_end := (DATE_TRUNC('month', target_month) + INTERVAL '1 month - 1 day')::DATE;
    
    -- Get total transactions for the month
    SELECT COALESCE(SUM(count), 0)
    INTO total_transactions
    FROM turkcell_transactions
    WHERE branch_id = branch_uuid
    AND transaction_date >= month_start
    AND transaction_date <= month_end;
    
    -- Get monthly target
    SELECT COALESCE(tt.target_count, 0)
    INTO monthly_target
    FROM turkcell_targets tt
    WHERE tt.branch_id = branch_uuid
    AND tt.target_month = month_start;
    
    -- Calculate progress percentage
    RETURN QUERY SELECT 
        total_transactions,
        monthly_target,
        CASE 
            WHEN monthly_target > 0 THEN 
                ROUND((total_transactions::DECIMAL / monthly_target::DECIMAL) * 100, 2)
            ELSE 0::DECIMAL(5,2)
        END;
END;
$ LANGUAGE plpgsql;

-- Function to set or update monthly Turkcell target
CREATE OR REPLACE FUNCTION set_monthly_turkcell_target(
    branch_uuid UUID,
    target_count_param INTEGER,
    target_month_param DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
    user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $
BEGIN
    -- Validate target count
    IF target_count_param <= 0 THEN
        RAISE EXCEPTION 'Target count must be greater than 0';
    END IF;
    
    -- Insert or update target
    INSERT INTO turkcell_targets (
        branch_id,
        user_id,
        target_month,
        target_count,
        description
    ) VALUES (
        branch_uuid,
        user_uuid,
        DATE_TRUNC('month', target_month_param),
        target_count_param,
        'Aylık Turkcell işlem hedefi'
    )
    ON CONFLICT (branch_id, target_month)
    DO UPDATE SET
        target_count = target_count_param,
        user_id = user_uuid,
        updated_at = NOW(),
        description = 'Aylık Turkcell işlem hedefi (güncellendi)';
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 6: Comments and Documentation
-- ============================================================================

COMMENT ON TABLE turkcell_transactions IS 
'Stores daily Turkcell transaction records for tracking operator performance';

COMMENT ON TABLE turkcell_targets IS 
'Stores monthly target settings for Turkcell operations per branch';

COMMENT ON FUNCTION get_daily_turkcell_count(UUID, DATE) IS 
'Returns the total count of Turkcell transactions for a specific branch and date';

COMMENT ON FUNCTION get_monthly_turkcell_target(UUID, DATE) IS 
'Returns the monthly target count for Turkcell operations for a specific branch and month';

COMMENT ON FUNCTION get_monthly_turkcell_progress(UUID, DATE) IS 
'Returns monthly progress statistics including total count, target, and percentage for Turkcell operations';

COMMENT ON FUNCTION set_monthly_turkcell_target(UUID, INTEGER, DATE, UUID) IS 
'Sets or updates the monthly Turkcell target for a specific branch and month';

-- ============================================================================
-- PART 7: Sample Data for Testing (Optional)
-- ============================================================================

-- Function to create sample Turkcell data for testing
CREATE OR REPLACE FUNCTION create_sample_turkcell_data()
RETURNS TABLE (
    action TEXT,
    details TEXT,
    status TEXT
) AS $
DECLARE
    sample_branch_id UUID;
    sample_user_id UUID;
    current_month DATE;
BEGIN
    -- Get first available branch and user
    SELECT b.id, u.id
    INTO sample_branch_id, sample_user_id
    FROM branches b
    CROSS JOIN users u
    WHERE u.branch_id = b.id
    AND u.is_active = true
    ORDER BY b.created_at ASC, u.created_at ASC
    LIMIT 1;
    
    IF sample_branch_id IS NULL THEN
        RETURN QUERY SELECT 
            'ERROR'::TEXT,
            'No branch or user found'::TEXT,
            'FAILED'::TEXT;
        RETURN;
    END IF;
    
    current_month := DATE_TRUNC('month', CURRENT_DATE);
    
    -- Create monthly target
    BEGIN
        PERFORM set_monthly_turkcell_target(
            sample_branch_id,
            100, -- Target: 100 transactions per month
            current_month,
            sample_user_id
        );
        
        RETURN QUERY SELECT 
            'TARGET'::TEXT,
            'Created monthly target: 100 transactions'::TEXT,
            'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'TARGET'::TEXT,
            ('ERROR: ' || SQLERRM)::TEXT,
            'FAILED'::TEXT;
    END;
    
    -- Create sample transactions for current month
    BEGIN
        -- Add some transactions for the past few days
        FOR i IN 1..5 LOOP
            INSERT INTO turkcell_transactions (
                branch_id,
                user_id,
                transaction_date,
                transaction_type,
                count,
                description
            ) VALUES (
                sample_branch_id,
                sample_user_id,
                CURRENT_DATE - (i - 1),
                'general',
                (RANDOM() * 10 + 5)::INTEGER, -- Random count between 5-15
                'Test işlem - Gün ' || i
            );
        END LOOP;
        
        RETURN QUERY SELECT 
            'TRANSACTIONS'::TEXT,
            'Created 5 days of sample transactions'::TEXT,
            'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'TRANSACTIONS'::TEXT,
            ('ERROR: ' || SQLERRM)::TEXT,
            'FAILED'::TEXT;
    END;
    
    RETURN;
END;
$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_sample_turkcell_data() IS 
'Creates sample Turkcell data for testing purposes including targets and transactions';