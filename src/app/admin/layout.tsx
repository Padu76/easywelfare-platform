// src/app/admin/layout.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminAuthProvider, AdminAuthGuard, useAdminAuth, PermissionGuard, ADMIN_PERMISSIONS } from '@/lib/admin-auth'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

// Navigation Items Interface
interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  permission?: string
  badge?: string
  children?: NavItem[]
}

// Navigation Configuration
const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: '📊',
    href: '/admin/dashboard',
    permission: ADMIN_PERMISSIONS.VIEW_DASHBOARD
  },
  {
    id: 'companies',
    label: 'Aziende',
    icon: '🏢',
    href: '/admin/companies',
    permission: ADMIN_PERMISSIONS.MANAGE_COMPANIES,
    children: [
      { id: 'companies-list', label: 'Lista Aziende', icon: '📋', href: '/admin/companies' },
      { id: 'companies-add', label: 'Nuova Azienda', icon: '➕', href: '/admin/companies/add' },
      { id: 'companies-suspended', label: 'Sospese', icon: '🚫', href: '/admin/companies/suspended' }
    ]
  },
  {
    id: 'partners',
    label: 'Partner',
    icon: '🏪',
    href: '/admin/partners',
    permission: ADMIN_PERMISSIONS.MANAGE_PARTNERS,
    badge: 'new',
    children: [
      { id: 'partners-list', label: 'Lista Partner', icon: '📋', href: '/admin/partners' },
      { id: 'partners-pending', label: 'In Attesa', icon: '⏳', href: '/admin/partners/pending', badge: '3' },
      { id: 'partners-add', label: 'Nuovo Partner', icon: '➕', href: '/admin/partners/add' }
    ]
  },
  {
    id: 'transactions',
    label: 'Transazioni',
    icon: '💳',
    href: '/admin/transactions',
    permission: ADMIN_PERMISSIONS.VIEW_TRANSACTIONS,
    children: [
      { id: 'transactions-live', label: 'Feed Live', icon: '📡', href: '/admin/transactions' },
      { id: 'transactions-reports', label: 'Report', icon: '📊', href: '/admin/transactions/reports' },
      { id: 'transactions-export', label: 'Export', icon: '📥', href: '/admin/transactions/export' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📈',
    href: '/admin/analytics',
    permission: ADMIN_PERMISSIONS.VIEW_ANALYTICS,
    children: [
      { id: 'analytics-overview', label: 'Panoramica', icon: '📊', href: '/admin/analytics' },
      { id: 'analytics-revenue', label: 'Revenue', icon: '💰', href: '/admin/analytics/revenue' },
      { id: 'analytics-growth', label: 'Crescita', icon: '📈', href: '/admin/analytics/growth' }
    ]
  },
  {
    id: 'settings',
    label: 'Impostazioni',
    icon: '⚙️',
    href: '/admin/settings',
    permission: ADMIN_PERMISSIONS.MANAGE_SETTINGS,
    children: [
      { id: 'settings-platform', label: 'Piattaforma', icon: '🎛️', href: '/admin/settings' },
      { id: 'settings-notifications', label: 'Notifiche', icon: '🔔', href: '/admin/settings/notifications' },
      { id: 'settings-admins', label: 'Admin Users', icon: '👥', href: '/admin/settings/admins' }
    ]
  }
]

// Sidebar Navigation Component
function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { hasPermission } = useAdminAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    // Check permissions
    if (item.permission && !hasPermission(item.permission)) {
      return null
    }

    const isActive = isActiveRoute(item.href)
    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <div className={`flex items-center ${level > 0 ? 'pl-6' : ''}`}>
          <Link
            href={item.href}
            className={`flex-1 flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose()
              }
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <Badge 
                variant={item.badge === 'new' ? 'success' : 'warning'} 
                className="ml-auto"
              >
                {item.badge === 'new' ? 'Nuovo' : item.badge}
              </Badge>
            )}
          </Link>
          
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶️
              </span>
            </button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EW</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">EasyWelfare</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ❌
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema Operativo</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">v1.0.0 - Build 2024.1</p>
        </div>
      </div>
    </>
  )
}

// Admin Header Component
function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAdminAuth()
  const pathname = usePathname()

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    let currentPath = ''
    for (const segment of segments) {
      currentPath += `/${segment}`
      
      // Skip 'admin' in breadcrumbs
      if (segment === 'admin') continue
      
      // Find navigation item for this segment
      const findNavItem = (items: NavItem[], path: string): NavItem | null => {
        for (const item of items) {
          if (item.href === currentPath) return item
          if (item.children) {
            const found = findNavItem(item.children, path)
            if (found) return found
          }
        }
        return null
      }
      
      const navItem = findNavItem(navigationItems, currentPath)
      breadcrumbs.push({
        label: navItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        icon: navItem?.icon
      })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            ☰
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              🏠 Admin
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">→</span>
                <Link 
                  href={crumb.href}
                  className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                >
                  {crumb.icon && <span>{crumb.icon}</span>}
                  <span>{crumb.label}</span>
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 text-sm font-medium">Sistema OK</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            🔔
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>

            <button
              onClick={signOut}
              className="text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Main Admin Layout Component
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Root Admin Layout with Auth Provider
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </AdminAuthGuard>
    </AdminAuthProvider>
  )
}

// Quick Access Component (can be used in dashboard)
function QuickActions() {
  const { hasPermission } = useAdminAuth()

  const quickActions = [
    {
      label: 'Nuova Azienda',
      icon: '🏢',
      href: '/admin/companies/add',
      permission: ADMIN_PERMISSIONS.MANAGE_COMPANIES,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Approva Partner',
      icon: '✅',
      href: '/admin/partners/pending',
      permission: ADMIN_PERMISSIONS.MANAGE_PARTNERS,
      color: 'bg-green-600 hover:bg-green-700',
      badge: '3'
    },
    {
      label: 'Transazioni Live',
      icon: '📡',
      href: '/admin/transactions',
      permission: ADMIN_PERMISSIONS.VIEW_TRANSACTIONS,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Report Revenue',
      icon: '💰',
      href: '/admin/analytics/revenue',
      permission: ADMIN_PERMISSIONS.VIEW_ANALYTICS,
      color: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickActions.map((action) => (
        <PermissionGuard key={action.label} permission={action.permission}>
          <Link
            href={action.href}
            className={`relative p-4 rounded-lg text-white text-center transition-colors ${action.color}`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="text-sm font-medium">{action.label}</div>
            {action.badge && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </Link>
        </PermissionGuard>
      ))}
    </div>
  )
}

// System Health Indicator Component
function SystemHealthIndicator() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="font-medium text-gray-900">System Health</h3>
            <p className="text-sm text-gray-600">Tutti i servizi operativi</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-green-600">99.9% Uptime</p>
          <p className="text-xs text-gray-500">Ultimo check: ora</p>
        </div>
      </div>
    </div>
  )
}