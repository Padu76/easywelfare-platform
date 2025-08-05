import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react'
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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      setLoading(true)
      console.log('🔍 Checking admin authentication...')
      
      // Check localStorage for admin session
      const adminSession = localStorage.getItem('easywelfare_admin_session')
      if (!adminSession) {
        console.log('🔍 No admin session found')
        setLoading(false)
        setInitialized(true)
        return
      }

      const sessionData = JSON.parse(adminSession)
      console.log('🔍 Found admin session:', sessionData)
      
      // Check if session is expired
      if (sessionData.expires_at && new Date(sessionData.expires_at) < new Date()) {
        console.log('⏰ Admin session expired')
        localStorage.removeItem('easywelfare_admin_session')
        setLoading(false)
        setInitialized(true)
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
        console.log('❌ Admin user not found or inactive:', error)
        localStorage.removeItem('easywelfare_admin_session')
        setLoading(false)
        setInitialized(true)
        return
      }

      console.log('✅ Admin user authenticated:', adminUser.email)
      setUser({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions || [],
        created_at: adminUser.created_at,
        last_login: adminUser.last_login || adminUser.created_at
      })

    } catch (error) {
      console.error('❌ Error checking admin auth:', error)
      localStorage.removeItem('easywelfare_admin_session')
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      console.log('🔐 Attempting admin login for:', email)

      // Check if admin user exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single()

      if (fetchError || !adminUser) {
        console.log('❌ Admin user not found:', fetchError)
        return { success: false, error: 'Admin non trovato o non attivo' }
      }

      console.log('👤 Found admin user:', adminUser.email, 'Role:', adminUser.role)

      // Password validation - handle both plaintext and hashed passwords
      let isPasswordValid = false
      
      // For demo purposes, check if password matches directly (plaintext)
      if (adminUser.password_hash === password) {
        isPasswordValid = true
        console.log('✅ Password validation: plaintext match')
      }
      // Future: add bcrypt hash comparison here
      else if (adminUser.password_hash && adminUser.password_hash.startsWith('$2b$')) {
        // This would be for bcrypt hashed passwords in production
        console.log('🔒 Password validation: hash comparison (not implemented)')
      }

      if (!isPasswordValid) {
        console.log('❌ Invalid password for:', email)
        
        // Log failed attempt
        await logAdminActivity(adminUser.id, 'login_failed', null, null, {
          email: email,
          reason: 'invalid_password',
          timestamp: new Date().toISOString()
        })
        
        return { success: false, error: 'Credenziali non valide' }
      }

      console.log('✅ Password validated successfully')

      // Update last login timestamp
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      if (updateError) {
        console.log('⚠️ Failed to update last_login:', updateError)
      }

      // Create secure session (8 hours expiry)
      const sessionData = {
        user_id: adminUser.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      }

      localStorage.setItem('easywelfare_admin_session', JSON.stringify(sessionData))
      console.log('💾 Admin session created, expires:', sessionData.expires_at)

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
        session_duration: '8h',
        timestamp: new Date().toISOString()
      })

      console.log('🎉 Admin login successful!')
      return { success: true }

    } catch (error) {
      console.error('❌ Admin sign in error:', error)
      return { success: false, error: 'Errore durante il login. Verifica la connessione.' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Admin logout initiated')
      
      if (user) {
        // Log logout
        await logAdminActivity(user.id, 'logout', null, null, {
          session_duration: 'manual_logout',
          timestamp: new Date().toISOString()
        })
        console.log('📝 Logout activity logged')
      }

      // Remove session
      localStorage.removeItem('easywelfare_admin_session')
      setUser(null)
      
      console.log('✅ Admin session cleared')
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login'
      }
      
    } catch (error) {
      console.error('❌ Admin sign out error:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === 'super_admin') return true
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
      const { error } = await supabase
        .from('admin_activity_log')
        .insert([{
          admin_user_id: adminUserId,
          action: action,
          target_type: targetType,
          target_id: targetId,
          details: details,
          ip_address: null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          created_at: new Date().toISOString()
        }])

      if (error) {
        console.log('⚠️ Failed to log admin activity:', error)
      }
    } catch (error) {
      console.error('❌ Error logging admin activity:', error)
    }
  }

  const value: AdminAuthContextType = {
    user,
    loading: loading && !initialized,
    signIn,
    signOut,
    hasPermission,
    isAuthenticated: !!user
  }

  // Use createElement instead of JSX
  return createElement(AdminAuthContext.Provider, { value }, children)
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
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect if not loading, no user, not already redirecting, and not on login page
    if (!loading && !user && !redirecting && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      console.log('🚫 AdminAuthGuard: Current path:', currentPath)
      
      // Don't redirect if already on login page
      if (currentPath.includes('/admin/login')) {
        console.log('✅ Already on login page, no redirect needed')
        return
      }
      
      console.log('🚫 No authenticated user, redirecting to login...')
      setRedirecting(true)
      
      // Use setTimeout to avoid React state update warnings
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 100)
    }
  }, [user, loading, redirecting])

  // Show loading state
  if (loading) {
    return createElement(
      'div',
      { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
      createElement(
        'div',
        { className: 'text-center' },
        createElement('div', { 
          className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' 
        }),
        createElement('p', { className: 'text-gray-600' }, '🔍 Verifica autenticazione admin...')
      )
    )
  }

  // Show redirecting state
  if (redirecting) {
    return createElement(
      'div',
      { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
      createElement(
        'div',
        { className: 'text-center' },
        createElement('div', { 
          className: 'animate-pulse rounded-full h-12 w-12 bg-blue-600 mx-auto mb-4' 
        }),
        createElement('p', { className: 'text-gray-600' }, '🚀 Reindirizzamento al login...')
      )
    )
  }

  // Don't show anything if no user (will redirect)
  if (!user) {
    return null
  }

  console.log('✅ AdminAuthGuard: User authenticated, showing protected content')
  return createElement('div', {}, children)
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
    return fallback || createElement(
      'div',
      { className: 'bg-red-50 border border-red-200 rounded-lg p-4' },
      createElement(
        'div',
        { className: 'flex items-center' },
        createElement('span', { className: 'text-red-600 text-lg mr-2' }, '🚫'),
        createElement(
          'p',
          { className: 'text-red-800' },
          createElement('strong', {}, 'Accesso negato: '),
          'Non hai i permessi per visualizzare questo contenuto.'
        )
      )
    )
  }

  return createElement('div', {}, children)
}

// Constants and helper functions
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
  MANAGE_ADMINS: 'manage_admins',
  SYSTEM_MAINTENANCE: 'system_maintenance'
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
        password_hash: userData.password,
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
    return { success: false, error: error }
  }
}