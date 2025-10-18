import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const AuthDebug = () => {
  const authState = useAuthStore()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [localStorage, setLocalStorage] = useState<any>({})

  useEffect(() => {
    // Check Supabase session
    supabase.auth.getSession().then(({ data }) => {
      setSupabaseSession(data.session)
    })

    // Check localStorage
    const authStorage = window.localStorage.getItem('auth-storage')
    const supabaseToken = window.localStorage.getItem('supabase.auth.token')
    
    setLocalStorage({
      authStorage: authStorage ? JSON.parse(authStorage) : null,
      supabaseToken: supabaseToken ? JSON.parse(supabaseToken) : null,
    })
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleClearStorage = () => {
    window.localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            🔍 Auth Debug
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                Yenile
              </Button>
              <Button size="sm" variant="destructive" onClick={handleClearStorage}>
                Temizle
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Auth Store:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify({
                isAuthenticated: authState.isAuthenticated,
                isInitialized: authState.isInitialized,
                isLoading: authState.isLoading,
                hasUser: !!authState.user,
                hasProfile: !!authState.profile,
                hasSession: !!authState.session,
                userRole: authState.userRole,
                connectionStatus: authState.connectionStatus,
              }, null, 2)}
            </pre>
          </div>

          <div>
            <strong>Supabase Session:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify({
                hasSession: !!supabaseSession,
                expiresAt: supabaseSession?.expires_at 
                  ? new Date(supabaseSession.expires_at * 1000).toISOString()
                  : null,
              }, null, 2)}
            </pre>
          </div>

          <div>
            <strong>LocalStorage:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify({
                hasAuthStorage: !!localStorage.authStorage,
                hasSupabaseToken: !!localStorage.supabaseToken,
                authIsAuthenticated: localStorage.authStorage?.state?.isAuthenticated,
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
