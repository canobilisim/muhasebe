import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export const MainContent = ({ 
  children, 
  className, 
  title, 
  subtitle, 
  actions 
}: MainContentProps) => {
  return (
    <main 
      id="main-content" 
      className={cn("flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden", className)}
      role="main"
      aria-label="Ana içerik"
    >
      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-xl font-semibold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-gray-600">
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
        {children}
      </div>
    </main>
  )
}