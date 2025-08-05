'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'support'
  permissions: string[]
  created_at: string
  last_login: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      setLoading(true)
      
      const adminSession = localStorage.getItem('easywelfare_admin_session')
      if (!adminSession) {
        setLoading(false)
        return
      }

      const sessionData = JSON.parse(adminSession)
      
      if (sessionData.expires_at && new Date(sessionData.expires_at) < new Date()) {
        localStorage.removeItem('easywelfare_admin_session')
        setLoading(false)
        return
      }

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', sessionData.user_id)
        .eq('is_active', true)
        .single()

      if (error || !adminUser) {
        localStorage.removeItem('easywelfare_admin_session')
        setLoading(false)
        return
      }

      setUser({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role || 'admin',
        permissions: adminUser.permissions || [],
        created_at: adminUser.created_at,
        last_login: adminUser.last_login || adminUser.created_at
      })

    } catch (error) {
      console.error('Error checking admin auth:', error)
      localStorage.removeItem('easywelfare_admin_session')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)

      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      if (fetchError || !adminUser) {
        return { success: false, error: 'Admin non trovato o non attivo' }
      }

      const isPasswordValid = password === 'admin123'
      
      if (!isPasswordValid) {
        return { success: false, error: 'Credenziali non valide' }
      }

      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      const sessionData = {
        user_id: adminUser.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      localStorage.setItem('easywelfare_admin_session', JSON.stringify(sessionData))

      setUser({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role || 'admin',
        permissions: adminUser.permissions || [],
        created_at: adminUser.created_at,
        last_login: new Date().toISOString()
      })

      return { success: true }

    } catch (error) {
      console.error('Admin sign in error:', error)
      return { success: false, error: 'Errore durante il login' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('easywelfare_admin_session')
      setUser(null)
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Admin sign out error:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    return user.permissions.includes(permission)
  }

  const value: AdminAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
    isAuthenticated: !!user
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autenticazione admin...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  return <>{children}</>
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: string
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { hasPermission } = useAdminAuth()

  if (!hasPermission(permission)) {
    return fallback || (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600 text-lg mr-2">🚫</span>
          <p className="text-red-800">
            <strong>Accesso negato:</strong> Non hai i permessi per visualizzare questo contenuto.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export async function createDemoAdminUser() {
  try {
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@easywelfare.com')
      .single()

    if (existingAdmin) {
      console.log('Demo admin user already exists')
      return existingAdmin
    }

    const { data: newAdmin, error } = await supabase
      .from('admin_users')
      .insert([{
        email: 'admin@easywelfare.com',
        password_hash: 'admin123',
        role: 'super_admin',
        permissions: [
          'view_dashboard',
          'manage_companies',
          'manage_partners', 
          'view_transactions',
          'manage_settings',
          'view_analytics'
        ],
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating demo admin:', error)
      return null
    }

    console.log('Demo admin user created:', newAdmin.email)
    return newAdmin

  } catch (error) {
    console.error('Error in createDemoAdminUser:', error)
    return null
  }
}

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  SUPPORT: 'support'
} as const

export const ADMIN_PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_COMPANIES: 'manage_companies',
  MANAGE_PARTNERS: 'manage_partners',
  VIEW_TRANSACTIONS: 'view_transactions',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADMINS: 'manage_admins'
} as const

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return 'Super Admin'
    case ADMIN_ROLES.ADMIN:
      return 'Amministratore'
    case ADMIN_ROLES.SUPPORT:
      return 'Supporto'
    default:
      return role
  }
}

export function getRolePermissions(role: string): string[] {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return Object.values(ADMIN_PERMISSIONS)
    case ADMIN_ROLES.ADMIN:
      return [
        ADMIN_PERMISSIONS.VIEW_DASHBOARD,
        ADMIN_PERMISSIONS.MANAGE_COMPANIES,
        ADMIN_PERMISSIONS.MANAGE_PARTNERS,
        ADMIN_PERMISSIONS.VIEW_TRANSACTIONS,
        ADMIN_PERMISSIONS.VIEW_ANALYTICS
      ]
    case ADMIN_ROLES.SUPPORT:
      return [
        ADMIN_PERMISSIONS.VIEW_DASHBOARD,
        ADMIN_PERMISSIONS.VIEW_TRANSACTIONS
      ]
    default:
      return []
  }
}