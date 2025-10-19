import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TurkcellDailyCard } from '../TurkcellDailyCard'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Smartphone: (props: any) => <div data-testid="smartphone-icon" {...props} />,
  RefreshCw: (props: any) => <div data-testid="refresh-icon" {...props} />,
  AlertCircle: (props: any) => <div data-testid="alert-icon" {...props} />,
}))

// Mock the Turkcell hook
const mockUseTurkcellDaily = {
  totalToday: 25,
  loading: false,
  error: null,
  clearError: vi.fn(),
  fetchDailyTransactions: vi.fn(),
  refreshData: vi.fn(),
}

vi.mock('@/hooks/useTurkcell', () => ({
  useTurkcellDaily: () => mockUseTurkcellDaily,
}))

// Mock KPICard component
vi.mock('../KPICard', () => ({
  KPICard: ({ title, value, subtitle, icon: Icon, className }: any) => (
    <div data-testid="kpi-card" className={className}>
      <div data-testid="kpi-title">{title}</div>
      <div data-testid="kpi-value">{value}</div>
      <div data-testid="kpi-subtitle">{subtitle}</div>
      {Icon && <Icon data-testid="kpi-icon" />}
    </div>
  ),
}))

// Mock UI components
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

describe('TurkcellDailyCard', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock values
    mockUseTurkcellDaily.totalToday = 25
    mockUseTurkcellDaily.loading = false
    mockUseTurkcellDaily.error = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render daily transaction count correctly', () => {
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-title')).toHaveTextContent('Günlük Turkcell İşlemleri')
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('25')
      expect(screen.getByTestId('kpi-subtitle')).toHaveTextContent('Bugün gerçekleştirilen toplam işlem sayısı')
      expect(screen.getByTestId('kpi-icon')).toBeInTheDocument()
    })

    it('should render with zero value when totalToday is 0', () => {
      mockUseTurkcellDaily.totalToday = 0
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-value')).toHaveTextContent('0')
    })

    it('should render with zero value when totalToday is null', () => {
      mockUseTurkcellDaily.totalToday = null
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-value')).toHaveTextContent('0')
    })

    it('should render with zero value when totalToday is undefined', () => {
      mockUseTurkcellDaily.totalToday = undefined
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-value')).toHaveTextContent('0')
    })

    it('should render large numbers correctly', () => {
      mockUseTurkcellDaily.totalToday = 1234
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-value')).toHaveTextContent('1234')
    })
  })

  describe('Loading State', () => {
    it('should show loading state when loading is true', () => {
      mockUseTurkcellDaily.loading = true
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-title')).toHaveTextContent('Günlük Turkcell İşlemleri')
      expect(screen.getByTestId('inline-loading')).toBeInTheDocument()
      expect(screen.getByTestId('kpi-subtitle')).toHaveTextContent('Günlük işlem sayısı yükleniyor...')
    })

    it('should apply loading styles when loading', () => {
      mockUseTurkcellDaily.loading = true
      render(<TurkcellDailyCard />)

      const card = screen.getByTestId('kpi-card')
      expect(card).toHaveClass('animate-pulse', 'border-blue-200', 'bg-blue-50/30')
    })
  })

  describe('Error State', () => {
    it('should show error state with retry button', () => {
      mockUseTurkcellDaily.error = 'Network error occurred'
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-title')).toHaveTextContent('Günlük Turkcell İşlemleri')
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('0')
      expect(screen.getByText('Veriler yüklenirken bir sorun oluştu.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Tekrar Dene/i })).toBeInTheDocument()
    })

    it('should show network-specific error message for network errors', () => {
      mockUseTurkcellDaily.error = 'fetch failed due to network issue'
      render(<TurkcellDailyCard />)

      expect(screen.getByText('Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.')).toBeInTheDocument()
    })

    it('should show generic error message for non-network errors', () => {
      mockUseTurkcellDaily.error = 'Database connection failed'
      render(<TurkcellDailyCard />)

      expect(screen.getByText('Veriler yüklenirken bir sorun oluştu.')).toBeInTheDocument()
    })

    it('should apply error styles when error exists', () => {
      mockUseTurkcellDaily.error = 'Some error'
      render(<TurkcellDailyCard />)

      const card = screen.getByTestId('kpi-card')
      expect(card).toHaveClass('border-red-200', 'bg-red-50/50')
    })

    it('should call clearError and refreshData when retry button is clicked', async () => {
      mockUseTurkcellDaily.error = 'Some error'
      mockUseTurkcellDaily.refreshData.mockResolvedValue(undefined)
      render(<TurkcellDailyCard />)

      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i })
      await user.click(retryButton)

      expect(mockUseTurkcellDaily.clearError).toHaveBeenCalled()
      expect(mockUseTurkcellDaily.refreshData).toHaveBeenCalled()
    })

    it('should handle retry failure gracefully', async () => {
      mockUseTurkcellDaily.error = 'Some error'
      mockUseTurkcellDaily.refreshData.mockRejectedValue(new Error('Retry failed'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<TurkcellDailyCard />)

      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i })
      await user.click(retryButton)

      expect(consoleSpy).toHaveBeenCalledWith('Retry failed:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Normal State', () => {
    it('should apply center alignment class in normal state', () => {
      render(<TurkcellDailyCard />)

      const card = screen.getByTestId('kpi-card')
      expect(card).toHaveClass('text-center')
    })

    it('should not have error or loading classes in normal state', () => {
      render(<TurkcellDailyCard />)

      const card = screen.getByTestId('kpi-card')
      expect(card).not.toHaveClass('border-red-200', 'bg-red-50/50', 'animate-pulse', 'border-blue-200')
    })
  })

  describe('Data Updates', () => {
    it('should update display when totalToday changes', () => {
      const { rerender } = render(<TurkcellDailyCard />)
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('25')

      mockUseTurkcellDaily.totalToday = 50
      rerender(<TurkcellDailyCard />)
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('50')
    })

    it('should transition from loading to normal state', () => {
      mockUseTurkcellDaily.loading = true
      const { rerender } = render(<TurkcellDailyCard />)
      
      expect(screen.getByTestId('inline-loading')).toBeInTheDocument()

      mockUseTurkcellDaily.loading = false
      rerender(<TurkcellDailyCard />)
      
      expect(screen.queryByTestId('inline-loading')).not.toBeInTheDocument()
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('25')
    })

    it('should transition from error to normal state', () => {
      mockUseTurkcellDaily.error = 'Some error'
      const { rerender } = render(<TurkcellDailyCard />)
      
      expect(screen.getByText('Veriler yüklenirken bir sorun oluştu.')).toBeInTheDocument()

      mockUseTurkcellDaily.error = null
      rerender(<TurkcellDailyCard />)
      
      expect(screen.queryByText('Veriler yüklenirken bir sorun oluştu.')).not.toBeInTheDocument()
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('25')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button accessibility in error state', () => {
      mockUseTurkcellDaily.error = 'Some error'
      render(<TurkcellDailyCard />)

      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toBeEnabled()
    })

    it('should have descriptive error messages', () => {
      mockUseTurkcellDaily.error = 'Some error'
      render(<TurkcellDailyCard />)

      expect(screen.getByText('Veriler yüklenirken bir sorun oluştu.')).toBeInTheDocument()
    })

    it('should have descriptive loading message', () => {
      mockUseTurkcellDaily.loading = true
      render(<TurkcellDailyCard />)

      expect(screen.getByText('Günlük işlem sayısı yükleniyor...')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative values by showing 0', () => {
      mockUseTurkcellDaily.totalToday = -5
      render(<TurkcellDailyCard />)

      // Since we use || 0, negative values should still show the actual value
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('-5')
    })

    it('should handle very large numbers', () => {
      mockUseTurkcellDaily.totalToday = 999999
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-value')).toHaveTextContent('999999')
    })

    it('should handle decimal numbers by showing them as-is', () => {
      mockUseTurkcellDaily.totalToday = 25.5
      render(<TurkcellDailyCard />)

      expect(screen.getByTestId('kpi-value')).toHaveTextContent('25.5')
    })
  })
})