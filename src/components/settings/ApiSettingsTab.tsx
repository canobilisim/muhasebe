import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, XCircle, Loader2, Key, Server } from 'lucide-react'
import { toast } from 'react-hot-toast'
import apiSettingsService from '@/services/apiSettingsService'

export const ApiSettingsTab = () => {
  const [apiKey, setApiKey] = useState('')
  const [environment, setEnvironment] = useState<'test' | 'production'>('test')
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  // API URLs
  const testUrl = 'https://efaturaservicetest.isim360.com/v1'
  const productionUrl = 'https://efaturaservice.turkcellesirket.com/v1'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const settings = await apiSettingsService.getApiSettings()
      
      if (settings) {
        setApiKey(settings.apiKey)
        setEnvironment(settings.environment)
      }
    } catch (error) {
      console.error('API ayarları yüklenemedi:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast.error('Lütfen API Key giriniz')
      return
    }

    try {
      setIsTesting(true)
      setTestResult(null)

      const result = await apiSettingsService.testApiConnection({
        apiKey,
        environment
      })
      
      setTestResult({
        success: result.success,
        message: result.message
      })

      if (result.success) {
        toast.success('Bağlantı başarılı!')
      } else {
        toast.error('Bağlantı başarısız: ' + result.message)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Bağlantı testi başarısız'
      setTestResult({
        success: false,
        message: errorMessage
      })
      toast.error(errorMessage)
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Lütfen API Key giriniz')
      return
    }

    try {
      setIsLoading(true)

      await apiSettingsService.saveApiSettings({
        apiKey,
        environment
      })

      toast.success('API ayarları başarıyla kaydedildi')
    } catch (error: any) {
      console.error('API ayarları kaydedilemedi:', error)
      toast.error('API ayarları kaydedilemedi: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !apiKey) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Turkcell e-Fatura API Ayarları
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key *</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key giriniz"
              className="pr-20"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? 'Gizle' : 'Göster'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            API Key güvenli bir şekilde şifrelenerek saklanacaktır
          </p>
        </div>

        {/* Environment Selector */}
        <div className="space-y-2">
          <Label htmlFor="environment">Ortam *</Label>
          <Select
            value={environment}
            onValueChange={(value: 'test' | 'production') => setEnvironment(value)}
          >
            <SelectTrigger id="environment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API URLs (Read-only) */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Server className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-gray-600">Test URL</Label>
              <p className="text-sm font-mono text-gray-700 break-all">
                {testUrl}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Server className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-gray-600">Production URL</Label>
              <p className="text-sm font-mono text-gray-700 break-all">
                {productionUrl}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Aktif URL:</strong>{' '}
              <span className="font-mono">
                {environment === 'test' ? testUrl : productionUrl}
              </span>
            </p>
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey.trim()}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Test Ediliyor...
              </>
            ) : (
              'Bağlantıyı Test Et'
            )}
          </Button>

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    testResult.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {testResult.success ? 'Bağlantı Başarılı' : 'Bağlantı Başarısız'}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
