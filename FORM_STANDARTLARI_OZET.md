# Form Standartları - Özet

## 🎯 Yapılan İyileştirmeler

Uygulamadaki tüm formlarda tutarlı bir kullanıcı deneyimi sağlamak için otomatik formatlama sistemi oluşturuldu.

## ✨ Özellikler

### 1. Müşteri İsim ve Soyisim Alanları
- **Otomatik Title Case**: Her kelimenin baş harfi büyük yazılır
- **Örnek**: "ahmet yılmaz" → "Ahmet Yılmaz"
- **Not**: Sadece müşteri isim alanlarında uygulanır (firma/şube adlarında değil)

### 2. Telefon Numarası Alanları
- **Otomatik 0 Ekleme**: Başta 0 yoksa otomatik eklenir
- **Maksimum Uzunluk**: 11 karakter (0 + 10 rakam)
- **Sadece Rakam**: Harf ve özel karakterler kabul edilmez
- **Örnek**: "5321234567" → "05321234567"

### 3. E-posta Alanları
- **Otomatik Küçük Harf**: Tüm harfler küçük yazılır
- **Türkçe Karakter Dönüşümü**: ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u
- **Örnek**: "Ahmet.Şahin@Email.COM" → "ahmet.sahin@email.com"

## 📦 Oluşturulan Dosyalar

### Yardımcı Fonksiyonlar
- `src/utils/inputFormatters.ts` - Formatlama fonksiyonları
- `src/utils/__tests__/inputFormatters.test.ts` - Test dosyası

### Hook'lar
- `src/hooks/useFormattedInput.ts` - Formatlama hook'u

### Bileşenler
- `src/components/ui/formatted-input.tsx` - Formatlanmış input bileşeni
- `src/components/forms/FormattedFormField.tsx` - React Hook Form entegrasyonu

### Dokümantasyon
- `docs/FORM_STANDARTLARI.md` - Detaylı kullanım kılavuzu
- `src/components/forms/README.md` - Bileşen dokümantasyonu
- `FORM_GUNCELLEME_LISTESI.md` - Güncelleme takip listesi

## ✅ Güncellenen Formlar

1. **QuickCustomerModal** - Hızlı müşteri ekleme
2. **CustomerForm** - Müşteri ekleme/düzenleme
3. **CompanyInfoForm** - Şirket bilgileri
4. **BranchManagement** - Şube yönetimi

## 🚀 Kullanım

### Basit Kullanım
```tsx
import { FormattedInput } from '@/components/ui/formatted-input';

<FormattedInput
  formatterType="name"
  value={name}
  onChange={setName}
/>
```

### React Hook Form ile
```tsx
import { FormattedFormField } from '@/components/forms/FormattedFormField';

<FormattedFormField
  control={form.control}
  name="firstName"
  label="Ad"
  formatterType="name"
  required
/>
```

## 🎨 Formatter Tipleri

- `name` - İsim ve soyisim (Title Case)
- `phone` - Telefon numarası (0 + 10 rakam)
- `email` - E-posta (küçük harf + Türkçe karakter dönüşümü)

## 📝 Test

Test dosyasını çalıştırmak için:
```bash
npm test src/utils/__tests__/inputFormatters.test.ts
```

## 🔍 Detaylı Bilgi

Daha fazla bilgi ve kullanım örnekleri için:
- `/docs/FORM_STANDARTLARI.md` - Tam dokümantasyon
- `/src/components/forms/README.md` - Bileşen referansı
- `/FORM_GUNCELLEME_LISTESI.md` - Güncelleme durumu

## 💡 Avantajlar

✅ Tutarlı kullanıcı deneyimi  
✅ Otomatik veri temizleme  
✅ Daha az kod tekrarı  
✅ Kolay bakım  
✅ TypeScript tip güvenliği  
✅ React Hook Form entegrasyonu  
✅ Kapsamlı test coverage
