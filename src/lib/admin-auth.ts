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
      
      // Check localStorage for admin session
      const adminSession = localStorage.getItem('easywelfare_admin_session')
      if (!adminSession) {
        setLoading(false)
        return
      }

      const sessionData = JSON.parse(adminSession)
      
      // Check if session is expired
      if (sessionData.expires_at && new Date(sessionData.expires_at) < new Date()) {
        localStorage.removeItem('easywelfare_admin_session')
        setLoading(false)
        return
      }

      // Verify admin user exists and is active
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
        role: adminUser.role,
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

      // Check if admin user exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single()

      if (fetchError || !adminUser) {
        return { success: false, error: 'Admin non trovato o non attivo' }
      }

      // In production, you would hash the password and compare
      // For now, simple password check
      const isPasswordValid = password === adminUser.password_hash

      if (!isPasswordValid) {
        // Log failed attempt
        await logAdminActivity(adminUser.id, 'login_failed', null, null, {
          email: email,
          reason: 'invalid_password'
        })
        
        return { success: false, error: 'Credenziali non valide' }
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      // Create secure session
      const sessionData = {
        user_id: adminUser.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
      }

      localStorage.setItem('easywelfare_admin_session', JSON.stringify(sessionData))

      // Set user state
      setUser({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions || [],
        created_at: adminUser.created_at,
        last_login: new Date().toISOString()
      })

      // Log successful login
      await logAdminActivity(adminUser.id, 'login_success', null, null, {
        email: email,
        session_duration: '8h'
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
      if (user) {
        // Log logout
        await logAdminActivity(user.id, 'logout', null, null, {
          session_duration: 'manual_logout'
        })
      }

      // Remove session
      localStorage.removeItem('easywelfare_admin_session')
      setUser(null)
      
      // Redirect to login
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

  // Helper function to log admin activities
  const logAdminActivity = async (
    adminUserId: string, 
    action: string, 
    targetType: string | null, 
    targetId: string | null, 
    details: any = {}
  ) => {
    try {
      await supabase
        .from('admin_activity_log')
        .insert([{
          admin_user_id: adminUserId,
          action: action,
          target_type: targetType,
          target_id: targetId,
          details: details,
          ip_address: null, // Could be filled from request
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }])
    } catch (error) {
      console.error('Error logging admin activity:', error)
    }
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
  MANAGE_ADMINS: 'manage_admins',
  SYSTEM_MAINTENANCE: 'system_maintenance'
} as const

// Helper functions
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

// Function to create admin users programmatically
export async function createAdminUser(userData: {
  email: string
  password: string
  role: 'super_admin' | 'admin' | 'support'
  permissions?: string[]
}) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        email: userData.email.toLowerCase().trim(),
        password_hash: userData.password, // In production, hash this!
        role: userData.role,
        permissions: userData.permissions || getRolePermissions(userData.role),
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating admin user:', error)
    return { success: false, error: error }
  }
}