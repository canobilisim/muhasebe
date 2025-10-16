import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'spinner' | 'dots' | 'pulse'
}

export const Loading = ({ 
  className, 
  size = 'md', 
  text = 'Yükleniyor...',
  variant = 'spinner'
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-blue-600 rounded-full animate-bounce',
                  size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        )
      case 'pulse':
        return (
          <div className={cn(
            'bg-blue-600 rounded-full animate-pulse',
            sizeClasses[size]
          )} />
        )
      default:
        return (
          <Loader2 className={cn(
            'animate-spin text-blue-600',
            sizeClasses[size]
          )} />
        )
    }
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      <div className="mb-2">
        {renderSpinner()}
      </div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  )
}

export const PageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="lg" text="Sayfa yükleniyor..." />
    </div>
  )
}

export const InlineLoading = ({ 
  text = 'Yükleniyor...', 
  className 
}: { 
  text?: string; 
  className?: string; 
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

export const ButtonLoading = ({ 
  text = 'Yükleniyor...', 
  className 
}: { 
  text?: string; 
  className?: string; 
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

export const TableLoading = ({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number; 
}) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-8 bg-gray-200 rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export const RefreshLoading = ({ 
  isRefreshing, 
  onRefresh, 
  className 
}: { 
  isRefreshing: boolean; 
  onRefresh: () => void; 
  className?: string; 
}) => {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn(
        'p-2 rounded-md hover:bg-gray-100 transition-colors',
        isRefreshing && 'cursor-not-allowed',
        className
      )}
    >
      <RefreshCw 
        className={cn(
          'w-4 h-4 text-gray-600',
          isRefreshing && 'animate-spin'
        )} 
      />
    </button>
  )
}