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
    <main className={cn("flex-1 overflow-auto", className)}>
      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </main>
  )
}