/**
 * Encryption utilities for sensitive data
 * Uses Web Crypto API for AES-GCM encryption
 */

const ENCRYPTION_KEY_NAME = 'hesaponda_encryption_key'
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

/**
 * Get or create encryption key from localStorage
 * In production, this should be managed more securely
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Try to get existing key from localStorage
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME)
  
  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey)
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Error importing stored key:', error)
      // Fall through to generate new key
    }
  }

  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )

  // Store key for future use
  const exportedKey = await crypto.subtle.exportKey('jwk', key)
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey))

  return key
}

/**
 * Encrypt a string using AES-GCM
 * @param plaintext - The string to encrypt
 * @returns Base64 encoded encrypted string with IV prepended
 */
export async function encryptString(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Get encryption key
    const key = await getEncryptionKey()

    // Encrypt data
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    )

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    // Convert to base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Veri şifrelenirken hata oluştu')
  }
}

/**
 * Decrypt a string using AES-GCM
 * @param encryptedBase64 - Base64 encoded encrypted string with IV prepended
 * @returns Decrypted plaintext string
 */
export async function decryptString(encryptedBase64: string): Promise<string> {
  try {
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))

    // Extract IV (first 12 bytes)
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    // Get encryption key
    const key = await getEncryptionKey()

    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    )

    // Convert to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Veri çözülürken hata oluştu')
  }
}

/**
 * Encrypt API key for storage
 * @param apiKey - The API key to encrypt
 * @returns Encrypted API key
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API Key boş olamaz')
  }
  return encryptString(apiKey)
}

/**
 * Decrypt API key from storage
 * @param encryptedApiKey - The encrypted API key
 * @returns Decrypted API key
 */
export async function decryptApiKey(encryptedApiKey: string): Promise<string> {
  if (!encryptedApiKey || encryptedApiKey.trim() === '') {
    throw new Error('Şifrelenmiş API Key boş olamaz')
  }
  return decryptString(encryptedApiKey)
}
