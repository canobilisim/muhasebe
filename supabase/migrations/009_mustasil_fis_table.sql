-- Müstasil Fişi tablosu oluşturma migration'ı
-- Bu tablo vergiden muaf üreticilerden (çiftçiler, hayvancılar vb.) alınan ürünlerin kaydını tutar

-- Müstasil Fişi ana tablosu
CREATE TABLE IF NOT EXISTS mustasil_fis (
    id BIGSERIAL PRIMARY KEY,
    fis_no VARCHAR(50) NOT NULL UNIQUE,
    mustasil_adi VARCHAR(255) NOT NULL,
    tc_no VARCHAR(11) NOT NULL,
    adres TEXT NOT NULL,
    iban VARCHAR(34),
    urun_listesi JSONB NOT NULL DEFAULT '[]'::jsonb,
    brut_tutar DECIMAL(15,2) NOT NULL DEFAULT 0,
    stopaj_tutar DECIMAL(15,2) NOT NULL DEFAULT 0,
    net_tutar DECIMAL(15,2) NOT NULL DEFAULT 0,
    odeme_turu VARCHAR(50) NOT NULL DEFAULT 'Nakit',
    odeme_tarihi DATE,
    fis_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
    aciklama TEXT,
    pdf_url VARCHAR(500),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_mustasil_fis_branch_id ON mustasil_fis(branch_id);
CREATE INDEX IF NOT EXISTS idx_mustasil_fis_created_by ON mustasil_fis(created_by);
CREATE INDEX IF NOT EXISTS idx_mustasil_fis_fis_tarihi ON mustasil_fis(fis_tarihi);
CREATE INDEX IF NOT EXISTS idx_mustasil_fis_tc_no ON mustasil_fis(tc_no);
CREATE INDEX IF NOT EXISTS idx_mustasil_fis_fis_no ON mustasil_fis(fis_no);

-- Vergiler tablosuna stopaj kayıtları için yeni tip ekle (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vergiler' 
        AND column_name = 'tax_type'
    ) THEN
        -- Eğer vergiler tablosu yoksa oluştur
        CREATE TABLE IF NOT EXISTS vergiler (
            id BIGSERIAL PRIMARY KEY,
            reference_type VARCHAR(50) NOT NULL,
            reference_id BIGINT NOT NULL,
            tax_type VARCHAR(50) NOT NULL,
            tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
            tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
            description TEXT,
            branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
            created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_vergiler_reference ON vergiler(reference_type, reference_id);
        CREATE INDEX IF NOT EXISTS idx_vergiler_branch_id ON vergiler(branch_id);
    END IF;
END $$;

-- Kasa hareketleri tablosuna müstasil fişi ödemeleri için referans (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'kasa_hareketleri'
    ) THEN
        CREATE TABLE IF NOT EXISTS kasa_hareketleri (
            id BIGSERIAL PRIMARY KEY,
            reference_type VARCHAR(50) NOT NULL,
            reference_id BIGINT NOT NULL,
            movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('GIRIS', 'CIKIS')),
            amount DECIMAL(15,2) NOT NULL DEFAULT 0,
            payment_method VARCHAR(50) NOT NULL,
            description TEXT,
            branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
            created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_kasa_hareketleri_reference ON kasa_hareketleri(reference_type, reference_id);
        CREATE INDEX IF NOT EXISTS idx_kasa_hareketleri_branch_id ON kasa_hareketleri(branch_id);
        CREATE INDEX IF NOT EXISTS idx_kasa_hareketleri_movement_type ON kasa_hareketleri(movement_type);
    END IF;
END $$;

-- RLS (Row Level Security) politikaları
ALTER TABLE mustasil_fis ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi branch'lerindeki müstasil fişlerini görebilir
CREATE POLICY "Users can view mustasil fis from their branch" ON mustasil_fis
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
    );

-- Kullanıcılar sadece kendi branch'lerine müstasil fişi ekleyebilir
CREATE POLICY "Users can insert mustasil fis to their branch" ON mustasil_fis
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
    );

