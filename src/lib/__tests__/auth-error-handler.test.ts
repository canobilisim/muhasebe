import { describe, it, expect } from 'vitest'
import { AuthErrorHandler } from '../auth-error-handler'

describe('AuthErrorHandler', () => {
  describe('categorize', () => {
    it('should categorize connection errors', () => {
      const error = new Error('Network request failed')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('connection')
    })

    it('should categorize authentication errors', () => {
      const error = new Error('Invalid login credentials')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('auth')
    })

    it('should categorize authorization errors', () => {
      const error = new Error('Access denied')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('authorization')
    })

    it('should categorize system errors', () => {
      const error = new Error('Something went wrong')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('system')
    })
  })

  describe('getUserMessage', () => {
    it('should return Turkish message for connection timeout', () => {
      const error = new Error('Connection timeout')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.message).toContain('zaman aşımına')
    })

    it('should return Turkish message for invalid credentials', () => {
      const error = new Error('Invalid login credentials')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.message).toContain('E-posta veya şifre hatalı')
    })

    it('should return Turkish message for inactive user', () => {
      const error = new Error('User account is inactive')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.message).toContain('devre dışı')
    })

    it('should return Turkish message for profile not found', () => {
      const error = new Error('Profile not found')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.message).toContain('profili bulunamadı')
    })
  })

  describe('getDevMessage', () => {
    it('should include error stack trace', () => {
      const error = new Error('Test error')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.devMessage).toContain('Error: Test error')
    })

    it('should handle non-Error objects', () => {
      const error = { message: 'Custom error', code: 500 }
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.devMessage).toContain('Custom error')
    })

    it('should handle string errors', () => {
      const error = 'Simple error string'
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.devMessage).toBe('Simple error string')
    })
  })

  describe('handle', () => {
    it('should return complete AuthError object', () => {
      const error = new Error('Test error')
      const result = AuthErrorHandler.handle(error, 'signIn:test')
      
      expect(result).toHaveProperty('category')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('devMessage')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('context')
      expect(result.context).toBe('signIn:test')
    })

    it('should include timestamp in ISO format', () => {
      const error = new Error('Test error')
      const result = AuthErrorHandler.handle(error, 'test')
      
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('error message extraction', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test message')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.devMessage).toContain('Test message')
    })

    it('should handle object with message property', () => {
      const error = { message: 'Object error message' }
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.devMessage).toContain('Object error message')
    })

    it('should handle object with error property', () => {
      const error = { error: 'Error property message' }
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.devMessage).toContain('Error property message')
    })
  })

  describe('specific error scenarios', () => {
    it('should handle CORS errors', () => {
      const error = new Error('CORS policy blocked')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('connection')
      expect(result.message).toContain('yapılandırma hatası')
    })

    it('should handle email not confirmed', () => {
      const error = new Error('Email not confirmed')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('auth')
      expect(result.message).toContain('onaylanmamış')
    })

    it('should handle branch assignment errors', () => {
      const error = new Error('Branch assignment missing')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.category).toBe('authorization')
      expect(result.message).toContain('Şube ataması')
    })

    it('should handle session errors', () => {
      const error = new Error('Session expired')
      const result = AuthErrorHandler.handle(error, 'test')
      expect(result.message).toContain('Oturum hatası')
    })
  })
})
