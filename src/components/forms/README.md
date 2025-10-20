# Form Bileşenleri

Bu klasör, uygulamadaki form standartlarını sağlayan yeniden kullanılabilir bileşenleri içerir.

## FormattedFormField

React Hook Form ile kullanım için optimize edilmiş, otomatik formatlama özellikli form alanı bileşeni.

### Kullanım

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

### Props

- `control`: React Hook Form control objesi
- `name`: Form alanının adı
- `label`: Alan etiketi
- `formatterType`: Formatlama tipi (`name`, `phone`, `email`, `tckn`, `taxNumber`)
- `placeholder`: (Opsiyonel) Placeholder metni
- `disabled`: (Opsiyonel) Alan devre dışı mı?
- `required`: (Opsiyonel) Zorunlu alan mı?

## Formatter Tipleri

### `name`
- Her kelimenin baş harfini büyük yapar
- Örnek: "ahmet yılmaz" → "Ahmet Yılmaz"

### `phone`
- Otomatik olarak "0" ile başlar
- Maksimum 11 karakter
- Sadece rakam kabul eder
- Örnek: "5321234567" → "05321234567"

### `email`
- Tüm harfleri küçük yapar
- Türkçe karakterleri İngilizce karşılıklarına çevirir
- Örnek: "Ahmet.Şahin@Email.COM" → "ahmet.sahin@email.com"

## Daha Fazla Bilgi

Detaylı kullanım örnekleri ve dokümantasyon için: `/docs/FORM_STANDARTLARI.md`