-- Kullanıcılar sadece kendi branch'lerindeki müstasil fişlerini güncelleyebilir
CREATE POLICY "Users can update mustasil fis from their branch" ON mustasil_fis
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
    );

-- Kullanıcılar sadece kendi branch'lerindeki müstasil fişlerini silebilir
CREATE POLICY "Users can delete mustasil fis from their branch" ON mustasil_fis
    FOR DELETE USING (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
    );

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_mustasil_fis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mustasil_fis_updated_at
    BEFORE UPDATE ON mustasil_fis
    FOR EACH ROW
    EXECUTE FUNCTION update_mustasil_fis_updated_at();

-- Müstasil fişi istatistikleri için view
CREATE OR REPLACE VIEW mustasil_fis_stats AS
SELECT 
    branch_id,
    DATE_TRUNC('month', fis_tarihi) as month,
    COUNT(*) as total_count,
    SUM(brut_tutar) as total_brut_tutar,
    SUM(stopaj_tutar) as total_stopaj_tutar,
    SUM(net_tutar) as total_net_tutar,
    AVG(net_tutar) as avg_net_tutar
FROM mustasil_fis
GROUP BY branch_id, DATE_TRUNC('month', fis_tarihi);

-- View için RLS
ALTER VIEW mustasil_fis_stats SET (security_invoker = true);

-- Müstasil fişi arama fonksiyonu
CREATE OR REPLACE FUNCTION search_mustasil_fis(
    p_branch_id UUID,
    p_search_term TEXT DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    fis_no VARCHAR(50),
    mustasil_adi VARCHAR(255),
    tc_no VARCHAR(11),
    brut_tutar DECIMAL(15,2),
    stopaj_tutar DECIMAL(15,2),
    net_tutar DECIMAL(15,2),
    fis_tarihi DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mf.id,
        mf.fis_no,
        mf.mustasil_adi,
        mf.tc_no,
        mf.brut_tutar,
        mf.stopaj_tutar,
        mf.net_tutar,
        mf.fis_tarihi,
        mf.created_at
    FROM mustasil_fis mf
    WHERE mf.branch_id = p_branch_id
        AND (p_search_term IS NULL OR (
            mf.mustasil_adi ILIKE '%' || p_search_term || '%' OR
            mf.tc_no ILIKE '%' || p_search_term || '%' OR
            mf.fis_no ILIKE '%' || p_search_term || '%'
        ))
        AND (p_start_date IS NULL OR mf.fis_tarihi >= p_start_date)
        AND (p_end_date IS NULL OR mf.fis_tarihi <= p_end_date)
    ORDER BY mf.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonksiyon için yetki
GRANT EXECUTE ON FUNCTION search_mustasil_fis TO authenticated;

COMMENT ON TABLE mustasil_fis IS 'Müstasil fişi (makbuzu) kayıtları - vergiden muaf üreticilerden alınan ürünler için';
COMMENT ON COLUMN mustasil_fis.fis_no IS 'Otomatik oluşturulan fiş numarası (MF-YYYY-NNNN formatında)';
COMMENT ON COLUMN mustasil_fis.tc_no IS '11 haneli T.C. Kimlik numarası';
COMMENT ON COLUMN mustasil_fis.urun_listesi IS 'JSON formatında ürün listesi (ürün adı, miktar, birim, fiyat, stopaj oranı vb.)';
COMMENT ON COLUMN mustasil_fis.stopaj_tutar IS 'Toplam stopaj tutarı (vergiler tablosuna da kaydedilir)';
COMMENT ON COLUMN mustasil_fis.net_tutar IS 'Stopaj düşüldükten sonra ödenecek net tutar';
COMMENT ON COLUMN mustasil_fis.pdf_url IS 'Oluşturulan makbuz PDF dosyasının URL\'si';