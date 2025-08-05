import { createContext, useContext, useState, ReactNode, createElement } from 'react'

interface AdminUser {
  id: string
  email: string
  role: string
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
  const [user] = useState<AdminUser | null>({
    id: '1',
    email: 'admin@easywelfare.com',
    role: 'super_admin',
    permissions: ['view_dashboard', 'manage_companies', 'manage_partners', 'view_transactions', 'manage_settings', 'view_analytics'],
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  })
  const [loading] = useState(false)

  const signIn = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: true }
  }

  const signOut = async () => {
    console.log('Sign out')
  }

  const hasPermission = (): boolean => {
    return true
  }

  const value: AdminAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
    isAuthenticated: !!user
  }

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
  return children
}

export function PermissionGuard({ children }: { children: ReactNode }) {
  return children
}

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  SUPPORT: 'support'
}

export const ADMIN_PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_COMPANIES: 'manage_companies',
  MANAGE_PARTNERS: 'manage_partners',
  VIEW_TRANSACTIONS: 'view_transactions',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADMINS: 'manage_admins'
}