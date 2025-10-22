# Supabase Database Setup

Bu dosya HesapOnda uygulaması için Supabase veritabanı kurulum talimatlarını içerir.

## Kurulum Adımları

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını girin: "hesaponda"
4. Güçlü bir veritabanı şifresi belirleyin
5. Bölge seçin (Europe West için "eu-west-1" önerilir)
6. "Create new project" butonuna tıklayın

### 2. Migration Dosyalarını Çalıştırma

Supabase projeniz hazır olduktan sonra, SQL Editor'da aşağıdaki dosyaları sırasıyla çalıştırın:

1. `001_initial_schema.sql` - Temel tablo yapısı
2. `002_rls_policies.sql` - Row Level Security politikaları
3. `003_functions_triggers.sql` - Fonksiyonlar ve tetikleyiciler
4. `seed.sql` - Örnek veriler (opsiyonel)

### 3. Environment Variables

Proje kurulumu tamamlandıktan sonra, aşağıdaki bilgileri `.env` dosyanıza ekleyin:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Bu bilgileri Supabase Dashboard > Settings > API bölümünden alabilirsiniz.

### 4. Authentication Ayarları

Supabase Dashboard > Authentication > Settings bölümünde:

1. "Enable email confirmations" seçeneğini kapatın (geliştirme için)
2. "Enable phone confirmations" seçeneğini kapatın
3. Site URL'ini ayarlayın: `http://localhost:5173` (geliştirme için)

### 5. İlk Kullanıcı Oluşturma

Uygulama çalıştırıldıktan sonra:

1. İlk kullanıcıyı kayıt edin
2. Supabase Dashboard > Authentication > Users bölümünden kullanıcının UUID'sini kopyalayın
3. SQL Editor'da aşağıdaki komutu çalıştırarak kullanıcıyı `users` tablosuna ekleyin:

```sql
INSERT INTO users (id, branch_id, email, full_name, role) VALUES
('user_uuid_here', '550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', 'Admin User', 'admin');
```

## Tablo Yapısı

### Ana Tablolar

- **branches**: Şube bilgileri (multi-tenant yapı için)
- **users**: Kullanıcı bilgileri (Supabase Auth ile entegre)
- **products**: Ürün bilgileri ve stok
- **customers**: Müşteri bilgileri ve borç takibi
- **sales**: Satış işlemleri (vade tarihi takibi dahil)
- **sale_items**: Satış kalem detayları
- **cash_movements**: Kasa hareketleri

### Önemli Özellikler

- **Row Level Security (RLS)**: Şube bazlı veri izolasyonu
- **Otomatik Tetikleyiciler**: Stok güncellemeleri, müşteri bakiye hesaplamaları
- **Fonksiyonlar**: Satış numarası üretimi, raporlama fonksiyonları
- **İndeksler**: Performans optimizasyonu için gerekli indeksler
- **Vade Takibi**: Açık hesap satışlar için vade tarihi ve vadesi geçmiş satış sorguları

## Güvenlik

- Tüm tablolarda RLS aktif
- Kullanıcılar sadece kendi şubelerinin verilerine erişebilir
- Admin kullanıcılar tüm şubelere erişebilir
- Rol bazlı yetkilendirme (admin, manager, cashier)

## Geliştirme Notları

- Migration dosyaları sıralı olarak çalıştırılmalıdır
- Seed data sadece geliştirme ortamı için kullanılmalıdır
- Production ortamında RLS politikalarının test edilmesi önemlidir
- Backup stratejisi oluşturulmalıdır