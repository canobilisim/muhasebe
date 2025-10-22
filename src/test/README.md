# Test Documentation

Bu dosya HesapOnda uygulaması için oluşturulan test altyapısını ve test dosyalarını açıklar.

## Test Altyapısı

### Kullanılan Teknolojiler

- **Vitest**: Modern ve hızlı test runner
- **React Testing Library**: React bileşenleri için test utilities
- **Jest DOM**: DOM assertion'ları için ek matcher'lar
- **User Event**: Kullanıcı etkileşimlerini simüle etmek için
- **JSDOM**: Browser ortamını simüle etmek için

### Konfigürasyon Dosyaları

- `vitest.config.ts`: Vitest ana konfigürasyonu
- `src/test/setup.ts`: Test ortamı kurulumu ve mock'lar
- `src/test/utils.tsx`: Test utilities ve custom render fonksiyonu

## Test Kategorileri

### 1. Unit Tests (Birim Testler)

#### Utility Functions (`src/lib/__tests__/`)
- `utils.test.ts`: `cn()` ve `formatCurrency()` fonksiyonları için testler

#### Store Tests (`src/stores/__tests__/`)
- `posStore.test.ts`: POS store actions ve state management testleri
  - Cart management (sepet yönetimi)
  - Customer selection (müşteri seçimi)
  - Payment processing (ödeme işlemi)
  - Totals calculation (toplam hesaplama)

#### Component Tests (`src/components/**/__tests__/`)
- `button.test.tsx`: Button bileşeni için testler
- `BarcodeInput.test.tsx`: Barkod input bileşeni için testler

### 2. Integration Tests (Entegrasyon Testleri)

#### POS Sales Flow (`src/test/integration/pos-sales-flow.test.tsx`)
- Tam satış akışı testleri
- Ürün arama → sepete ekleme → ödeme alma
- Çoklu ürün senaryoları
- Hata durumları (stok yok, ödeme hatası)
- Kredi ödemeleri

#### API Calls (`src/test/integration/api-calls.test.ts`)
- ProductService API testleri
- CustomerService API testleri
- SalesService API testleri
- Hata yönetimi testleri
- Database constraint testleri

#### Form Submissions (`src/test/integration/form-submissions.test.tsx`)
- CustomerForm testleri
- ProductForm testleri
- Form validasyon testleri
- Hata durumu testleri

## Test Komutları

```bash
# Tüm testleri çalıştır
npm run test

# Testleri bir kez çalıştır (CI için)
npm run test:run

# Test UI'ını aç
npm run test:ui

# Belirli bir test dosyasını çalıştır
npx vitest run src/lib/__tests__/utils.test.ts

# Test runner script'ini çalıştır
node src/test/run-tests.js
```

## Mock'lar ve Stub'lar

### Supabase Mock
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { /* auth methods */ },
    from: vi.fn(() => ({ /* database methods */ }))
  }
}))
```

### Store Mock'ları
```typescript
vi.mock('@/stores/posStore')
vi.mock('@/stores/authStore')
```

### Service Mock'ları
```typescript
vi.mock('@/services/productService')
vi.mock('@/services/customerService')
vi.mock('@/services/salesService')
```

## Test Yazma Rehberi

### Unit Test Örneği
```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../utils'

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(100)).toBe('₺100,00')
  })
})
```

### Component Test Örneği
```typescript
import { render, screen, fireEvent } from '@/test/utils'
import { Button } from '../button'

it('should handle click events', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Integration Test Örneği
```typescript
it('should complete full sales flow', async () => {
  render(<POSLayout />)
  
  // Ürün ara
  const barcodeInput = screen.getByPlaceholderText('Barkod okutun...')
  fireEvent.change(barcodeInput, { target: { value: '1234567890' } })
  fireEvent.keyDown(barcodeInput, { key: 'Enter' })
  
  // Ödeme al
  const payButton = screen.getByText('Ödeme Al')
  fireEvent.click(payButton)
  
  await waitFor(() => {
    expect(mockProcessPayment).toHaveBeenCalled()
  })
})
```

## Test Coverage

### Kapsanan Alanlar
- ✅ Utility functions
- ✅ Store actions ve state management
- ✅ UI bileşenleri
- ✅ POS satış akışı
- ✅ API çağrıları
- ✅ Form validasyonları
- ✅ Hata yönetimi

### Gelecek İyileştirmeler
- E2E testler (Playwright/Cypress)
- Visual regression testler
- Performance testler
- Accessibility testler

## Troubleshooting

### Yaygın Sorunlar

1. **Mock'lar çalışmıyor**
   - `vi.mock()` çağrılarının import'lardan önce olduğundan emin olun
   - Mock'ların doğru path'lerde tanımlandığını kontrol edin

2. **CSS import hataları**
   - `vitest.config.ts`'de `css: false` ayarı yapıldı
   - `setup.ts`'de CSS mock'ları eklendi

3. **Path alias sorunları**
   - `vitest.config.ts`'de `@` alias'ı tanımlandı
   - TypeScript konfigürasyonunda vitest types eklendi

4. **Async test sorunları**
   - `waitFor()` kullanarak async işlemleri bekleyin
   - `vi.clearAllMocks()` ile mock'ları temizleyin

## Katkıda Bulunma

Yeni test eklerken:
1. Uygun kategoride (`unit` veya `integration`) test dosyası oluşturun
2. Açıklayıcı test isimleri kullanın
3. Mock'ları doğru şekilde yapılandırın
4. Edge case'leri test edin
5. Test dokümantasyonunu güncelleyin