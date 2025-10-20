# Form Standartları ve Kullanım Kılavuzu

Bu dokümantasyon, uygulamadaki tüm formlarda tutarlı input davranışı sağlamak için oluşturulan standartları açıklar.

## Standartlar

### 1. İsim ve Soyisim Alanları
- Her kelimenin baş harfi otomatik olarak büyük yazılır
- Örnek: "ahmet yılmaz" → "Ahmet Yılmaz"

### 2. Telefon Numarası Alanları
- Otomatik olarak "0" ile başlar
- Maksimum 11 karakter (0 + 10 rakam)
- Sadece rakam kabul eder
- Örnek: "5321234567" → "05321234567"

### 3. E-posta Alanları
- Tüm harfler otomatik olarak küçük yazılır
- Türkçe karakterler İngilizce karşılıklarına çevrilir
  - ç → c, ğ → g, ı → i, ö → o, ş → s, ü → u
- Örnek: "Ahmet.Şahin@Email.COM" → "ahmet.sahin@email.com"

## Kullanım

### Yöntem 1: FormattedFormField (Önerilen - React Hook Form ile)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { FormattedFormField } from '@/components/forms/FormattedFormField';

const formSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  phone: z.string().length(11, 'Telefon numarası 11 haneli olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '0',
      email: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormattedFormField
          control={form.control}
          name="firstName"
          label="Ad"
          formatterType="name"
          required
        />
        
        <FormattedFormField
          control={form.control}
          name="lastName"
          label="Soyad"
          formatterType="name"
          required
        />
        
        <FormattedFormField
          control={form.control}
          name="phone"
          label="Telefon"
          formatterType="phone"
          required
        />
        
        <FormattedFormField
          control={form.control}
          name="email"
          label="E-posta"
          formatterType="email"
          required
        />
      </form>
    </Form>
  );
}
```

### Yöntem 2: FormattedInput (Bağımsız Kullanım)

```tsx
import { FormattedInput } from '@/components/ui/formatted-input';

function MyComponent() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0');
  const [email, setEmail] = useState('');

  return (
    <div>
      <FormattedInput
        formatterType="name"
        value={name}
        onChange={setName}
        placeholder="Ad Soyad"
      />
      
      <FormattedInput
        formatterType="phone"
        value={phone}
        onChange={setPhone}
      />
      
      <FormattedInput
        formatterType="email"
        value={email}
        onChange={setEmail}
      />
    </div>
  );
}
```

### Yöntem 3: Yardımcı Fonksiyonlar (Manuel Kullanım)

```tsx
import {
  formatNameToTitleCase,
  formatPhoneNumber,
  formatEmail
} from '@/utils/inputFormatters';

// Direkt kullanım
const formattedName = formatNameToTitleCase('ahmet yılmaz'); // "Ahmet Yılmaz"
const formattedPhone = formatPhoneNumber('5321234567'); // "05321234567"
const formattedEmail = formatEmail('Ahmet.Şahin@Email.COM'); // "ahmet.sahin@email.com"
```

## Mevcut Formatter Tipleri

- `name`: İsim ve soyisim formatlaması
- `phone`: Telefon numarası formatlaması
- `email`: E-posta formatlaması

## Mevcut Formlarda Güncelleme

Uygulamadaki mevcut formları güncellemek için:

1. `FormattedFormField` bileşenini import edin
2. Standart `FormField` yerine `FormattedFormField` kullanın
3. Uygun `formatterType` prop'unu ekleyin

### Örnek Güncelleme

**Önce:**
```tsx
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Ad</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

**Sonra:**
```tsx
<FormattedFormField
  control={form.control}
  name="firstName"
  label="Ad"
  formatterType="name"
  required
/>
```

## Avantajlar

✅ Tutarlı kullanıcı deneyimi
✅ Otomatik veri temizleme ve formatlama
✅ Daha az kod tekrarı
✅ Kolay bakım ve güncelleme
✅ Tip güvenliği (TypeScript)
✅ React Hook Form ile tam entegrasyon
