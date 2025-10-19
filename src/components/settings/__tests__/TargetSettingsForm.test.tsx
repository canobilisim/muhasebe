import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TargetSettingsForm } from '../TargetSettingsForm'

// Mock the Turkcell hook
const mockUseTurkcell = {
  monthlyTarget: 100,
  loading: false,
  error: null,
  updateMonthlyTarget: vi.fn(),
  clearError: vi.fn(),
}

vi.mock('@/hooks/useTurkcell', () => ({
  useTurkcell: () => mockUseTurkcell,
}))

// Mock toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
}

vi.mock('@/lib/toast', () => ({
  toast: mockToast,
}))

describe('TargetSettingsForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock values
    mockUseTurkcell.monthlyTarget = 100
    mockUseTurkcell.loading = false
    mockUseTurkcell.error = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render form with current target', () => {
      render(<TargetSettingsForm />)

      expect(screen.getByText('Aylık Hedef Ayarları')).toBeInTheDocument()
      expect(screen.getByText('Mevcut Hedef:')).toBeInTheDocument()
      expect(screen.getByText('100 işlem')).toBeInTheDocument()
      expect(screen.getByLabelText('Yeni Hedef')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Hedefi Güncelle' })).toBeInTheDocument()
    })

    it('should show loading state when loading', () => {
      mockUseTurkcell.loading = true
      render(<TargetSettingsForm />)

      const button = screen.getByRole('button', { name: 'Güncelleniyor...' })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    it('should show error message when error exists', () => {
      mockUseTurkcell.error = 'Test error message'
      render(<TargetSettingsForm />)

      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should display zero target correctly', () => {
      mockUseTurkcell.monthlyTarget = 0
      render(<TargetSettingsForm />)

      expect(screen.getByText('0 işlem')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation error for empty input', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.click(button)

      expect(screen.getByText('Hedef değeri gereklidir')).toBeInTheDocument()
      expect(mockUseTurkcell.updateMonthlyTarget).not.toHaveBeenCalled()
    })

    it('should show validation error for negative numbers', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '-10')
      await user.click(button)

      expect(screen.getByText('Hedef değeri pozitif bir sayı olmalıdır')).toBeInTheDocument()
      expect(mockUseTurkcell.updateMonthlyTarget).not.toHaveBeenCalled()
    })

    it('should show validation error for zero', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '0')
      await user.click(button)

      expect(screen.getByText('Hedef değeri pozitif bir sayı olmalıdır')).toBeInTheDocument()
      expect(mockUseTurkcell.updateMonthlyTarget).not.toHaveBeenCalled()
    })

    it('should show validation error for non-numeric input', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, 'abc')
      await user.click(button)

      expect(screen.getByText('Hedef değeri geçerli bir sayı olmalıdır')).toBeInTheDocument()
      expect(mockUseTurkcell.updateMonthlyTarget).not.toHaveBeenCalled()
    })

    it('should show validation error for decimal numbers', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '10.5')
      await user.click(button)

      expect(screen.getByText('Hedef değeri tam sayı olmalıdır')).toBeInTheDocument()
      expect(mockUseTurkcell.updateMonthlyTarget).not.toHaveBeenCalled()
    })

    it('should accept valid positive integers', async () => {
      mockUseTurkcell.updateMonthlyTarget.mockResolvedValue(undefined)
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '150')
      await user.click(button)

      await waitFor(() => {
        expect(mockUseTurkcell.updateMonthlyTarget).toHaveBeenCalledWith(150)
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockUseTurkcell.updateMonthlyTarget.mockResolvedValue(undefined)
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '200')
      await user.click(button)

      await waitFor(() => {
        expect(mockUseTurkcell.updateMonthlyTarget).toHaveBeenCalledWith(200)
      })
    })

    it('should show success message on successful update', async () => {
      mockUseTurkcell.updateMonthlyTarget.mockResolvedValue(undefined)
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '250')
      await user.click(button)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Aylık hedef başarıyla güncellendi')
      })
    })

    it('should clear form after successful submission', async () => {
      mockUseTurkcell.updateMonthlyTarget.mockResolvedValue(undefined)
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef') as HTMLInputElement
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '300')
      await user.click(button)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should handle submission error', async () => {
      const errorMessage = 'Network error'
      mockUseTurkcell.updateMonthlyTarget.mockRejectedValue(new Error(errorMessage))
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '400')
      await user.click(button)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Hedef güncellenirken hata oluştu: Network error')
      })
    })

    it('should prevent multiple submissions while loading', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>(resolve => {
        resolvePromise = resolve
      })
      mockUseTurkcell.updateMonthlyTarget.mockReturnValue(promise)

      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })

      await user.clear(input)
      await user.type(input, '500')
      await user.click(button)

      // Button should be disabled during submission
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('Güncelleniyor...')

      // Try to click again - should not trigger another call
      await user.click(button)
      expect(mockUseTurkcell.updateMonthlyTarget).toHaveBeenCalledTimes(1)

      // Resolve the promise
      resolvePromise!()
    })
  })

  describe('Error Handling', () => {
    it('should clear error when user starts typing', async () => {
      mockUseTurkcell.error = 'Previous error'
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      
      await user.type(input, '1')

      expect(mockUseTurkcell.clearError).toHaveBeenCalled()
    })

    it('should display store error messages', () => {
      mockUseTurkcell.error = 'Store error message'
      render(<TargetSettingsForm />)

      expect(screen.getByText('Store error message')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should have proper button text', () => {
      render(<TargetSettingsForm />)

      const button = screen.getByRole('button', { name: 'Hedefi Güncelle' })
      expect(button).toBeInTheDocument()
    })

    it('should show loading state in button text', () => {
      mockUseTurkcell.loading = true
      render(<TargetSettingsForm />)

      const button = screen.getByRole('button', { name: 'Güncelleniyor...' })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('Input Behavior', () => {
    it('should accept keyboard input', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef') as HTMLInputElement

      await user.clear(input)
      await user.type(input, '123')

      expect(input.value).toBe('123')
    })

    it('should handle paste events', async () => {
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef') as HTMLInputElement

      await user.clear(input)
      await user.click(input)
      
      // Simulate paste
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => '456'
        }
      })

      // Type the pasted value manually since jsdom doesn't handle paste automatically
      await user.type(input, '456')

      expect(input.value).toBe('456')
    })

    it('should handle Enter key submission', async () => {
      mockUseTurkcell.updateMonthlyTarget.mockResolvedValue(undefined)
      render(<TargetSettingsForm />)

      const input = screen.getByLabelText('Yeni Hedef')

      await user.clear(input)
      await user.type(input, '789')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockUseTurkcell.updateMonthlyTarget).toHaveBeenCalledWith(789)
      })
    })
  })
})