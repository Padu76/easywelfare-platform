'use client'

import { usePathname } from 'next/navigation'
import { AdminAuthProvider, AdminAuthGuard } from '@/lib/admin-auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't apply AuthGuard to login page - let it render freely
  if (pathname === '/admin/login') {
    console.log('🚪 Login page detected - no AuthGuard applied')
    return (
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    )
  }

  // For all other admin pages, apply AuthGuard protection
  console.log('🛡️ Protected admin page - AuthGuard applied:', pathname)
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EW</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">🎛️ EasyWelfare Admin</h1>
              </div>
              
              {/* Quick Admin Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Dashboard Admin</p>
                  <p className="text-xs text-gray-500">Sistema di controllo</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Sistema Online"></div>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </AdminAuthGuard>
    </AdminAuthProvider>
  )
}