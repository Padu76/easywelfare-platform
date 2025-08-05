'use client'

import { AdminAuthProvider, AdminAuthGuard } from '@/lib/admin-auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900">🎛️ EasyWelfare Admin</h1>
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