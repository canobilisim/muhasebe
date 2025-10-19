import { Target, RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTurkcellMonthly } from '@/hooks/useTurkcell'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { InlineLoading } from '@/components/ui/loading'

/**
 * TurkcellMonthlyCard Component
 * 
 * Displays monthly Turkcell target progress in a KPI card format.
 * Features:
 * - Progress bar with visual progress indicator
 * - Target icon for visual identity
 * - Left alignment for progress information
 * - Percentage calculation and display
 * - Enhanced loading and error state handling with fallback values
 * - Error boundary protection
 * - Retry functionality for failed requests
 * - Automatic data fetching via useTurkcellMonthly hook
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 3.5, 4.2, 4.4
 */
const TurkcellMonthlyCardContent = () => {
  const { 
    monthlyTarget,
    monthlyTotal,
    progressPercentage,
    isTargetSet,
    loading, 
    error,
    clearError,
    refreshData
  } = useTurkcellMonthly()

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
      : 'Hedef verileri yüklenirken bir sorun oluştu.'

    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aylık Turkcell Hedefi
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600 text-2xl font-bold">
            <AlertCircle className="w-6 h-6" />
            <span>0%</span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            {errorMessage}
          </p>
          <div className="mt-3">
            <div className="w-full bg-red-100 rounded-full h-2">
              <div className="bg-red-300 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-red-600 mt-1">
              <span>0</span>
              <span>Hedef: 0</span>
            </div>
          </div>
          <div className="mt-3">
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
        </CardContent>
      </Card>
    )
  }

  // Handle loading state with enhanced spinner
  if (loading) {
    return (
      <Card className="animate-pulse border-blue-200 bg-blue-50/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aylık Turkcell Hedefi
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <InlineLoading text="" className="text-blue-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Hedef verileri yükleniyor...
          </p>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-300 h-2 rounded-full animate-pulse" style={{ width: '30%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>...</span>
              <span>...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle no target set state with fallback values
  if (!isTargetSet) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aylık Turkcell Hedefi
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">0%</div>
          <p className="text-xs text-yellow-700 mt-1">
            Hedef belirlenmemiş - Operatör işlemlerinden hedef belirleyin
          </p>
          <div className="mt-3">
            <div className="w-full bg-yellow-100 rounded-full h-2">
              <div className="bg-yellow-300 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-yellow-700 mt-1">
              <span>0</span>
              <span>Hedef: 0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Normal state - show progress with target and fallback values
  const safeMonthlyTotal = monthlyTotal || 0
  const safeMonthlyTarget = monthlyTarget || 0
  const safeProgressPercentage = progressPercentage || 0
  
  const progressWidth = Math.min(safeProgressPercentage, 100) // Cap at 100%
  const isCompleted = safeProgressPercentage >= 100
  const isNearCompletion = safeProgressPercentage >= 80
  
  // Determine progress bar color based on completion status
  const progressBarColor = isCompleted 
    ? 'bg-green-500' 
    : isNearCompletion 
    ? 'bg-yellow-500' 
    : 'bg-blue-500'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Aylık Turkcell Hedefi
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {/* Progress percentage - left aligned */}
        <div className="text-2xl font-bold text-left">
          {safeProgressPercentage}%
        </div>
        
        {/* Target information */}
        <p className="text-xs text-muted-foreground mt-1 text-left">
          Hedef: {safeMonthlyTarget} işlem
        </p>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${progressBarColor} h-2 rounded-full transition-all duration-300 ease-in-out`}
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
          
          {/* Progress details */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{safeMonthlyTotal}</span>
            <span>{safeMonthlyTarget}</span>
          </div>
        </div>
        
        {/* Status message */}
        {isCompleted && (
          <div className="flex items-center mt-2">
            <span className="text-xs text-green-600 font-medium">
              🎉 Hedef tamamlandı!
            </span>
          </div>
        )}
        
        {isNearCompletion && !isCompleted && (
          <div className="flex items-center mt-2">
            <span className="text-xs text-yellow-600 font-medium">
              Hedefe çok yakın!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Error boundary wrapper component
export const TurkcellMonthlyCard = () => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aylık Turkcell Hedefi
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-red-600 text-2xl font-bold">
              <AlertCircle className="w-6 h-6" />
              <span>0%</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Bileşen yüklenirken hata oluştu
            </p>
            <div className="mt-3">
              <div className="w-full bg-red-100 rounded-full h-2">
                <div className="bg-red-300 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-red-600 mt-1">
                <span>0</span>
                <span>Hedef: 0</span>
              </div>
            </div>
            <div className="mt-3">
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
          </CardContent>
        </Card>
      }
    >
      <TurkcellMonthlyCardContent />
    </ErrorBoundary>
  )
}