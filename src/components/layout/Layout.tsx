import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MainContent } from './MainContent'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export const Layout = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className 
}: LayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <Sidebar className="relative z-50" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          showMenuButton 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <MainContent 
          title={title}
          subtitle={subtitle}
          actions={actions}
          className={className}
        >
          {children}
        </MainContent>
      </div>
    </div>
  )
}