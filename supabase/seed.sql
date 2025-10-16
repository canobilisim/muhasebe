-- Seed data for development and testing
-- This file contains sample data for development purposes

-- Insert sample branch
INSERT INTO branches (id, name, address, phone, tax_number) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Ana Şube', 'İstanbul, Türkiye', '+90 212 555 0000', '1234567890');

-- Insert sample products
INSERT INTO products (branch_id, barcode, name, category, purchase_price, sale_price, stock_quantity, critical_stock_level) VALUES
('550e8400-e29b-41d4-a716-446655440000', '8690123456789', 'Coca Cola 330ml', 'İçecek', 2.50, 4.00, 100, 20),
('550e8400-e29b-41d4-a716-446655440000', '8690123456790', 'Fanta 330ml', 'İçecek', 2.50, 4.00, 80, 20),
('550e8400-e29b-41d4-a716-446655440000', '8690123456791', 'Su 500ml', 'İçecek', 0.75, 1.50, 200, 50),
('550e8400-e29b-41d4-a716-446655440000', '8690123456792', 'Çikolata', 'Atıştırmalık', 3.00, 5.00, 50, 10),
('550e8400-e29b-41d4-a716-446655440000', '8690123456793', 'Cips', 'Atıştırmalık', 2.00, 3.50, 75, 15),
('550e8400-e29b-41d4-a716-446655440000', '8690123456794', 'Ekmek', 'Temel Gıda', 1.00, 2.00, 30, 5),
('550e8400-e29b-41d4-a716-446655440000', '8690123456795', 'Süt 1L', 'Süt Ürünleri', 4.00, 6.50, 40, 10),
('550e8400-e29b-41d4-a716-446655440000', '8690123456796', 'Yoğurt', 'Süt Ürünleri', 2.50, 4.00, 60, 15),
('550e8400-e29b-41d4-a716-446655440000', '8690123456797', 'Peynir 500g', 'Süt Ürünleri', 15.00, 25.00, 25, 5),
('550e8400-e29b-41d4-a716-446655440000', '8690123456798', 'Deterjan', 'Temizlik', 8.00, 12.00, 20, 5);

-- Insert sample customers
INSERT INTO customers (branch_id, name, phone, email, address, credit_limit) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Ahmet Yılmaz', '+90 532 123 4567', 'ahmet@email.com', 'Kadıköy, İstanbul', 1000.00),
('550e8400-e29b-41d4-a716-446655440000', 'Fatma Demir', '+90 533 234 5678', 'fatma@email.com', 'Üsküdar, İstanbul', 500.00),
('550e8400-e29b-41d4-a716-446655440000', 'Mehmet Kaya', '+90 534 345 6789', 'mehmet@email.com', 'Beşiktaş, İstanbul', 750.00),
('550e8400-e29b-41d4-a716-446655440000', 'Ayşe Özkan', '+90 535 456 7890', 'ayse@email.com', 'Şişli, İstanbul', 300.00),
('550e8400-e29b-41d4-a716-446655440000', 'Ali Çelik', '+90 536 567 8901', 'ali@email.com', 'Bakırköy, İstanbul', 1200.00);

-- Note: Users will be created through Supabase Auth
-- After user registration, they need to be added to the users table with branch_id and role