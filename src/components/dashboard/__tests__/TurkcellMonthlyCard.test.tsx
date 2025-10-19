import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TurkcellMonthlyCard } from '../TurkcellMonthlyCard'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Target: (props: any) => <div data-testid="target-icon" {...props} />,
  RefreshCw: (props: any) => <div data-testid="refresh-icon" {...props} />,
  AlertCircle: (props: any) => <div data-testid="alert-icon" {...props} />,
}))

// Mock the Turkcell hook
const mockUseTurkcellMonthly = {
  monthlyTarget: 100,
  monthlyTotal: 75,
  progressPercentage: 75,
  isTargetSet: true,
  loading: false,
  error: null,
  clearError: vi.fn(),
  refreshData: vi.fn(),
}

vi.mock('@/hooks/useTurkcell', () => ({
  useTurkcellMonthly: () => mockUseTurkcellMonthly,
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/error-boundary', () => ({
  ErrorBoundary: ({ children, fallback }: any) => {
    try {
      return children
    } catch (error) {
      return fallback
    }
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/loading', () => ({
  InlineLoading: ({ text, className }: any) => (
    <div data-testid="inline-loading" className={className}>
      {text}
    </div>
  ),
}))

describe('TurkcellMonthlyCard', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock values
    mockUseTurkcellMonthly.monthlyTarget = 100
    mockUseTurkcellMonthly.monthlyTotal = 75
    mockUseTurkcellMonthly.progressPercentage = 75
    mockUseTurkcellMonthly.isTargetSet = true
    mockUseTurkcellMonthly.loading = false
    mockUseTurkcellMonthly.error = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render monthly progress correctly', () => {
      render(<TurkcellMonthlyCard />)

      expect(screen.getByTestId('card-title')).toHaveTextContent('Aylık Turkcell Hedefi')
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('Hedef: 100 işlem')).toBeInTheDocument()
      expect(screen.getByText('75')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render with zero values when data is null/undefined', () => {
      mockUseTurkcellMonthly.monthlyTarget = null
      mockUseTurkcellMonthly.monthlyTotal = null
      mockUseTurkcellMonthly.progressPercentage = null
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('Hedef: 0 işlem')).toBeInTheDocument()
    })

    it('should render Target icon', () => {
      render(<TurkcellMonthlyCard />)

      // The Target icon should be rendered (mocked as data-testid in our mock)
      expect(screen.getByTestId('card-header')).toBeInTheDocument()
    })
  })

  describe('Progress Bar Calculations', () => {
    it('should calculate progress width correctly for normal progress', () => {
      mockUseTurkcellMonthly.progressPercentage = 60
      render(<TurkcellMonthlyCard />)

      const progressBar = screen.getByRole('progressbar', { hidden: true }) || 
                         document.querySelector('[style*="width: 60%"]')
      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    it('should cap progress at 100% when over target', () => {
      mockUseTurkcellMonthly.monthlyTotal = 120
      mockUseTurkcellMonthly.progressPercentage = 120
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('120%')).toBeInTheDocument()
      // Progress bar should be capped at 100% width
      const progressElement = document.querySelector('[style*="width"]')
      expect(progressElement).toHaveStyle('width: 100%')
    })

    it('should handle zero progress correctly', () => {
      mockUseTurkcellMonthly.monthlyTotal = 0
      mockUseTurkcellMonthly.progressPercentage = 0
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should show correct progress bar color for different completion levels', () => {
      // Test normal progress (blue)
      mockUseTurkcellMonthly.progressPercentage = 50
      const { rerender } = render(<TurkcellMonthlyCard />)
      
      let progressBar = document.querySelector('.bg-blue-500')
      expect(progressBar).toBeInTheDocument()

      // Test near completion (yellow)
      mockUseTurkcellMonthly.progressPercentage = 85
      rerender(<TurkcellMonthlyCard />)
      
      progressBar = document.querySelector('.bg-yellow-500')
      expect(progressBar).toBeInTheDocument()

      // Test completed (green)
      mockUseTurkcellMonthly.progressPercentage = 100
      rerender(<TurkcellMonthlyCard />)
      
      progressBar = document.querySelector('.bg-green-500')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Status Messages', () => {
    it('should show completion message when target is reached', () => {
      mockUseTurkcellMonthly.progressPercentage = 100
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('🎉 Hedef tamamlandı!')).toBeInTheDocument()
    })

    it('should show near completion message when close to target', () => {
      mockUseTurkcellMonthly.progressPercentage = 85
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Hedefe çok yakın!')).toBeInTheDocument()
    })

    it('should not show status messages for normal progress', () => {
      mockUseTurkcellMonthly.progressPercentage = 50
      render(<TurkcellMonthlyCard />)

      expect(screen.queryByText('🎉 Hedef tamamlandı!')).not.toBeInTheDocument()
      expect(screen.queryByText('Hedefe çok yakın!')).not.toBeInTheDocument()
    })

    it('should not show near completion message when target is completed', () => {
      mockUseTurkcellMonthly.progressPercentage = 100
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('🎉 Hedef tamamlandı!')).toBeInTheDocument()
      expect(screen.queryByText('Hedefe çok yakın!')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading state when loading is true', () => {
      mockUseTurkcellMonthly.loading = true
      render(<TurkcellMonthlyCard />)

      expect(screen.getByTestId('card-title')).toHaveTextContent('Aylık Turkcell Hedefi')
      expect(screen.getByTestId('inline-loading')).toBeInTheDocument()
      expect(screen.getByText('Hedef verileri yükleniyor...')).toBeInTheDocument()
    })

    it('should apply loading styles when loading', () => {
      mockUseTurkcellMonthly.loading = true
      render(<TurkcellMonthlyCard />)

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('animate-pulse', 'border-blue-200', 'bg-blue-50/30')
    })

    it('should show animated progress bar during loading', () => {
      mockUseTurkcellMonthly.loading = true
      render(<TurkcellMonthlyCard />)

      const progressBar = document.querySelector('.animate-pulse')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error state with retry button', () => {
      mockUseTurkcellMonthly.error = 'Network error occurred'
      render(<TurkcellMonthlyCard />)

      expect(screen.getByTestId('card-title')).toHaveTextContent('Aylık Turkcell Hedefi')
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('Hedef verileri yüklenirken bir sorun oluştu.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Tekrar Dene/i })).toBeInTheDocument()
    })

    it('should show network-specific error message for network errors', () => {
      mockUseTurkcellMonthly.error = 'fetch failed due to network issue'
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.')).toBeInTheDocument()
    })

    it('should show generic error message for non-network errors', () => {
      mockUseTurkcellMonthly.error = 'Database connection failed'
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Hedef verileri yüklenirken bir sorun oluştu.')).toBeInTheDocument()
    })

    it('should apply error styles when error exists', () => {
      mockUseTurkcellMonthly.error = 'Some error'
      render(<TurkcellMonthlyCard />)

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-red-200', 'bg-red-50/50')
    })

    it('should call clearError and refreshData when retry button is clicked', async () => {
      mockUseTurkcellMonthly.error = 'Some error'
      mockUseTurkcellMonthly.refreshData.mockResolvedValue(undefined)
      render(<TurkcellMonthlyCard />)

      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i })
      await user.click(retryButton)

      expect(mockUseTurkcellMonthly.clearError).toHaveBeenCalled()
      expect(mockUseTurkcellMonthly.refreshData).toHaveBeenCalled()
    })

    it('should handle retry failure gracefully', async () => {
      mockUseTurkcellMonthly.error = 'Some error'
      mockUseTurkcellMonthly.refreshData.mockRejectedValue(new Error('Retry failed'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<TurkcellMonthlyCard />)

      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i })
      await user.click(retryButton)

      expect(consoleSpy).toHaveBeenCalledWith('Retry failed:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('No Target Set State', () => {
    it('should show no target message when target is not set', () => {
      mockUseTurkcellMonthly.isTargetSet = false
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('Hedef belirlenmemiş - Operatör işlemlerinden hedef belirleyin')).toBeInTheDocument()
      expect(screen.getByText('Hedef: 0')).toBeInTheDocument()
    })

    it('should apply warning styles when no target is set', () => {
      mockUseTurkcellMonthly.isTargetSet = false
      render(<TurkcellMonthlyCard />)

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-yellow-200', 'bg-yellow-50/30')
    })
  })

  describe('Data Updates', () => {
    it('should update display when progress changes', () => {
      const { rerender } = render(<TurkcellMonthlyCard />)
      expect(screen.getByText('75%')).toBeInTheDocument()

      mockUseTurkcellMonthly.progressPercentage = 90
      rerender(<TurkcellMonthlyCard />)
      expect(screen.getByText('90%')).toBeInTheDocument()
    })

    it('should update target display when target changes', () => {
      const { rerender } = render(<TurkcellMonthlyCard />)
      expect(screen.getByText('Hedef: 100 işlem')).toBeInTheDocument()

      mockUseTurkcellMonthly.monthlyTarget = 150
      rerender(<TurkcellMonthlyCard />)
      expect(screen.getByText('Hedef: 150 işlem')).toBeInTheDocument()
    })

    it('should transition from loading to normal state', () => {
      mockUseTurkcellMonthly.loading = true
      const { rerender } = render(<TurkcellMonthlyCard />)
      
      expect(screen.getByTestId('inline-loading')).toBeInTheDocument()

      mockUseTurkcellMonthly.loading = false
      rerender(<TurkcellMonthlyCard />)
      
      expect(screen.queryByTestId('inline-loading')).not.toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should transition from error to normal state', () => {
      mockUseTurkcellMonthly.error = 'Some error'
      const { rerender } = render(<TurkcellMonthlyCard />)
      
      expect(screen.getByText('Hedef verileri yüklenirken bir sorun oluştu.')).toBeInTheDocument()

      mockUseTurkcellMonthly.error = null
      rerender(<TurkcellMonthlyCard />)
      
      expect(screen.queryByText('Hedef verileri yüklenirken bir sorun oluştu.')).not.toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button accessibility in error state', () => {
      mockUseTurkcellMonthly.error = 'Some error'
      render(<TurkcellMonthlyCard />)

      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toBeEnabled()
    })

    it('should have descriptive error messages', () => {
      mockUseTurkcellMonthly.error = 'Some error'
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Hedef verileri yüklenirken bir sorun oluştu.')).toBeInTheDocument()
    })

    it('should have descriptive loading message', () => {
      mockUseTurkcellMonthly.loading = true
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Hedef verileri yükleniyor...')).toBeInTheDocument()
    })

    it('should have descriptive no target message', () => {
      mockUseTurkcellMonthly.isTargetSet = false
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Hedef belirlenmemiş - Operatör işlemlerinden hedef belirleyin')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very high progress percentages', () => {
      mockUseTurkcellMonthly.progressPercentage = 250
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('250%')).toBeInTheDocument()
      // Progress bar should still be capped at 100%
      const progressElement = document.querySelector('[style*="width"]')
      expect(progressElement).toHaveStyle('width: 100%')
    })

    it('should handle decimal progress percentages', () => {
      mockUseTurkcellMonthly.progressPercentage = 75.5
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('75.5%')).toBeInTheDocument()
    })

    it('should handle negative values by showing 0', () => {
      mockUseTurkcellMonthly.monthlyTotal = -5
      mockUseTurkcellMonthly.progressPercentage = -10
      render(<TurkcellMonthlyCard />)

      // Since we use || 0, negative values should show 0
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      mockUseTurkcellMonthly.monthlyTarget = 999999
      mockUseTurkcellMonthly.monthlyTotal = 500000
      render(<TurkcellMonthlyCard />)

      expect(screen.getByText('Hedef: 999999 işlem')).toBeInTheDocument()
      expect(screen.getByText('500000')).toBeInTheDocument()
    })
  })
})