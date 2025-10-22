import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { AuthErrorHandler } from '@/lib/auth-error-handler'

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gerekli')
    .email('Geçerli bir e-posta adresi girin'),
  password: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showDevDetails, setShowDevDetails] = useState(false)
  const { signIn, isAuthenticated, isLoading, error, clearError, lastError } = useAuth()
  const location = useLocation()
  const isDevelopment = AuthErrorHandler.isDevelopment()

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Clear error when component mounts or form changes
  useEffect(() => {
    clearError()
  }, [clearError])

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    clearError()

    const result = await signIn(data.email, data.password)

    if (!result.success) {
      // Set form error if login failed
      setError('root', {
        type: 'manual',
        message: result.error || 'Giriş başarısız',
      })
    }
    // If successful, the auth state change will trigger navigation
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            HesapOnda
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>
              E-posta adresiniz ve şifrenizle giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Şifrenizi girin"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Error display */}
              {(error || errors.root) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{error || errors.root?.message}</p>
                      {isDevelopment && lastError && (
                        <details className="text-xs mt-2">
                          <summary 
                            className="cursor-pointer hover:underline"
                            onClick={() => setShowDevDetails(!showDevDetails)}
                          >
                            Geliştirici Detayları
                          </summary>
                          <div className="mt-2 p-2 bg-gray-100 rounded text-gray-800 overflow-auto max-h-40">
                            <div className="mb-2">
                              <strong>Kategori:</strong> {lastError.category}
                            </div>
                            <div className="mb-2">
                              <strong>Context:</strong> {lastError.context}
                            </div>
                            <div className="mb-2">
                              <strong>Zaman:</strong> {new Date(lastError.timestamp).toLocaleString('tr-TR')}
                            </div>
                            <div>
                              <strong>Detay:</strong>
                              <pre className="mt-1 whitespace-pre-wrap text-xs">
                                {lastError.devMessage}
                              </pre>
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Demo Hesap Bilgileri:
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> admin@demo.com / 123456</p>
                <p><strong>Manager:</strong> manager@demo.com / 123456</p>
                <p><strong>Cashier:</strong> cashier@demo.com / 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 HesapOnda. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  )
}