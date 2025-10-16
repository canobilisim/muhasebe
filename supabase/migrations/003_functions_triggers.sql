-- Database Functions and Triggers
-- Business logic and automation

-- Function to generate sale number
CREATE OR REPLACE FUNCTION generate_sale_number(branch_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    branch_prefix VARCHAR(10);
    next_number INTEGER;
    sale_number VARCHAR(50);
BEGIN
    -- Get branch prefix (first 3 chars of branch name)
    SELECT UPPER(LEFT(name, 3)) INTO branch_prefix
    FROM branches WHERE id = branch_uuid;
    
    -- Get next sale number for today
    SELECT COALESCE(MAX(CAST(RIGHT(sale_number, 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales 
    WHERE branch_id = branch_uuid 
    AND DATE(sale_date) = CURRENT_DATE;
    
    -- Format: BRN-YYYYMMDD-000001
    sale_number := branch_prefix || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN sale_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock after sale
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease stock when sale item is added
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust stock based on quantity change
        UPDATE products 
        SET stock_quantity = stock_quantity + OLD.quantity - NEW.quantity
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Increase stock when sale item is deleted
        UPDATE products 
        SET stock_quantity = stock_quantity + OLD.quantity
        WHERE id = OLD.product_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer balance
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update customer balance for credit sales
        IF NEW.payment_type = 'credit' THEN
            UPDATE customers 
            SET current_balance = current_balance + NEW.net_amount
            WHERE id = NEW.customer_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle payment status changes
        IF OLD.payment_status = 'pending' AND NEW.payment_status = 'paid' THEN
            UPDATE customers 
            SET current_balance = current_balance - NEW.net_amount
            WHERE id = NEW.customer_id;
        ELSIF OLD.payment_status = 'paid' AND NEW.payment_status = 'pending' THEN
            UPDATE customers 
            SET current_balance = current_balance + NEW.net_amount
            WHERE id = NEW.customer_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse customer balance for deleted credit sales
        IF OLD.payment_type = 'credit' THEN
            UPDATE customers 
            SET current_balance = current_balance - OLD.net_amount
            WHERE id = OLD.customer_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create cash movement for sales
CREATE OR REPLACE FUNCTION create_sale_cash_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Create cash movement for cash and POS sales
        IF NEW.payment_type IN ('cash', 'pos') THEN
            INSERT INTO cash_movements (
                branch_id,
                user_id,
                sale_id,
                movement_type,
                amount,
                description,
                reference_number
            ) VALUES (
                NEW.branch_id,
                NEW.user_id,
                NEW.id,
                'sale',
                NEW.net_amount,
                'Satış - ' || NEW.sale_number,
                NEW.sale_number
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate sale number
CREATE OR REPLACE FUNCTION set_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL OR NEW.sale_number = '' THEN
        NEW.sale_number := generate_sale_number(NEW.branch_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

CREATE TRIGGER trigger_update_customer_balance
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_customer_balance();

CREATE TRIGGER trigger_create_sale_cash_movement
    AFTER INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION create_sale_cash_movement();

CREATE TRIGGER trigger_set_sale_number
    BEFORE INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION set_sale_number();

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(branch_uuid UUID)
RETURNS TABLE (
    id UUID,
    barcode VARCHAR(50),
    name VARCHAR(255),
    stock_quantity INTEGER,
    critical_stock_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.barcode, p.name, p.stock_quantity, p.critical_stock_level
    FROM products p
    WHERE p.branch_id = branch_uuid 
    AND p.stock_quantity <= p.critical_stock_level
    AND p.is_active = true
    ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily sales summary
CREATE OR REPLACE FUNCTION get_daily_sales_summary(
    branch_uuid UUID, 
    target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_sales BIGINT,
    total_amount DECIMAL(10,2),
    cash_sales DECIMAL(10,2),
    pos_sales DECIMAL(10,2),
    credit_sales DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_sales,
        COALESCE(SUM(net_amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN net_amount ELSE 0 END), 0) as cash_sales,
        COALESCE(SUM(CASE WHEN payment_type = 'pos' THEN net_amount ELSE 0 END), 0) as pos_sales,
        COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN net_amount ELSE 0 END), 0) as credit_sales
    FROM sales s
    WHERE s.branch_id = branch_uuid 
    AND DATE(s.sale_date) = target_date;
END;
$$ LANGUAGE plpgsql;