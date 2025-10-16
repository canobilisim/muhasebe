-- Row Level Security (RLS) Policies
-- Multi-tenant security based on branch_id

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's branch_id
CREATE OR REPLACE FUNCTION get_user_branch_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Branches policies
CREATE POLICY "Users can view their own branch" ON branches
    FOR SELECT USING (
        id = get_user_branch_id() OR is_admin()
    );

CREATE POLICY "Only admins can insert branches" ON branches
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update branches" ON branches
    FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete branches" ON branches
    FOR DELETE USING (is_admin());

-- Users policies
CREATE POLICY "Users can view users in their branch" ON users
    FOR SELECT USING (
        branch_id = get_user_branch_id() OR is_admin()
    );

CREATE POLICY "Admins and managers can insert users" ON users
    FOR INSERT WITH CHECK (
        is_admin() OR (
            SELECT role IN ('admin', 'manager')
            FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and managers can update users in their branch" ON users
    FOR UPDATE USING (
        is_admin() OR (
            branch_id = get_user_branch_id() AND
            (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (is_admin());

-- Products policies
CREATE POLICY "Users can view products in their branch" ON products
    FOR SELECT USING (branch_id = get_user_branch_id());

CREATE POLICY "Managers and admins can insert products" ON products
    FOR INSERT WITH CHECK (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Managers and admins can update products in their branch" ON products
    FOR UPDATE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Managers and admins can delete products in their branch" ON products
    FOR DELETE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

-- Customers policies
CREATE POLICY "Users can view customers in their branch" ON customers
    FOR SELECT USING (branch_id = get_user_branch_id());

CREATE POLICY "Users can insert customers in their branch" ON customers
    FOR INSERT WITH CHECK (branch_id = get_user_branch_id());

CREATE POLICY "Users can update customers in their branch" ON customers
    FOR UPDATE USING (branch_id = get_user_branch_id());

CREATE POLICY "Managers and admins can delete customers in their branch" ON customers
    FOR DELETE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

-- Sales policies
CREATE POLICY "Users can view sales in their branch" ON sales
    FOR SELECT USING (branch_id = get_user_branch_id());

CREATE POLICY "Users can insert sales in their branch" ON sales
    FOR INSERT WITH CHECK (branch_id = get_user_branch_id());

CREATE POLICY "Users can update their own sales" ON sales
    FOR UPDATE USING (
        branch_id = get_user_branch_id() AND
        (user_id = auth.uid() OR (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Managers and admins can delete sales in their branch" ON sales
    FOR DELETE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );

-- Sale items policies
CREATE POLICY "Users can view sale items for sales in their branch" ON sale_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.branch_id = get_user_branch_id()
        )
    );

CREATE POLICY "Users can insert sale items for sales in their branch" ON sale_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.branch_id = get_user_branch_id()
        )
    );

CREATE POLICY "Users can update sale items for their own sales" ON sale_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.branch_id = get_user_branch_id()
            AND (sales.user_id = auth.uid() OR (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid()))
        )
    );

CREATE POLICY "Managers and admins can delete sale items in their branch" ON sale_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sales 
            WHERE sales.id = sale_items.sale_id 
            AND sales.branch_id = get_user_branch_id()
            AND (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
        )
    );

-- Cash movements policies
CREATE POLICY "Users can view cash movements in their branch" ON cash_movements
    FOR SELECT USING (branch_id = get_user_branch_id());

CREATE POLICY "Users can insert cash movements in their branch" ON cash_movements
    FOR INSERT WITH CHECK (branch_id = get_user_branch_id());

CREATE POLICY "Users can update their own cash movements" ON cash_movements
    FOR UPDATE USING (
        branch_id = get_user_branch_id() AND
        (user_id = auth.uid() OR (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "Managers and admins can delete cash movements in their branch" ON cash_movements
    FOR DELETE USING (
        branch_id = get_user_branch_id() AND
        (SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid())
    );