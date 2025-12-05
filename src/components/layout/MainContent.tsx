import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  fullWidth?: boolean
}

export const MainContent = ({ 
  children, 
  className, 
  title, 
  subtitle, 
  actions,
  fullWidth = false
}: MainContentProps) => {
  return (
    <main 
      id="main-content" 
      className={cn("flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden", fullWidth ? "bg-white" : "bg-gray-50", className)}
      role="main"
      aria-label="Ana içerik"
    >
      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className={cn(fullWidth ? "w-full" : "max-w-7xl mx-auto", "flex items-center justify-between")}>
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2" role="group" aria-label="Sayfa işlemleri">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={cn("flex-1 w-full", className?.includes('overflow-hidden') ? 'overflow-hidden' : 'overflow-auto')}>
        {fullWidth ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        )}
      </div>
    </main>
  )
}