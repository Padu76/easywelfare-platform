'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const isCompany = pathname.includes('/company')
  const isEmployee = pathname.includes('/employee')
  const isPartner = pathname.includes('/partner')

  const getNavItems = () => {
    if (isCompany) {
      return [
        { href: '/dashboard/company', label: 'Overview', icon: '📊' },
        { href: '/dashboard/company/credits', label: 'Crediti', icon: '💳' },
        { href: '/dashboard/company/employees', label: 'Dipendenti', icon: '👥' },
        { href: '/dashboard/company/reports', label: 'Report', icon: '📈' },
      ]
    }
    if (isEmployee) {
      return [
        { href: '/dashboard/employee', label: 'Overview', icon: '🏠' },
        { href: '/dashboard/employee/catalog', label: 'Catalogo', icon: '🛍️' },
        { href: '/dashboard/employee/qr', label: 'QR Code', icon: '📱' },
        { href: '/dashboard/employee/history', label: 'Storico', icon: '📋' },
      ]
    }
    if (isPartner) {
      return [
        { href: '/dashboard/partner', label: 'Overview', icon: '🏪' },
        { href: '/dashboard/partner/services', label: 'Servizi', icon: '⚡' },
        { href: '/dashboard/partner/vouchers', label: 'Voucher', icon: '🎫' },
        { href: '/dashboard/partner/transactions', label: 'Transazioni', icon: '💰' },
      ]
    }
    return []
  }

  const getUserType = () => {
    if (isCompany) return 'Azienda'
    if (isEmployee) return 'Dipendente'
    if (isPartner) return 'Partner'
    return 'Dashboard'
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                EasyWelfare
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{getUserType()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo User</span>
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Esci
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}