import { Smartphone, RefreshCw, AlertCircle } from 'lucide-react'
import { KPICard } from './KPICard'
import { useTurkcellDaily } from '@/hooks/useTurkcell'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Button } from '@/components/ui/button'
import { InlineLoading } from '@/components/ui/loading'

/**
 * TurkcellDailyCard Component
 * 
 * Displays daily Turkcell transaction count in a KPI card format.
 * Features:
 * - Extends existing KPICard component for consistency
 * - Smartphone icon for visual identity
 * - Center alignment for the main value
 * - Enhanced loading and error state handling with fallback values
 * - Error boundary protection
 * - Retry functionality for failed requests
 * - Automatic data fetching via useTurkcellDaily hook
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 3.5, 4.2, 4.4
 */
const TurkcellDailyCardContent = () => {
  const { 
    totalToday, 
    loading, 
    error, 
    clearError,
    fetchDailyTransactions,
    refreshData
  } = useTurkcellDaily()

  const handleRetry = async () => {
    clearError()
    try {
      await refreshData()
    } catch (err) {
      // Error will be handled by the store
      console.error('Retry failed:', err)
    }
  }

  // Handle error state - show user-friendly error message with retry option
  if (error) {
    const isNetworkError = error.includes('network') || error.includes('fetch')
    const errorMessage = isNetworkError 
      ? 'Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.'
      : 'Veriler yüklenirken bir sorun oluştu.'

    return (
      <KPICard
        title="Günlük Turkcell İşlemleri"
        value={
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-lg">0</span>
          </div>
        }
        subtitle={
          <div className="space-y-2">
            <p className="text-red-600 text-xs">{errorMessage}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="h-6 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Tekrar Dene
            </Button>
          </div>
        }
        icon={Smartphone}
        className="border-red-200 bg-red-50/50"
      />
    )
  }

  // Handle loading state with spinner
  if (loading) {
    return (
      <KPICard
        title="Günlük Turkcell İşlemleri"
        value={
          <InlineLoading 
            text="" 
            className="justify-center text-blue-600" 
          />
        }
        subtitle="Günlük işlem sayısı yükleniyor..."
        icon={Smartphone}
        className="animate-pulse border-blue-200 bg-blue-50/30"
      />
    )
  }

  // Normal state - show daily transaction count with fallback value (0)
  const displayValue = totalToday || 0

  return (
    <KPICard
      title="Günlük Turkcell İşlemleri"
      value={displayValue}
      subtitle="Bugün gerçekleştirilen toplam işlem sayısı"
      icon={Smartphone}
      className="text-center"
    />
  )
}

// Error boundary wrapper component
export const TurkcellDailyCard = () => {
  return (
    <ErrorBoundary
      fallback={
        <KPICard
          title="Günlük Turkcell İşlemleri"
          value={
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-lg">0</span>
            </div>
          }
          subtitle={
            <div className="space-y-2">
              <p className="text-red-600 text-xs">Bileşen yüklenirken hata oluştu</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-6 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sayfayı Yenile
              </Button>
            </div>
          }
          icon={Smartphone}
          className="border-red-200 bg-red-50/50"
        />
      }
    >
      <TurkcellDailyCardContent />
    </ErrorBoundary>
  )
}