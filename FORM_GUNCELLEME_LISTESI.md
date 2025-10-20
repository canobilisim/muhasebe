# Form Güncelleme Listesi

Bu dosya, yeni form standartlarının uygulanması gereken dosyaları listeler.

## ✅ Tamamlanan Güncellemeler

- [x] `src/components/pos/QuickCustomerModal.tsx` - Hızlı müşteri ekleme formu güncellendi
- [x] `src/components/customers/CustomerForm.tsx` - Müşteri ekleme/düzenleme formu güncellendi
- [x] `src/components/settings/CompanyInfoForm.tsx` - Şirket bilgileri formu güncellendi
- [x] `src/components/settings/BranchManagement.tsx` - Şube yönetimi formu güncellendi

## 📋 Güncellenmesi Gereken Formlar

Aşağıdaki dosyalarda isim, telefon ve e-posta alanları bulunabilir ve kontrol edilmelidir:

### Kullanıcı Yönetimi
- [ ] `src/pages/SettingsPage.tsx` - Kullanıcı ekleme/düzenleme formu (varsa)
- [ ] `src/components/settings/UserForm.tsx` (varsa)

### Tedarikçi Yönetimi
- [ ] `src/pages/SuppliersPage.tsx` (varsa) - Tedarikçi ekleme/düzenleme formu
- [ ] `src/components/suppliers/SupplierForm.tsx` (varsa)

## Güncelleme Adımları

Her form için:

1. İlgili dosyayı aç
2. `FormattedInput` bileşenini import et:
   ```tsx
   import { FormattedInput } from '@/components/ui/formatted-input';
   ```

3. İsim alanlarını güncelle:
   ```tsx
   // Önce:
   <Input value={name} onChange={(e) => setName(e.target.value)} />
   
   // Sonra:
   <FormattedInput 
     formatterType="name" 
     value={name} 
     onChange={setName} 
   />
   ```

4. Telefon alanlarını güncelle:
   ```tsx
   // Önce:
   <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
   
   // Sonra:
   <FormattedInput 
     formatterType="phone" 
     value={phone} 
     onChange={setPhone} 
   />
   ```

5. E-posta alanlarını güncelle:
   ```tsx
   // Önce:
   <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
   
   // Sonra:
   <FormattedInput 
     formatterType="email" 
     value={email} 
     onChange={setEmail} 
   />
   ```

6. Telefon alanı için başlangıç değerini '0' olarak ayarla:
   ```tsx
   const [phone, setPhone] = useState('0');
   ```

7. Telefon validasyonunu güncelle:
   ```tsx
   // Önce:
   if (phone && !/^[0-9\s\-\+\(\)]+$/.test(phone)) {
     errors.phone = 'Geçerli bir telefon numarası giriniz';
   }
   
   // Sonra:
   if (phone && phone !== '0' && phone.length !== 11) {
     errors.phone = 'Telefon numarası 11 haneli olmalıdır (0 ile başlayarak)';
   }
   ```

## React Hook Form Kullanan Formlar İçin

Eğer form React Hook Form kullanıyorsa, `FormattedFormField` bileşenini kullan:

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

## Test

Her güncelleme sonrası:
1. Formu aç ve test et
2. İsim alanına küçük harf yaz, otomatik büyük harfe dönüşmeli
3. Telefon alanına 0 olmadan numara yaz, başına 0 eklenmeli
4. E-posta alanına büyük harf ve Türkçe karakter yaz, otomatik düzeltilmeli

## Dokümantasyon

- Detaylı kullanım: `/docs/FORM_STANDARTLARI.md`
- Bileşen dokümantasyonu: `/src/components/forms/README.md`
- Test dosyası: `/src/utils/__tests__/inputFormatters.test.ts`
