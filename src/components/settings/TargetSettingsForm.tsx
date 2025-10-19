import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useTurkcellStore } from '@/stores/turkcellStore'
import { TurkcellService } from '@/services/turkcellService'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LoadingOverlay } from '@/components/ui/loading-overlay'

interface TargetSettingsFormProps {
  className?: string
}

const TargetSettingsFormContent: React.FC<TargetSettingsFormProps> = ({ className }) => {
  const {
    monthlyTarget,
    loading,
    error,
    updateMonthlyTarget,
    fetchMonthlyTarget,
    clearError,
    refreshData
  } = useTurkcellStore()

  const [newTarget, setNewTarget] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Load current target on component mount
  useEffect(() => {
    fetchMonthlyTarget()
  }, [fetchMonthlyTarget])

  // Update form when monthlyTarget changes - use fallback value (0)
  useEffect(() => {
    const safeTarget = monthlyTarget || 0
    setNewTarget(safeTarget.toString())
  }, [monthlyTarget])

  // Clear messages when user starts typing
  useEffect(() => {
    if (newTarget !== monthlyTarget.toString()) {
      setSuccessMessage('')
      setValidationError('')
      clearError()
    }
  }, [newTarget, monthlyTarget, clearError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow only numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      setNewTarget(value)
      setValidationError('')
    }
  }

  const validateInput = (value: string): { isValid: boolean; error?: string } => {
    if (!value.trim()) {
      return { isValid: false, error: 'Hedef değeri gereklidir' }
    }

    const numValue = parseInt(value, 10)
    
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Geçerli bir sayı giriniz' }
    }

    // Use service validation
    return TurkcellService.validateTarget(numValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous messages
    setValidationError('')
    setSuccessMessage('')
    clearError()

    // Validate input
    const validation = validateInput(newTarget)
    if (!validation.isValid) {
      setValidationError(validation.error || 'Geçersiz hedef değeri')
      return
    }

    const targetValue = parseInt(newTarget, 10)
    
    // Check if value actually changed
    if (targetValue === monthlyTarget) {
      setSuccessMessage('Hedef değeri zaten güncel')
      return
    }

    setIsSubmitting(true)

    try {
      await updateMonthlyTarget(targetValue)
      setSuccessMessage(`Aylık hedef başarıyla ${targetValue} olarak güncellendi`)
    } catch (err) {
      // Error is handled by the store, but we can show additional feedback
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    const safeTarget = monthlyTarget || 0
    setNewTarget(safeTarget.toString())
    setValidationError('')
    setSuccessMessage('')
    clearError()
  }

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1)
    clearError()
    setValidationError('')
    try {
      await refreshData()
    } catch (err) {
      console.error('Retry failed:', err)
    }
  }

  const safeMonthlyTarget = monthlyTarget || 0
  const isFormChanged = newTarget !== safeMonthlyTarget.toString()
  const canSubmit = !loading && !isSubmitting && isFormChanged && newTarget.trim() !== ''

  // Enhanced error message based on error type
  const getErrorMessage = (errorText: string) => {
    if (errorText.includes('network') || errorText.includes('fetch')) {
      return 'Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.'
    }
    if (errorText.includes('permission') || errorText.includes('unauthorized')) {
      return 'Bu işlem için yetkiniz bulunmuyor. Lütfen yöneticinizle iletişime geçin.'
    }
    return 'Hedef ayarları yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.'
  }

  return (
    <LoadingOverlay 
      isLoading={loading && retryCount === 0} 
      text="Hedef ayarları yükleniyor..."
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Aylık Hedef Ayarları
          </CardTitle>
          <CardDescription>
            Bu ay için Turkcell işlem hedefini belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Target Display */}
          <div className={`p-4 rounded-lg border ${
            error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  error ? 'text-red-900' : 'text-blue-900'
                }`}>
                  Mevcut Aylık Hedef
                </p>
                <p className={`text-2xl font-bold ${
                  error ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Yükleniyor...
                    </span>
                  ) : error ? (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      0 işlem
                    </span>
                  ) : (
                    `${safeMonthlyTarget} işlem`
                  )}
                </p>
              </div>
              <Target className={`w-8 h-8 ${
                error ? 'text-red-400' : 'text-blue-400'
              }`} />
            </div>
            {error && (
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
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Messages */}
          {(error || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {validationError || (error ? getErrorMessage(error) : '')}
              </AlertDescription>
            </Alert>
          )}

          {/* Target Setting Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-input">
                Yeni Hedef Değeri
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="target-input"
                    type="text"
                    value={newTarget}
                    onChange={handleInputChange}
                    placeholder="Örn: 100"
                    disabled={loading || isSubmitting}
                    className={validationError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1 ile 10.000 arasında bir tam sayı giriniz
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md border">
                  işlem
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Hedefi Kaydet
                  </>
                )}
              </Button>
              
              {isFormChanged && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading || isSubmitting}
                >
                  İptal
                </Button>
              )}
            </div>
          </form>

          {/* Help Text */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">💡 İpucu:</p>
            <p>
              Hedef değeri ayarladıktan sonra, ana dashboard'da ilerleme durumunuzu 
              takip edebilirsiniz. Hedef değişiklikleri hemen yansıtılacaktır.
            </p>
          </div>
        </CardContent>
      </Card>
    </LoadingOverlay>
  )
}

// Error boundary wrapper component
export const TargetSettingsForm: React.FC<TargetSettingsFormProps> = ({ className }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className={className}>
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Hedef Ayarları - Hata
              </CardTitle>
              <CardDescription className="text-red-600">
                Form yüklenirken bir hata oluştu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-100 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  Hedef ayarları formu yüklenemedi. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sayfayı Yenile
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <TargetSettingsFormContent className={className} />
    </ErrorBoundary>
  )
}

export default TargetSettingsForm