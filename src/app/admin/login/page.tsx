'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  
  const { signIn, isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        router.push('/admin/dashboard')
      } else {
        setError(result.error || 'Login fallito')
      }
    } catch (err) {
      setError('Errore durante il login')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('admin@easywelfare.com')
    setPassword('admin123')
    setShowDemo(false)
  }

  // Show loading if checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica accesso...</p>
        </div>
      </div>
    )
  }

  // Don't show login if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">EW</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">Accedi al pannello di controllo EasyWelfare</p>
        </div>

        {/* Login Form */}
        <Card>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-600 text-lg mr-2">❌</span>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <Input
                label="Email Admin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@easywelfare.com"
                required
                disabled={isLoading}
                icon={<span>👤</span>}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                icon={<span>🔐</span>}
              />

              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading || !email || !password}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Accesso in corso...' : '🚀 Accedi alla Dashboard'}
              </Button>
            </form>
          </Card.Content>
        </Card>

        {/* Demo Credentials */}
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                🧪 <strong>Modalità Demo</strong> - Usa credenziali di test
              </p>
              
              {!showDemo ? (
                <Button
                  variant="secondary"
                  onClick={() => setShowDemo(true)}
                  className="w-full"
                >
                  🎯 Mostra Credenziali Demo
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <p className="text-blue-800 text-sm font-medium mb-2">Credenziali Demo:</p>
                    <p className="text-blue-700 text-sm font-mono">Email: admin@easywelfare.com</p>
                    <p className="text-blue-700 text-sm font-mono">Password: admin123</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="success"
                      onClick={fillDemoCredentials}
                      size="sm"
                      className="flex-1"
                    >
                      ✅ Compila Automaticamente
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowDemo(false)}
                      size="sm"
                      className="flex-1"
                    >
                      🙈 Nascondi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sistema Operativo</p>
                <p className="text-xs text-gray-500">Tutti i servizi funzionanti</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">EasyWelfare v1.0</p>
              <p className="text-xs text-green-600">✅ Online</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🛡️ Area riservata agli amministratori di sistema
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Per supporto: admin@easywelfare.com
          </p>
        </div>
      </div>
    </div>
  )
}