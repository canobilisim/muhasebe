-- HIZLI ÇÖZÜM: Sadece Products tablosu için RLS politikaları
-- Supabase Dashboard > SQL Editor'de çalıştırın

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Users can view products in their branch" ON products;
DROP POLICY IF EXISTS "Users can insert products in their branch" ON products;
DROP POLICY IF EXISTS "Users can update products in their branch" ON products;
DROP POLICY IF EXISTS "Users can delete products in their branch" ON products;

-- Yeni politikalar oluştur
CREATE POLICY "Users can view products in their branch"
ON products FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can insert products in their branch"
ON products FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

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

CREATE POLICY "Users can delete products in their branch"
ON products FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id FROM users WHERE id = auth.uid()
    )
);

-- RLS'in aktif olduğundan emin ol
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Kontrol et
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd;
