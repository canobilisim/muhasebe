import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MainContent } from './MainContent'

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
    <div className="flex h-screen w-screen bg-white">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex border-r border-gray-200 h-screen flex-shrink-0" />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <Sidebar className="relative z-50 h-full" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <Topbar 
          showMenuButton 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          className="border-b border-gray-200 flex-shrink-0"
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