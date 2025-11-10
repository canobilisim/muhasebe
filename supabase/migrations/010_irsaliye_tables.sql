-- İrsaliye tabloları oluşturma
-- Bu migration irsaliye sistemi için gerekli tabloları oluşturur

-- İrsaliyeler tablosu
CREATE TABLE IF NOT EXISTS irsaliyeler (
    id BIGSERIAL PRIMARY KEY,
    irsaliye_no VARCHAR(50) NOT NULL UNIQUE,
    cari_id BIGINT NOT NULL,
    cari_turu VARCHAR(20) NOT NULL CHECK (cari_turu IN ('Müşteri', 'Tedarikçi')),
    irsaliye_turu VARCHAR(20) NOT NULL CHECK (irsaliye_turu IN ('Satış', 'Alış', 'İade', 'Transfer')),
    irsaliye_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
    sevk_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
    sevk_yeri TEXT,
    durum VARCHAR(20) NOT NULL DEFAULT 'Taslak' CHECK (durum IN ('Taslak', 'Tamamlandı', 'Faturalandı')),
    toplam_miktar DECIMAL(15,3) DEFAULT 0,
    toplam_tutar DECIMAL(15,2) DEFAULT 0,
    pdf_url TEXT,
    aciklama TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_irsaliye_cari FOREIGN KEY (cari_id) REFERENCES cariler(id) ON DELETE RESTRICT
);

