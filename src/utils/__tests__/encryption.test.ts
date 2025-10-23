import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  encryptString,
  decryptString,
  encryptApiKey,
  decryptApiKey
} from '../encryption'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('encryption', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('encryptString and decryptString', () => {
    it('string\'i şifreler ve çözebilir', async () => {
      const plaintext = 'test-secret-data'
      
      const encrypted = await encryptString(plaintext)
      expect(encrypted).toBeTruthy()
      expect(encrypted).not.toBe(plaintext)
      
      const decrypted = await decryptString(encrypted)
      expect(decrypted).toBe(plaintext)
    })

    it('uzun string\'leri şifreler ve çözebilir', async () => {
      const plaintext = 'Bu çok uzun bir test metnidir. İçinde Türkçe karakterler de var: ğüşıöç. Ve sayılar: 123456789.'
      
      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('özel karakterleri şifreler ve çözebilir', async () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('boş string\'i şifreler ve çözebilir', async () => {
      const plaintext = ''
      
      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)
      
      expect(decrypted).toBe(plaintext)
    })

    it('her şifreleme farklı sonuç üretir (IV sayesinde)', async () => {
      const plaintext = 'test-data'
      
      const encrypted1 = await encryptString(plaintext)
      const encrypted2 = await encryptString(plaintext)
      
      expect(encrypted1).not.toBe(encrypted2)
      
      // Ama ikisi de aynı plaintext\'e çözülür
      expect(await decryptString(encrypted1)).toBe(plaintext)
      expect(await decryptString(encrypted2)).toBe(plaintext)
    })

    it('şifreleme anahtarını localStorage\'a kaydeder', async () => {
      const plaintext = 'test-data'
      
      await encryptString(plaintext)
      
      const storedKey = localStorageMock.getItem('hesaponda_encryption_key')
      expect(storedKey).toBeTruthy()
      expect(() => JSON.parse(storedKey!)).not.toThrow()
    })

    it('mevcut anahtarı kullanır', async () => {
      const plaintext = 'test-data'
      
      // İlk şifreleme
      const encrypted1 = await encryptString(plaintext)
      const storedKey1 = localStorageMock.getItem('hesaponda_encryption_key')
      
      // İkinci şifreleme (aynı anahtar kullanılmalı)
      const encrypted2 = await encryptString('another-data')
      const storedKey2 = localStorageMock.getItem('hesaponda_encryption_key')
      
      expect(storedKey1).toBe(storedKey2)
      
      // Her iki şifreli veri de çözülebilmeli
      expect(await decryptString(encrypted1)).toBe(plaintext)
      expect(await decryptString(encrypted2)).toBe('another-data')
    })

    it('geçersiz şifreli veri için hata fırlatır', async () => {
      await expect(decryptString('invalid-encrypted-data')).rejects.toThrow('Veri çözülürken hata oluştu')
    })

    it('bozuk base64 için hata fırlatır', async () => {
      await expect(decryptString('not-base64!@#$')).rejects.toThrow('Veri çözülürken hata oluştu')
    })
  })

  describe('encryptApiKey and decryptApiKey', () => {
    it('API Key\'i şifreler ve çözebilir', async () => {
      const apiKey = 'my-secret-api-key-12345'
      
      const encrypted = await encryptApiKey(apiKey)
      expect(encrypted).toBeTruthy()
      expect(encrypted).not.toBe(apiKey)
      
      const decrypted = await decryptApiKey(encrypted)
      expect(decrypted).toBe(apiKey)
    })

    it('uzun API Key\'i şifreler ve çözebilir', async () => {
      const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
      
      const encrypted = await encryptApiKey(apiKey)
      const decrypted = await decryptApiKey(encrypted)
      
      expect(decrypted).toBe(apiKey)
    })

    it('boş API Key için hata fırlatır', async () => {
      await expect(encryptApiKey('')).rejects.toThrow('API Key boş olamaz')
    })

    it('sadece boşluk içeren API Key için hata fırlatır', async () => {
      await expect(encryptApiKey('   ')).rejects.toThrow('API Key boş olamaz')
    })

    it('boş şifrelenmiş API Key için hata fırlatır', async () => {
      await expect(decryptApiKey('')).rejects.toThrow('Şifrelenmiş API Key boş olamaz')
    })

    it('sadece boşluk içeren şifrelenmiş API Key için hata fırlatır', async () => {
      await expect(decryptApiKey('   ')).rejects.toThrow('Şifrelenmiş API Key boş olamaz')
    })

    it('farklı API Key\'ler farklı şifreli sonuçlar üretir', async () => {
      const apiKey1 = 'api-key-1'
      const apiKey2 = 'api-key-2'
      
      const encrypted1 = await encryptApiKey(apiKey1)
      const encrypted2 = await encryptApiKey(apiKey2)
      
      expect(encrypted1).not.toBe(encrypted2)
      
      expect(await decryptApiKey(encrypted1)).toBe(apiKey1)
      expect(await decryptApiKey(encrypted2)).toBe(apiKey2)
    })
  })

  describe('error handling', () => {
    it('şifreleme hatası için kullanıcı dostu mesaj gösterir', async () => {
      // Mock crypto.subtle.encrypt to throw error
      const originalEncrypt = crypto.subtle.encrypt
      crypto.subtle.encrypt = vi.fn().mockRejectedValue(new Error('Crypto error'))
      
      await expect(encryptString('test')).rejects.toThrow('Veri şifrelenirken hata oluştu')
      
      // Restore
      crypto.subtle.encrypt = originalEncrypt
    })

    it('çözme hatası için kullanıcı dostu mesaj gösterir', async () => {
      // Mock crypto.subtle.decrypt to throw error
      const originalDecrypt = crypto.subtle.decrypt
      crypto.subtle.decrypt = vi.fn().mockRejectedValue(new Error('Crypto error'))
      
      // First encrypt something
      const encrypted = await encryptString('test')
      
      // Then try to decrypt with mocked error
      await expect(decryptString(encrypted)).rejects.toThrow('Veri çözülürken hata oluştu')
      
      // Restore
      crypto.subtle.decrypt = originalDecrypt
    })
  })

  describe('key management', () => {
    it('bozuk anahtar varsa yeni anahtar oluşturur', async () => {
      // Store invalid key
      localStorageMock.setItem('hesaponda_encryption_key', 'invalid-json')
      
      const plaintext = 'test-data'
      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)
      
      expect(decrypted).toBe(plaintext)
      
      // Should have created new valid key
      const storedKey = localStorageMock.getItem('hesaponda_encryption_key')
      expect(() => JSON.parse(storedKey!)).not.toThrow()
    })
  })
})
