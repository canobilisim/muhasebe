import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Smartphone,
  ChevronDown,
  List,
  PackageCheck,
  FolderTree,
  Receipt,
  Plus,
  RotateCcw,
  TrendingUp,
  Factory,
  Truck,
  Upload,
  Download,
  ShoppingBag,
  FileText,
  Archive,
  Zap,
  UserCheck,
  CreditCard,
  FileCheck,
  DollarSign,
  Tags,
  Building2,
  Landmark
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

interface SubNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
  subItems?: SubNavItem[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Hızlı Satış',
    href: '/pos2',
    icon: Zap,
    roles: ['admin', 'manager', 'cashier']
  },
  {
    title: 'Perakende Satışlar',
    href: '/retail-sales',
    icon: ShoppingCart,
    roles: ['admin', 'manager', 'cashier']
  },
  {
    title: 'Müşteriler',
    icon: Users,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Müşteri Listesi',
        href: '/customers',
        icon: Users
      },
      {
        title: 'Dışa Aktarım',
        href: '/customers/export',
        icon: Upload
      },
      {
        title: 'İçe Aktarım',
        href: '/customers/import',
        icon: Download
      }
    ]
  },
  {
    title: 'Tedarikçiler',
    icon: Truck,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Tedarikçi Listesi',
        href: '/suppliers',
        icon: Truck
      },
      {
        title: 'Yeni Tedarikçi',
        href: '/suppliers/new',
        icon: Plus
      }
    ]
  },

  {
    title: 'Alış Faturaları',
    icon: ShoppingBag,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Yeni Alış Faturası',
        href: '/purchases/new',
        icon: Plus
      },
      {
        title: 'Alış Faturaları',
        href: '/purchases/list',
        icon: FileText
      },
      {
        title: 'Gelen Kutusu',
        href: '/purchases/inbox',
        icon: Archive
      },
      {
        title: 'Yeni Müstasil Fişi',
        href: '/mustasil-fis/new',
        icon: FileText
      }
    ]
  },
  {
    title: 'İrsaliye',
    icon: Truck,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Yeni İrsaliye',
        href: '/irsaliye/yeni',
        icon: Plus
      },
      {
        title: 'İrsaliye Listesi',
        href: '/irsaliye/liste',
        icon: List
      }
    ]
  },
  {
    title: 'Satış Faturaları',
    icon: Receipt,
    roles: ['admin', 'manager', 'cashier'],
    subItems: [
      {
        title: 'Yeni Satış Faturası',
        href: '/sales/new',
        icon: Plus
      },
      {
        title: 'Satış Faturaları',
        href: '/sales/list',
        icon: List
      }
    ]
  },
  {
    title: 'Stok',
    icon: PackageCheck,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Ürünler',
        href: '/products/manage',
        icon: Package
      },
      {
        title: 'Kategoriler',
        href: '/products/categories',
        icon: FolderTree
      },
      {
        title: 'Stok Hareketleri',
        href: '/stock',
        icon: TrendingUp
      },
      {
        title: 'Üretim',
        href: '/stock/production',
        icon: Factory
      },
      {
        title: 'Transfer',
        href: '/stock/transfer',
        icon: Truck
      },
      {
        title: 'Dışa Aktarım',
        href: '/stock/export',
        icon: Upload
      },
      {
        title: 'İçe Aktarım',
        href: '/stock/import',
        icon: Download
      }
    ]
  },
  {
    title: 'Personel',
    icon: UserCheck,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Personel Listesi',
        href: '/personnel/list',
        icon: Users
      },
      {
        title: 'Evrak Yönetimi',
        href: '/personnel/documents',
        icon: FileText
      }
    ]
  },
  {
    title: 'Şube & Kasa',
    icon: Building2,
    roles: ['admin', 'manager', 'cashier'],
    subItems: [
      {
        title: 'Şubeler',
        href: '/branches',
        icon: Building2
      },
      {
        title: 'Fiziki Kasa',
        href: '/cash',
        icon: Wallet
      },
      {
        title: 'Banka Hesapları',
        href: '/bank-accounts',
        icon: Landmark
      }
    ]
  },
  {
    title: 'Finansal İşlemler',
    icon: CreditCard,
    roles: ['admin', 'manager'],
    subItems: [
      {
        title: 'Çek Portföyü',
        href: '/financial/checks',
        icon: FileCheck
      },
      {
        title: 'Senet Portföyü',
        href: '/financial/promissory-notes',
        icon: FileText
      },
      {
        title: 'Masraf Kategorileri',
        href: '/financial/expense-categories',
        icon: Tags
      },
      {
        title: 'Masraflar',
        href: '/financial/expenses',
        icon: DollarSign
      }
    ]
  },
  {
    title: 'Raporlar',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'manager']
  },
  {
    title: 'Operatör İşlemleri',
    href: '/operator-operations',
    icon: Smartphone,
    roles: ['admin', 'manager']
  },
  {
    title: 'Ayarlar',
    href: '/settings',
    icon: Settings,
    roles: ['admin']
  }
]

export const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const location = useLocation()
  const { hasAnyRole, logout, getDisplayName, userRole } = useAuth()

  const filteredNavItems = navItems.filter(item =>
    !item.roles || hasAnyRole(item.roles)
  )

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href
    }
    if (item.subItems) {
      return item.subItems.some(subItem => location.pathname === subItem.href)
    }
    return false
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className={cn(
      "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-gray-900">HesapOnda</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = isItemActive(item)
          const isExpanded = expandedItems.includes(item.title)
          const hasSubItems = item.subItems && item.subItems.length > 0

          return (
            <div key={item.title}>
              {/* Ana menü öğesi */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-blue-700" : "text-gray-500"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded ? "transform rotate-180" : ""
                    )} />
                  )}
                </button>
              ) : (
                <Link
                  to={item.href!}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-blue-700" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              )}

              {/* Alt menü öğeleri */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = location.pathname === subItem.href

                    return (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                          isSubActive
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <SubIcon className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isSubActive ? "text-blue-700" : "text-gray-400"
                        )} />
                        <span className="truncate">{subItem.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {userRole}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Çıkış Yap" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </div>
  )
}