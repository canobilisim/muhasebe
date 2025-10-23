import { describe, it, expect } from 'vitest'
import {
  calculateVatPrices,
  calculateVatAmount,
  calculateVatExcluded,
  calculateVatIncluded,
  calculateTotalWithVat
} from '../vatCalculator'

describe('vatCalculator', () => {
  describe('calculateVatPrices', () => {
    it('KDV hariç fiyattan KDV dahil fiyat hesaplar', () => {
      const result = calculateVatPrices(100, 20, false)
      expect(result.vatExcluded).toBe(100)
      expect(result.vatIncluded).toBe(120)
      expect(result.vatAmount).toBe(20)
    })

    it('KDV dahil fiyattan KDV hariç fiyat hesaplar', () => {
      const result = calculateVatPrices(120, 20, true)
      expect(result.vatExcluded).toBe(100)
      expect(result.vatIncluded).toBe(120)
      expect(result.vatAmount).toBe(20)
    })

    it('%0 KDV oranı ile çalışır', () => {
      const result = calculateVatPrices(100, 0, false)
      expect(result.vatExcluded).toBe(100)
      expect(result.vatIncluded).toBe(100)
      expect(result.vatAmount).toBe(0)
    })

    it('%1 KDV oranı ile çalışır', () => {
      const result = calculateVatPrices(100, 1, false)
      expect(result.vatExcluded).toBe(100)
      expect(result.vatIncluded).toBe(101)
      expect(result.vatAmount).toBe(1)
    })

    it('%10 KDV oranı ile çalışır', () => {
      const result = calculateVatPrices(100, 10, false)
      expect(result.vatExcluded).toBe(100)
      expect(result.vatIncluded).toBe(110)
      expect(result.vatAmount).toBe(10)
    })

    it('ondalıklı fiyatlarla çalışır', () => {
      const result = calculateVatPrices(99.99, 20, false)
      expect(result.vatExcluded).toBe(99.99)
      expect(result.vatIncluded).toBe(119.99)
      expect(result.vatAmount).toBe(20)
    })

    it('sonuçları 2 ondalık basamağa yuvarlar', () => {
      const result = calculateVatPrices(33.33, 20, false)
      expect(result.vatIncluded).toBe(40)
      expect(result.vatAmount).toBe(6.67)
    })

    it('negatif fiyat için hata fırlatır', () => {
      expect(() => calculateVatPrices(-100, 20, false)).toThrow('Fiyat negatif olamaz')
    })

    it('negatif KDV oranı için hata fırlatır', () => {
      expect(() => calculateVatPrices(100, -5, false)).toThrow('KDV oranı 0-100 arası olmalıdır')
    })

    it('100\'den büyük KDV oranı için hata fırlatır', () => {
      expect(() => calculateVatPrices(100, 150, false)).toThrow('KDV oranı 0-100 arası olmalıdır')
    })

    it('sıfır fiyat ile çalışır', () => {
      const result = calculateVatPrices(0, 20, false)
      expect(result.vatExcluded).toBe(0)
      expect(result.vatIncluded).toBe(0)
      expect(result.vatAmount).toBe(0)
    })
  })

  describe('calculateVatAmount', () => {
    it('KDV hariç fiyattan KDV tutarını hesaplar', () => {
      const vatAmount = calculateVatAmount(100, 20, false)
      expect(vatAmount).toBe(20)
    })

    it('KDV dahil fiyattan KDV tutarını hesaplar', () => {
      const vatAmount = calculateVatAmount(120, 20, true)
      expect(vatAmount).toBe(20)
    })

    it('%10 KDV ile çalışır', () => {
      const vatAmount = calculateVatAmount(100, 10, false)
      expect(vatAmount).toBe(10)
    })

    it('%1 KDV ile çalışır', () => {
      const vatAmount = calculateVatAmount(100, 1, false)
      expect(vatAmount).toBe(1)
    })
  })

  describe('calculateVatExcluded', () => {
    it('KDV dahil fiyattan KDV hariç fiyat hesaplar', () => {
      const vatExcluded = calculateVatExcluded(120, 20)
      expect(vatExcluded).toBe(100)
    })

    it('%10 KDV ile çalışır', () => {
      const vatExcluded = calculateVatExcluded(110, 10)
      expect(vatExcluded).toBe(100)
    })

    it('ondalıklı değerlerle çalışır', () => {
      const vatExcluded = calculateVatExcluded(119.99, 20)
      expect(vatExcluded).toBe(99.99)
    })
  })

  describe('calculateVatIncluded', () => {
    it('KDV hariç fiyattan KDV dahil fiyat hesaplar', () => {
      const vatIncluded = calculateVatIncluded(100, 20)
      expect(vatIncluded).toBe(120)
    })

    it('%10 KDV ile çalışır', () => {
      const vatIncluded = calculateVatIncluded(100, 10)
      expect(vatIncluded).toBe(110)
    })

    it('ondalıklı değerlerle çalışır', () => {
      const vatIncluded = calculateVatIncluded(99.99, 20)
      expect(vatIncluded).toBe(119.99)
    })
  })

  describe('calculateTotalWithVat', () => {
    it('tek ürün için toplam hesaplar', () => {
      const items = [
        { price: 100, quantity: 1, vatRate: 20 }
      ]
      const result = calculateTotalWithVat(items, false)
      
      expect(result.subtotal).toBe(100)
      expect(result.totalVat).toBe(20)
      expect(result.grandTotal).toBe(120)
    })

    it('çoklu ürün için toplam hesaplar', () => {
      const items = [
        { price: 100, quantity: 2, vatRate: 20 },
        { price: 50, quantity: 1, vatRate: 10 }
      ]
      const result = calculateTotalWithVat(items, false)
      
      expect(result.subtotal).toBe(250) // (100*2) + (50*1)
      expect(result.totalVat).toBe(45) // (200*0.2) + (50*0.1)
      expect(result.grandTotal).toBe(295)
    })

    it('farklı KDV oranlarıyla çalışır', () => {
      const items = [
        { price: 100, quantity: 1, vatRate: 0 },
        { price: 100, quantity: 1, vatRate: 1 },
        { price: 100, quantity: 1, vatRate: 10 },
        { price: 100, quantity: 1, vatRate: 20 }
      ]
      const result = calculateTotalWithVat(items, false)
      
      expect(result.subtotal).toBe(400)
      expect(result.totalVat).toBe(31) // 0 + 1 + 10 + 20
      expect(result.grandTotal).toBe(431)
    })

    it('KDV dahil fiyatlarla çalışır', () => {
      const items = [
        { price: 120, quantity: 1, vatRate: 20 }
      ]
      const result = calculateTotalWithVat(items, true)
      
      expect(result.subtotal).toBe(100)
      expect(result.totalVat).toBe(20)
      expect(result.grandTotal).toBe(120)
    })

    it('ondalıklı miktarlarla çalışır', () => {
      const items = [
        { price: 10.50, quantity: 3, vatRate: 20 }
      ]
      const result = calculateTotalWithVat(items, false)
      
      expect(result.subtotal).toBe(31.5)
      expect(result.totalVat).toBe(6.3)
      expect(result.grandTotal).toBe(37.8)
    })

    it('boş liste için sıfır döner', () => {
      const result = calculateTotalWithVat([], false)
      
      expect(result.subtotal).toBe(0)
      expect(result.totalVat).toBe(0)
      expect(result.grandTotal).toBe(0)
    })

    it('sonuçları 2 ondalık basamağa yuvarlar', () => {
      const items = [
        { price: 33.33, quantity: 1, vatRate: 20 }
      ]
      const result = calculateTotalWithVat(items, false)
      
      expect(result.subtotal).toBe(33.33)
      expect(result.totalVat).toBe(6.67)
      expect(result.grandTotal).toBe(40)
    })
  })
})
