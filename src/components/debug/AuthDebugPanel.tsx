import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

interface AuthDebugPanelProps {
  onClose: () => void
}

export function AuthDebugPanel({ onClose }: AuthDebugPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    state: true,
    session: false,
    profile: false,
    errors: false,
  })

  const {
    isAuthenticated,
    user,
    profile,
    session,
    connectionStatus,
    lastError,
    initializeAttempts,
    isLoading,
    isInitialized,
    userRole,
    branchId,
    signIn,
    signOut,
    clearError,
    initialize,
    checkConnection,
  } = useAuthStore()

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500'
      case 'checking':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleTestLogin = async (email: string, password: string) => {
    console.log(`🧪 Test login: ${email}`)
    await signIn(email, password)
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-hidden flex flex-col bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm">🔐 Auth Debug Panel</h3>
          <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* Auth State Section */}
        <div className="border rounded">
          <button
            onClick={() => toggleSection('state')}
            className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold">Auth State</span>
            {expandedSections.state ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.state && (
            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Authenticated:</span>
                <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Initialized:</span>
                <Badge variant={isInitialized ? 'default' : 'secondary'}>
                  {isInitialized ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loading:</span>
                <Badge variant={isLoading ? 'default' : 'secondary'}>
                  {isLoading ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <Badge
                  variant={
                    connectionStatus === 'connected'
                      ? 'default'
                      : connectionStatus === 'checking'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {connectionStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Init Attempts:</span>
                <span className="font-mono">{initializeAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <Badge variant="outline">{userRole || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Branch ID:</span>
                <span className="font-mono text-xs">{branchId || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Session Section */}
        <div className="border rounded">
          <button
            onClick={() => toggleSection('session')}
            className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold">Session Info</span>
            {expandedSections.session ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.session && (
            <div className="p-2 space-y-1">
              {session ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">
                      {user?.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-xs truncate max-w-[200px]">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires In:</span>
                    <span className="text-xs">
                      {session.expires_in
                        ? `${session.expires_in}s`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Access Token:</span>
                    <span className="font-mono text-xs truncate max-w-[150px]">
                      {session.access_token?.substring(0, 20)}...
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">No active session</p>
              )}
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="border rounded">
          <button
            onClick={() => toggleSection('profile')}
            className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold">User Profile</span>
            {expandedSections.profile ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.profile && (
            <div className="p-2 space-y-1">
              {profile ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-xs">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-xs truncate max-w-[200px]">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline">{profile.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <Badge variant={profile.is_active ? 'default' : 'destructive'}>
                      {profile.is_active ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch ID:</span>
                    <span className="font-mono text-xs">{profile.branch_id}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">No profile loaded</p>
              )}
            </div>
          )}
        </div>

        {/* Error History Section */}
        <div className="border rounded">
          <button
            onClick={() => toggleSection('errors')}
            className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold">Error History</span>
            {expandedSections.errors ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.errors && (
            <div className="p-2 space-y-2">
              {lastError ? (
                <div className="bg-red-50 border border-red-200 rounded p-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-red-700">
                      {lastError.category}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  </div>
                  <p className="text-xs text-red-600">{lastError.message}</p>
                  {lastError.devMessage && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-red-700">
                        Developer Details
                      </summary>
                      <pre className="mt-1 p-1 bg-red-100 rounded text-xs overflow-x-auto">
                        {lastError.devMessage}
                      </pre>
                    </details>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(lastError.timestamp).toLocaleString('tr-TR')}
                  </p>
                  <p className="text-xs text-gray-500">Context: {lastError.context}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No errors</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border rounded p-2 space-y-2">
          <h4 className="font-semibold mb-2">Quick Actions</h4>
          
          {/* Test Login Buttons */}
          <div className="space-y-1">
            <p className="text-xs text-gray-600 mb-1">Test Login:</p>
            <div className="grid grid-cols-3 gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestLogin('admin@demo.com', '123456')}
                disabled={isLoading}
                className="text-xs h-7"
              >
                Admin
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestLogin('manager@demo.com', '123456')}
                disabled={isLoading}
                className="text-xs h-7"
              >
                Manager
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestLogin('cashier@demo.com', '123456')}
                disabled={isLoading}
                className="text-xs h-7"
              >
                Cashier
              </Button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => signOut()}
              disabled={isLoading || !isAuthenticated}
              className="text-xs h-7"
            >
              Logout
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => clearError()}
              disabled={!lastError}
              className="text-xs h-7"
            >
              Clear Error
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => initialize()}
              disabled={isLoading}
              className="text-xs h-7"
            >
              Re-initialize
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => checkConnection()}
              disabled={isLoading}
              className="text-xs h-7"
            >
              Check Connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
