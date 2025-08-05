// src/lib/admin-auth.ts
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

// Admin User Interface
interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'support'
  permissions: string[]
  created_at: string
  last_login: string
}

// Auth Context Interface
interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isAuthenticated: boolean
}

// Create Auth Context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Auth Provider Component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      setLoading(true)
      
      // Check localStorage for admin session
      const adminSession = localStorage.getItem('easywelfare_admin_session')
      if (!adminSession) {
        setLoading(false)
        return
      }

      const sessionData = JSON.parse(adminSession)
      
      // Verify session is still valid (check expiry)
      if (sessionData.expires_at && new Date(sessionData.expires_at) < new Date()) {
        localStorage.removeItem('easywelfare_admin_session')
        setLoading(false)
        return
      }

      // Fetch current admin user data
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

      // Set authenticated admin user
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

      // In a real implementation, you'd use proper password hashing
      // For demo purposes, we'll use a simple check
      
      // Check if admin user exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      if (fetchError || !adminUser) {
        return { success: false, error: 'Admin non trovato o non attivo' }
      }

      // In production, use bcrypt or similar for password verification
      // For demo: simple password check (NEVER do this in production!)
      const isPasswordValid = password === 'admin123' // Demo password
      
      if (!isPasswordValid) {
        return { success: false, error: 'Credenziali non valide' }
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      // Create admin session
      const sessionData = {
        user_id: adminUser.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      localStorage.setItem('easywelfare_admin_session', JSON.stringify(sessionData))

      // Set user state
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
      // Remove session from localStorage
      localStorage.removeItem('easywelfare_admin_session')
      
      // Clear user state
      setUser(null)
      
      // Redirect to admin login
      window.location.href = '/admin/login'
      
    } catch (error) {
      console.error('Admin sign out error:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true
    
    // Check specific permissions
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

// Hook to use admin auth
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// Admin Auth Guard Component
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
    // Redirect to admin login
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  return <>{children}</>
}

// Permission Guard Component
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

// Utility function to create demo admin user
export async function createDemoAdminUser() {
  try {
    // Check if demo admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@easywelfare.com')
      .single()

    if (existingAdmin) {
      console.log('Demo admin user already exists')
      return existingAdmin
    }

    // Create demo admin user
    const { data: newAdmin, error } = await supabase
      .from('admin_users')
      .insert([{
        email: 'admin@easywelfare.com',
        password_hash: 'admin123', // In production, use proper hashing!
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

// Admin role constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  SUPPORT: 'support'
} as const

// Admin permissions constants
export const ADMIN_PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_COMPANIES: 'manage_companies',
  MANAGE_PARTNERS: 'manage_partners',
  VIEW_TRANSACTIONS: 'view_transactions',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADMINS: 'manage_admins'
} as const

// Helper function to get role display name
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

// Helper function to get role permissions
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