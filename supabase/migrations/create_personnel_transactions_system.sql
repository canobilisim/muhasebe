-- Personel Hesap Hareketleri Sistemi
-- Cari hesap mantığı ile çalışır: Borç/Alacak/Bakiye

-- Yeni hesap hareketleri tablosu
CREATE TABLE IF NOT EXISTS personnel_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  branch_id UUID,
  user_id UUID,
  
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type VARCHAR(50) NOT NULL, -- 'hakedis', 'avans', 'odeme', 'kesinti'
  
  description TEXT, -- Açıklama (Ocak Maaşı, Avans, vb.)
  
  debit_amount DECIMAL(15,2) DEFAULT 0, -- Borç (Avans, Ödeme)
  credit_amount DECIMAL(15,2) DEFAULT 0, -- Alacak (Hakediş)
  
  balance DECIMAL(15,2) DEFAULT 0, -- Bakiye (otomatik hesaplanacak)
  
  payment_type VARCHAR(20), -- 'cash', 'bank'
  transaction_number VARCHAR(50) UNIQUE, -- İşlem numarası
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_amounts CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0)
  )
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_personnel_transactions_personnel ON personnel_transactions(personnel_id);
CREATE INDEX IF NOT EXISTS idx_personnel_transactions_branch ON personnel_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_personnel_transactions_date ON personnel_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_personnel_transactions_type ON personnel_transactions(transaction_type);

-- RLS Politikaları
ALTER TABLE personnel_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view personnel transactions in their branch" ON personnel_transactions;
CREATE POLICY "Users can view personnel transactions in their branch"
  ON personnel_transactions FOR SELECT
  USING (
    branch_id::text IN (
      SELECT branch_id::text FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert personnel transactions in their branch" ON personnel_transactions;
CREATE POLICY "Users can insert personnel transactions in their branch"
  ON personnel_transactions FOR INSERT
  WITH CHECK (
    branch_id::text IN (
      SELECT branch_id::text FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update personnel transactions in their branch" ON personnel_transactions;
CREATE POLICY "Users can update personnel transactions in their branch"
  ON personnel_transactions FOR UPDATE
  USING (
    branch_id::text IN (
      SELECT branch_id::text FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete personnel transactions in their branch" ON personnel_transactions;
CREATE POLICY "Users can delete personnel transactions in their branch"
  ON personnel_transactions FOR DELETE
  USING (
    branch_id::text IN (
      SELECT branch_id::text FROM users WHERE id = auth.uid()
    )
  );

-- Bakiye hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_personnel_balance(p_personnel_id UUID, p_transaction_date DATE)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(credit_amount - debit_amount), 0)
  INTO v_balance
  FROM personnel_transactions
  WHERE personnel_id = p_personnel_id
    AND transaction_date <= p_transaction_date;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Bakiye otomatik hesaplama
CREATE OR REPLACE FUNCTION update_personnel_transaction_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni işlemin bakiyesini hesapla
  NEW.balance := calculate_personnel_balance(NEW.personnel_id, NEW.transaction_date);
  
  -- Sonraki tüm işlemlerin bakiyelerini güncelle
  UPDATE personnel_transactions
  SET balance = calculate_personnel_balance(personnel_id, transaction_date),
      updated_at = NOW()
  WHERE personnel_id = NEW.personnel_id
    AND transaction_date >= NEW.transaction_date
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_personnel_balance ON personnel_transactions;
CREATE TRIGGER trigger_update_personnel_balance
  BEFORE INSERT OR UPDATE ON personnel_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_personnel_transaction_balance();

-- Silme sonrası bakiye güncelleme
CREATE OR REPLACE FUNCTION update_balance_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Silinen işlemden sonraki tüm işlemlerin bakiyelerini güncelle
  UPDATE personnel_transactions
  SET balance = calculate_personnel_balance(personnel_id, transaction_date),
      updated_at = NOW()
  WHERE personnel_id = OLD.personnel_id
    AND transaction_date >= OLD.transaction_date;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_balance_after_delete ON personnel_transactions;
CREATE TRIGGER trigger_update_balance_after_delete
  AFTER DELETE ON personnel_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_balance_after_delete();
