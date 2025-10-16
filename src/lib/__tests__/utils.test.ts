import { describe, it, expect } from 'vitest'
import { cn, formatCurrency } from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(100)).toBe('₺100,00')
      expect(formatCurrency(1234.56)).toBe('₺1.234,56')
    })

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('₺0,00')
    })

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-100)).toBe('-₺100,00')
    })

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(10.5)).toBe('₺10,50')
      expect(formatCurrency(10.123)).toBe('₺10,12')
    })
  })
})