'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

interface EmployeeData {
  id: string
  first_name: string
  last_name: string
  email: string
  available_points: number
  total_points: number
  used_points: number
  is_active: boolean
  company_id: string
  hire_date: string
}

interface TransactionData {
  id: string
  employee_id: string
  service_name: string
  partner_name: string
  points_used: number
  status: string
  created_at: string
  savings: number
}

interface StatsData {
  totalTransactions: number
  totalSavings: number
  monthlyUsage: number
  favoriteCategory: string
}

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using first employee. In real app, this comes from auth
  const currentEmployeeId = 'emp_1'

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch employee data
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', currentEmployeeId)
        .single()

      if (employeeError) throw employeeError

      setEmployee(employeeData)

      // Fetch recent transactions (last 5)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('employee_id', currentEmployeeId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (transactionsError) throw transactionsError

      setRecentTransactions(transactionsData || [])

      // Calculate stats
      const totalTransactions = transactionsData?.length || 0
      const totalSavings = transactionsData?.reduce((sum, t) => sum + (t.savings || 0), 0) || 0
      
      // Monthly usage (transactions in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthlyUsage = transactionsData?.filter(t => 
        new Date(t.created_at) >= thirtyDaysAgo
      ).length || 0

      setStats({
        totalTransactions,
        totalSavings,
        monthlyUsage,
        favoriteCategory: 'Fitness' // Placeholder - would be calculated from data
      })

    } catch (err) {
      console.error('Error fetching employee data:', err)
      setError('Errore nel caricamento dei dati. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Errore di Caricamento</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchEmployeeData}>
                🔄 Riprova
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">👤</span>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dipendente non trovato</h1>
              <p className="text-gray-600">Verifica i tuoi dati di accesso</p>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  const progressPercentage = employee.total_points > 0 
    ? (employee.used_points / employee.total_points) * 100 
    : 0

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">✅ Completato</Badge>
      case 'pending':
        return <Badge variant="warning">⏳ In attesa</Badge>
      case 'cancelled':
        return <Badge variant="danger">❌ Annullato</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ciao {employee.first_name}! 👋
        </h1>
        <p className="text-gray-600">Ecco i tuoi punti welfare disponibili</p>
      </div>

      {/* Points Overview - REAL DATA FROM SUPABASE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Punti Disponibili</p>
              <p className="text-3xl font-bold">{employee.available_points.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Punti Utilizzati</p>
                <p className="text-2xl font-bold text-gray-900">{employee.used_points.toLocaleString()}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Punti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{employee.total_points.toLocaleString()}</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Progress Bar - REAL DATA */}
      <Card>
        <Card.Content>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso Utilizzo</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div  
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Hai utilizzato {employee.used_points.toLocaleString()} di {employee.total_points.toLocaleString()} punti ({progressPercentage.toFixed(0)}%)
          </p>
        </Card.Content>
      </Card>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Azioni Rapide</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Link href="/dashboard/employee/catalog" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <span>🛍️</span>
                <span>Esplora Catalogo</span>
              </Link>
              <Link href="/dashboard/employee/qr" className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Genera QR Code</span>
              </Link>
              <Link href="/dashboard/employee/history" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <span>📋</span>
                <span>Visualizza Storico</span>
              </Link>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Statistiche Personali</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-md">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <p className="font-medium">Transazioni Totali</p>
                  <p className="text-sm text-gray-600">{stats?.totalTransactions || 0} servizi utilizzati</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-md">
                <span className="text-2xl">💰</span>
                <div className="flex-1">
                  <p className="font-medium">Risparmi Totali</p>
                  <p className="text-sm text-gray-600">
                    Calcolato sui servizi utilizzati
                  </p>
                </div>
                <span className="text-green-600 font-semibold">
                  €{stats?.totalSavings || 0}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-md">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <p className="font-medium">Account Attivo</p>
                  <p className="text-sm text-gray-600">
                    {employee.is_active ? 'Tutte le funzioni disponibili' : 'Account sospeso'}
                  </p>
                </div>
                <span className={`font-semibold ${employee.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {employee.is_active ? '✅' : '❌'}
                </span>
              </div>

              {stats && stats.monthlyUsage > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-md">
                  <span className="text-2xl">📈</span>
                  <div className="flex-1">
                    <p className="font-medium">Questo Mese</p>
                    <p className="text-sm text-gray-600">
                      {stats.monthlyUsage} servizi utilizzati
                    </p>
                  </div>
                  <span className="text-yellow-600 font-semibold">
                    +{stats.monthlyUsage}
                  </span>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Transactions - REAL DATA FROM SUPABASE */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Transazioni Recenti</h3>
        </Card.Header>
        <Card.Content>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Partner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.service_name}</td>
                      <td className="py-3 px-4 text-gray-600">{transaction.partner_name}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">-{transaction.points_used}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">🎯</span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nessuna transazione ancora</h4>
              <p className="text-gray-600 mb-4">Inizia a utilizzare i tuoi punti welfare!</p>
              <Link href="/dashboard/employee/catalog">
                <Button>
                  Esplora Servizi
                </Button>
              </Link>
            </div>
          )}
          
          {recentTransactions.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/employee/history" className="text-blue-600 hover:text-blue-800">
                Vedi tutte le transazioni →
              </Link>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Performance Insights */}
      {stats && stats.totalTransactions > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">📊 I Tuoi Insights</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
                <div className="text-sm text-gray-600">Servizi Totali</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">€{stats.totalSavings}</div>
                <div className="text-sm text-gray-600">Risparmi Totali</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.monthlyUsage}</div>
                <div className="text-sm text-gray-600">Questo Mese</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">🏋️ {stats.favoriteCategory}</div>
                <div className="text-sm text-gray-600">Categoria Preferita</div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Massimizza i tuoi benefici</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Usa i punti prima della scadenza</li>
                <li>• Combina più servizi dello stesso partner</li>
                <li>• Controlla le offerte speciali</li>
                <li>• Invita colleghi per bonus extra</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Come funziona</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Scegli un servizio dal catalogo</li>
                <li>• Genera il QR code</li>
                <li>• Vai dal partner e mostra il QR</li>
                <li>• Goditi il servizio e i risparmi!</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Account Status & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">👤 Profilo</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{employee.first_name} {employee.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{employee.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data Assunzione:</span>
                <span className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stato Account:</span>
                <Badge variant={employee.is_active ? 'success' : 'danger'}>
                  {employee.is_active ? '✅ Attivo' : '❌ Sospeso'}
                </Badge>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">🆘 Supporto</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full">
                💬 Contatta il Supporto
              </Button>
              <Button variant="secondary" className="w-full">
                📖 Guide e FAQ
              </Button>
              <Button variant="secondary" className="w-full">
                📝 Suggerisci Miglioramenti
              </Button>
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Supporto attivo 9:00-18:00, Lun-Ven
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}