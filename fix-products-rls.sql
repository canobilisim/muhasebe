-- Products tablosu için RLS politikalarını düzelt
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- Önce mevcut politikaları kontrol et
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Eğer politikalar yoksa veya hatalıysa, aşağıdaki politikaları ekleyin:

-- 1. SELECT politikası - Kullanıcılar kendi branch'lerindeki ürünleri görebilir
DROP POLICY IF EXISTS "Users can view products in their branch" ON products;
CREATE POLICY "Users can view products in their branch"
ON products FOR SELECT
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- 2. INSERT politikası - Kullanıcılar kendi branch'lerine ürün ekleyebilir
DROP POLICY IF EXISTS "Users can insert products in their branch" ON products;
CREATE POLICY "Users can insert products in their branch"
ON products FOR INSERT
TO authenticated
WITH CHECK (
    branch_id IN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- 3. UPDATE politikası - Kullanıcılar kendi branch'lerindeki ürünleri güncelleyebilir
DROP POLICY IF EXISTS "Users can update products in their branch" ON products;
CREATE POLICY "Users can update products in their branch"
ON products FOR UPDATE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    branch_id IN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- 4. DELETE politikası - Kullanıcılar kendi branch'lerindeki ürünleri silebilir
DROP POLICY IF EXISTS "Users can delete products in their branch" ON products;
CREATE POLICY "Users can delete products in their branch"
ON products FOR DELETE
TO authenticated
USING (
    branch_id IN (
        SELECT branch_id 
        FROM users 
        WHERE id = auth.uid()
    )
);

-- RLS'in aktif olduğundan emin ol
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politikaları kontrol et
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd;