-- İrsaliye ürünleri tablosu
CREATE TABLE IF NOT EXISTS irsaliye_urunleri (
    id BIGSERIAL PRIMARY KEY,
    irsaliye_id BIGINT NOT NULL,
    urun_id BIGINT NOT NULL,
    urun_adi VARCHAR(255) NOT NULL,
    barkod VARCHAR(100),
    miktar DECIMAL(15,3) NOT NULL DEFAULT 0,
    birim VARCHAR(20) NOT NULL DEFAULT 'Adet' CHECK (birim IN ('Adet', 'Kg', 'Kutu', 'Litre')),
    birim_fiyat DECIMAL(15,2) DEFAULT 0,
    tutar DECIMAL(15,2) DEFAULT 0,
    seri_no VARCHAR(100),
    aciklama TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_irsaliye_urun_irsaliye FOREIGN KEY (irsaliye_id) REFERENCES irsaliyeler(id) ON DELETE CASCADE,
    CONSTRAINT fk_irsaliye_urun_urun FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE RESTRICT
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_irsaliyeler_irsaliye_no ON irsaliyeler(irsaliye_no);
CREATE INDEX IF NOT EXISTS idx_irsaliyeler_cari_id ON irsaliyeler(cari_id);
CREATE INDEX IF NOT EXISTS idx_irsaliyeler_irsaliye_turu ON irsaliyeler(irsaliye_turu);
CREATE INDEX IF NOT EXISTS idx_irsaliyeler_durum ON irsaliyeler(durum);
CREATE INDEX IF NOT EXISTS idx_irsaliyeler_created_at ON irsaliyeler(created_at);

CREATE INDEX IF NOT EXISTS idx_irsaliye_urunleri_irsaliye_id ON irsaliye_urunleri(irsaliye_id);
CREATE INDEX IF NOT EXISTS idx_irsaliye_urunleri_urun_id ON irsaliye_urunleri(urun_id);
CREATE INDEX IF NOT EXISTS idx_irsaliye_urunleri_barkod ON irsaliye_urunleri(barkod);

-- Trigger fonksiyonu: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_irsaliye_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: irsaliyeler tablosu için updated_at
DROP TRIGGER IF EXISTS trigger_update_irsaliye_updated_at ON irsaliyeler;
CREATE TRIGGER trigger_update_irsaliye_updated_at
    BEFORE UPDATE ON irsaliyeler
    FOR EACH ROW
    EXECUTE FUNCTION update_irsaliye_updated_at();

-- Trigger fonksiyonu: irsaliye toplamlarını güncelleme
CREATE OR REPLACE FUNCTION update_irsaliye_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- İrsaliye toplamlarını güncelle
    UPDATE irsaliyeler 
    SET 
        toplam_miktar = (
            SELECT COALESCE(SUM(miktar), 0) 
            FROM irsaliye_urunleri 
            WHERE irsaliye_id = COALESCE(NEW.irsaliye_id, OLD.irsaliye_id)
        ),
        toplam_tutar = (
            SELECT COALESCE(SUM(tutar), 0) 
            FROM irsaliye_urunleri 
            WHERE irsaliye_id = COALESCE(NEW.irsaliye_id, OLD.irsaliye_id)
        )
    WHERE id = COALESCE(NEW.irsaliye_id, OLD.irsaliye_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: irsaliye_urunleri değişikliklerinde toplamları güncelle
DROP TRIGGER IF EXISTS trigger_update_irsaliye_totals_insert ON irsaliye_urunleri;
DROP TRIGGER IF EXISTS trigger_update_irsaliye_totals_update ON irsaliye_urunleri;
DROP TRIGGER IF EXISTS trigger_update_irsaliye_totals_delete ON irsaliye_urunleri;

CREATE TRIGGER trigger_update_irsaliye_totals_insert
    AFTER INSERT ON irsaliye_urunleri
    FOR EACH ROW
    EXECUTE FUNCTION update_irsaliye_totals();

CREATE TRIGGER trigger_update_irsaliye_totals_update
    AFTER UPDATE ON irsaliye_urunleri
    FOR EACH ROW
    EXECUTE FUNCTION update_irsaliye_totals();

CREATE TRIGGER trigger_update_irsaliye_totals_delete
    AFTER DELETE ON irsaliye_urunleri
    FOR EACH ROW
    EXECUTE FUNCTION update_irsaliye_totals();

-- RLS (Row Level Security) politikaları
ALTER TABLE irsaliyeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE irsaliye_urunleri ENABLE ROW LEVEL SECURITY;

-- İrsaliyeler için RLS politikaları
CREATE POLICY "Users can view their own irsaliyeler" ON irsaliyeler
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own irsaliyeler" ON irsaliyeler
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own irsaliyeler" ON irsaliyeler
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own irsaliyeler" ON irsaliyeler
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- İrsaliye ürünleri için RLS politikaları
CREATE POLICY "Users can view their own irsaliye_urunleri" ON irsaliye_urunleri
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own irsaliye_urunleri" ON irsaliye_urunleri
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own irsaliye_urunleri" ON irsaliye_urunleri
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own irsaliye_urunleri" ON irsaliye_urunleri
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Stok güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_product_stock(product_id BIGINT, quantity_change DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE urunler 
    SET stok_miktari = stok_miktari + quantity_change,
        updated_at = NOW()
    WHERE id = product_id;
    
    -- Stok negatif olamaz kontrolü
    IF (SELECT stok_miktari FROM urunler WHERE id = product_id) < 0 THEN
        RAISE EXCEPTION 'Stok miktarı negatif olamaz. Ürün ID: %', product_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- İrsaliye numarası üretme fonksiyonu
CREATE OR REPLACE FUNCTION generate_irsaliye_no()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    new_irsaliye_no TEXT;
BEGIN
    -- Son irsaliye numarasını al
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(irsaliye_no FROM 'IR-(\d+)') AS INTEGER)), 
        0
    ) + 1 INTO next_number
    FROM irsaliyeler
    WHERE irsaliye_no ~ '^IR-\d+$';
    
    -- Yeni irsaliye numarasını oluştur
    new_irsaliye_no := 'IR-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN new_irsaliye_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Örnek veri ekleme (test için)
-- Bu kısım production'da kaldırılabilir
INSERT INTO irsaliyeler (
    irsaliye_no, cari_id, cari_turu, irsaliye_turu, 
    sevk_yeri, durum, aciklama
) VALUES (
    'IR-000001', 1, 'Müşteri', 'Satış', 
    'Test Adresi', 'Taslak', 'Test irsaliyesi'
) ON CONFLICT (irsaliye_no) DO NOTHING;