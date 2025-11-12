-- Tüm tablolar için RLS politikalarını düzelt
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- ============================================
-- PRODUCTS TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view products in their branch" ON products;
CREATE POLICY "Users can view products in their branch"
ON products FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert products in their branch" ON products;
CREATE POLICY "Users can insert products in their branch"
ON products FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update products in their branch" ON products;
CREATE POLICY "Users can update products in their branch"
ON products FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete products in their branch" ON products;
CREATE POLICY "Users can delete products in their branch"
ON products FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SALES TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view sales in their branch" ON sales;
CREATE POLICY "Users can view sales in their branch"
ON sales FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert sales in their branch" ON sales;
CREATE POLICY "Users can insert sales in their branch"
ON sales FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update sales in their branch" ON sales;
CREATE POLICY "Users can update sales in their branch"
ON sales FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete sales in their branch" ON sales;
CREATE POLICY "Users can delete sales in their branch"
ON sales FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SALE_ITEMS TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view sale items in their branch" ON sale_items;
CREATE POLICY "Users can view sale items in their branch"
ON sale_items FOR SELECT
TO authenticated
USING (
    sale_id IN (
        SELECT id FROM sales 
        WHERE branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Users can insert sale items in their branch" ON sale_items;
CREATE POLICY "Users can insert sale items in their branch"
ON sale_items FOR INSERT
TO authenticated
WITH CHECK (
    sale_id IN (
        SELECT id FROM sales 
        WHERE branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Users can update sale items in their branch" ON sale_items;
CREATE POLICY "Users can update sale items in their branch"
ON sale_items FOR UPDATE
TO authenticated
USING (
    sale_id IN (
        SELECT id FROM sales 
        WHERE branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    )
)
WITH CHECK (
    sale_id IN (
        SELECT id FROM sales 
        WHERE branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Users can delete sale items in their branch" ON sale_items;
CREATE POLICY "Users can delete sale items in their branch"
ON sale_items FOR DELETE
TO authenticated
USING (
    sale_id IN (
        SELECT id FROM sales 
        WHERE branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    )
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CUSTOMERS TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view customers in their branch" ON customers;
CREATE POLICY "Users can view customers in their branch"
ON customers FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert customers in their branch" ON customers;
CREATE POLICY "Users can insert customers in their branch"
ON customers FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update customers in their branch" ON customers;
CREATE POLICY "Users can update customers in their branch"
ON customers FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete customers in their branch" ON customers;
CREATE POLICY "Users can delete customers in their branch"
ON customers FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CASH_MOVEMENTS TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view cash movements in their branch" ON cash_movements;
CREATE POLICY "Users can view cash movements in their branch"
ON cash_movements FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert cash movements in their branch" ON cash_movements;
CREATE POLICY "Users can insert cash movements in their branch"
ON cash_movements FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update cash movements in their branch" ON cash_movements;
CREATE POLICY "Users can update cash movements in their branch"
ON cash_movements FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete cash movements in their branch" ON cash_movements;
CREATE POLICY "Users can delete cash movements in their branch"
ON cash_movements FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCT_CATEGORIES TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view categories in their branch" ON product_categories;
CREATE POLICY "Users can view categories in their branch"
ON product_categories FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert categories in their branch" ON product_categories;
CREATE POLICY "Users can insert categories in their branch"
ON product_categories FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update categories in their branch" ON product_categories;
CREATE POLICY "Users can update categories in their branch"
ON product_categories FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete categories in their branch" ON product_categories;
CREATE POLICY "Users can delete categories in their branch"
ON product_categories FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FAST_SALE_CATEGORIES TABLOSU
-- ============================================

DROP POLICY IF EXISTS "Users can view fast sale categories in their branch" ON fast_sale_categories;
CREATE POLICY "Users can view fast sale categories in their branch"
ON fast_sale_categories FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert fast sale categories in their branch" ON fast_sale_categories;
CREATE POLICY "Users can insert fast sale categories in their branch"
ON fast_sale_categories FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update fast sale categories in their branch" ON fast_sale_categories;
CREATE POLICY "Users can update fast sale categories in their branch"
ON fast_sale_categories FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete fast sale categories in their branch" ON fast_sale_categories;
CREATE POLICY "Users can delete fast sale categories in their branch"
ON fast_sale_categories FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

ALTER TABLE fast_sale_categories ENABLE ROW LEVEL SECURITY;

-- Tüm politikaları kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
