-- Add due_date column to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN sales.due_date IS 'Vade tarihi - açık hesap satışlar için ödeme vadesi';

-- Create index for faster queries on overdue sales
CREATE INDEX IF NOT EXISTS idx_sales_due_date ON sales(due_date) WHERE due_date IS NOT NULL;
