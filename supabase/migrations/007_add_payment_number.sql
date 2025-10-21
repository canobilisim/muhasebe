-- Migration: Add payment_number field and generate_payment_number function
-- Description: Add payment_number field to customer_payments table and create RPC function

-- Add payment_number column to customer_payments table
ALTER TABLE public.customer_payments 
ADD COLUMN IF NOT EXISTS payment_number VARCHAR(50) UNIQUE;

-- Create index for payment_number
CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_number ON public.customer_payments(payment_number);

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number(branch_uuid UUID)
RETURNS VARCHAR(50) AS $
DECLARE
    branch_prefix VARCHAR(10);
    next_number INTEGER;
    payment_number VARCHAR(50);
    current_timestamp TIMESTAMPTZ;
BEGIN
    -- Get current timestamp to ensure uniqueness
    current_timestamp := NOW();
    
    -- Get branch prefix (first 3 chars of branch name)
    SELECT UPPER(LEFT(name, 3)) INTO branch_prefix
    FROM branches WHERE id = branch_uuid;
    
    -- If no branch found, use default prefix
    IF branch_prefix IS NULL THEN
        branch_prefix := 'ODM';
    END IF;
    
    -- Get next payment number for today with microsecond precision
    SELECT COALESCE(MAX(CAST(RIGHT(payment_number, 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM customer_payments 
    WHERE branch_id = branch_uuid 
    AND DATE(payment_date) = CURRENT_DATE
    AND payment_number IS NOT NULL;
    
    -- If no payments today, start from 1
    IF next_number IS NULL THEN
        next_number := 1;
    END IF;
    
    -- Format: ODM-YYYYMMDD-000001
    payment_number := branch_prefix || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_number::TEXT, 6, '0');
    
    -- Check if this number already exists (race condition protection)
    WHILE EXISTS (SELECT 1 FROM customer_payments WHERE payment_number = payment_number) LOOP
        next_number := next_number + 1;
        payment_number := branch_prefix || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_number::TEXT, 6, '0');
    END LOOP;
    
    RETURN payment_number;
END;
$ LANGUAGE plpgsql;

-- Function to auto-generate payment number
CREATE OR REPLACE FUNCTION set_payment_number()
RETURNS TRIGGER AS $
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := generate_payment_number(NEW.branch_id);
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger to auto-generate payment number
CREATE TRIGGER trigger_set_payment_number
    BEFORE INSERT ON public.customer_payments
    FOR EACH ROW EXECUTE FUNCTION set_payment_number();

-- Add comment
COMMENT ON COLUMN public.customer_payments.payment_number IS 'Auto-generated unique payment number (e.g., ODM-20241021-000001)';