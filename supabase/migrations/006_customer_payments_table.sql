-- Migration: Add customer_payments table
-- Description: Create a dedicated table for tracking customer payment records
-- This replaces the previous approach of using negative sales for payments

-- Create customer_payments table
CREATE TABLE IF NOT EXISTS public.customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'pos')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON public.customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_date ON public.customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_branch_id ON public.customer_payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_user_id ON public.customer_payments(user_id);

-- Add RLS policies
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view payments from their branch
CREATE POLICY "Users can view payments from their branch"
    ON public.customer_payments
    FOR SELECT
    USING (
        branch_id IN (
            SELECT branch_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Policy: Users can insert payments for their branch
CREATE POLICY "Users can insert payments for their branch"
    ON public.customer_payments
    FOR INSERT
    WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Policy: Users can update payments from their branch
CREATE POLICY "Users can update payments from their branch"
    ON public.customer_payments
    FOR UPDATE
    USING (
        branch_id IN (
            SELECT branch_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Policy: Users can delete payments from their branch
CREATE POLICY "Users can delete payments from their branch"
    ON public.customer_payments
    FOR DELETE
    USING (
        branch_id IN (
            SELECT branch_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_customer_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_payments_updated_at
    BEFORE UPDATE ON public.customer_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_payments_updated_at();

-- Add comment
COMMENT ON TABLE public.customer_payments IS 'Stores customer payment records separate from sales transactions';
