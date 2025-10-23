-- Stok azaltma fonksiyonu (Atomik işlem)
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_uuid UUID,
  quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - quantity),
      updated_at = NOW()
  WHERE id = product_uuid;
END;
$$;

-- Müşteri bakiyesi artırma fonksiyonu (Atomik işlem)
CREATE OR REPLACE FUNCTION increment_customer_balance(
  customer_uuid UUID,
  amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE customers
  SET current_balance = COALESCE(current_balance, 0) + amount,
      updated_at = NOW()
  WHERE id = customer_uuid;
END;
$$;

-- İndeks optimizasyonları
CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_sale ON cash_movements(sale_id);
