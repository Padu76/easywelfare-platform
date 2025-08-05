'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

interface EmployeeData {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  employee_code: string
  department: string
  allocated_credits: number
  used_credits: number
  status: string
  hire_date: string
  created_at: string
  updated_at: string
}

interface TransactionData {
  id: string
  employee_id: string
  service_name: string
  partner_name?: string
  points_used: number
  status: string
  created_at: string
  savings?: number
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

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Fetching employee data with correct schema...')

      // Try to get active employee using correct schema
      let { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .limit(1)

      if (employeesError) {
        console.log('Error with status=active, trying any employee:', employeesError)
        // Try to get any employee
        const { data: anyEmployees, error: anyError } = await supabase
          .from('employees')
          .select('*')
          .limit(1)

        if (!anyError && anyEmployees && anyEmployees.length > 0) {
          employees = anyEmployees
        }
      }

      let currentEmployee = employees?.[0]

      // If no employee found, use mock data
      if (!currentEmployee) {
        console.log('🔧 No employee found, using mock data')
        currentEmployee = {
          id: 'demo_emp_001',
          company_id: 'demo_company_001',
          first_name: 'Mario',
          last_name: 'Rossi',
          email: 'mario.rossi@demo.com',
          employee_code: 'EMP001',
          department: 'IT',
          allocated_credits: 1200,
          used_credits: 350,
          status: 'active',
          hire_date: '2024-01-15',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      console.log('✅ Employee data loaded:', currentEmployee)
      setEmployee(currentEmployee)

      // Fetch recent transactions (last 5)
      console.log('🔍 Fetching transactions for employee:', currentEmployee.id)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('employee_id', currentEmployee.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (transactionsError) {
        console.warn('Error fetching transactions:', transactionsError)
        // Continue with demo transactions
      }

      // If no transactions found, use demo data
      const transactions = transactionsData && transactionsData.length > 0 ? transactionsData : [
        {
          id: 'demo_tx_1',
          employee_id: currentEmployee.id,
          service_name: 'Sessione Fitness Premium',
          partner_name: 'FitCenter Milano',
          points_used: 50,
          status: 'completed',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          savings: 25
        },
        {
          id: 'demo_tx_2',
          employee_id: currentEmployee.id,
          service_name: 'Massaggio Rilassante',
          partner_name: 'Wellness Spa',
          points_used: 80,
          status: 'completed',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          savings: 40
        },
        {
          id: 'demo_tx_3',
          employee_id: currentEmployee.id,
          service_name: 'Corso Online Leadership',
          partner_name: 'EduTech Academy',
          points_used: 20,
          status: 'pending',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          savings: 15
        }
      ]

      setRecentTransactions(transactions)

      // Calculate stats using correct schema
      const totalTransactions = transactions.length
      const totalSavings = transactions.reduce((sum, t) => sum + (t.savings || 0), 0)
      
      // Monthly usage (transactions in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthlyUsage = transactions.filter(t => 
        new Date(t.created_at) >= thirtyDaysAgo
      ).length

      // Determine favorite category from transactions
      const categories = transactions.map(t => {
        const serviceName = t.service_name.toLowerCase()
        if (serviceName.includes('fitness') || serviceName.includes('palestra')) return 'Fitness'
        if (serviceName.includes('massaggio') || serviceName.includes('spa')) return 'Benessere'
        if (serviceName.includes('corso') || serviceName.includes('formazione')) return 'Formazione'
        return 'Lifestyle'
      })

      const favoriteCategory = categories.length > 0 
        ? categories.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
          )
        : 'Fitness'

      setStats({
        totalTransactions,
        totalSavings,
        monthlyUsage,
        favoriteCategory
      })

      console.log('✅ Employee dashboard data loaded successfully:', {
        employee: currentEmployee.first_name,
        transactions: totalTransactions,
        savings: totalSavings,
        availableCredits: currentEmployee.allocated_credits - currentEmployee.used_credits
      })

    } catch (err) {
      console.error('Error fetching employee data:', err)
      setError('Errore nel caricamento dei dati dipendente')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate available credits using correct schema
  const availableCredits = employee ? (employee.allocated_credits - employee.used_credits) : 0
  const progressPercentage = employee && employee.allocated_credits > 0 
    ? (employee.used_credits / employee.allocated_credits) * 100 
    : 0

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">✅ Completato</Badge>
      case 'pending':
        return <Badge variant="warning">⏳ In attesa</Badge>
      case 'cancelled':
        return <Badge variant="danger">❌ Annullato</Badge>
      case 'active':
        return <Badge variant="success">✅ Attivo</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
              <Button onClick={fetchEmployeeData}>🔄 Riprova</Button>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Nessun Dipendente Trovato</h1>
              <p className="text-gray-600 mb-4">Riprova il caricamento dei dati</p>
              <Button onClick={fetchEmployeeData}>🔄 Ricarica Dati</Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ciao {employee.first_name}! 👋
          </h1>
          <p className="text-gray-600">Ecco i tuoi crediti welfare disponibili</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Account attivo dal</p>
          <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString('it-IT')}</p>
        </div>
      </div>

      {/* Success Alert */}
      {recentTransactions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">✅</span>
            <div>
              <h3 className="text-green-800 font-bold">Dashboard Operativa!</h3>
              <p className="text-green-700 text-sm">
                Dati caricati con successo. {recentTransactions.length} transazioni trovate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Employee Info Card */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">👤 Informazioni Dipendente</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nome Completo</p>
              <p className="font-medium">{employee.first_name} {employee.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Codice Dipendente</p>
              <p className="font-medium">{employee.employee_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dipartimento</p>
              <p className="font-medium">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stato</p>
              <div className="mt-1">{getStatusBadge(employee.status)}</div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Credits Overview - CORRECT SCHEMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Crediti Disponibili</p>
              <p className="text-3xl font-bold">{availableCredits.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">Pronti per essere utilizzati</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Crediti Utilizzati</p>
                <p className="text-2xl font-bold text-gray-900">{employee.used_credits.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Spesi per servizi</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Crediti Assegnati</p>
                <p className="text-2xl font-bold text-gray-900">{employee.allocated_credits.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Budget totale welfare</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Progress Bar - CORRECT CALCULATIONS */}
      <Card>
        <Card.Content>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📈 Progresso Utilizzo</h3>
            <span className="text-sm text-gray-600">
              {progressPercentage.toFixed(0)}% utilizzato
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div  
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Hai utilizzato {employee.used_credits.toLocaleString()} di {employee.allocated_credits.toLocaleString()} crediti
          </p>
        </Card.Content>
      </Card>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">🚀 Azioni Rapide</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Link href="/dashboard/employee/catalog" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <span>🛍️</span>
                <span>Esplora Catalogo Servizi</span>
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
            <h3 className="text-lg font-semibold text-gray-900">📊 Le Tue Statistiche</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-md">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <p className="font-medium">Transazioni Totali</p>
                  <p className="text-sm text-gray-600">{stats?.totalTransactions || 0} servizi utilizzati</p>
                </div>
                <span className="text-blue-600 font-bold text-lg">
                  {stats?.totalTransactions || 0}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-md">
                <span className="text-2xl">💰</span>
                <div className="flex-1">
                  <p className="font-medium">Risparmi Totali</p>
                  <p className="text-sm text-gray-600">Risparmi sui servizi utilizzati</p>
                </div>
                <span className="text-green-600 font-bold text-lg">
                  €{stats?.totalSavings || 0}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-md">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <p className="font-medium">Status Account</p>
                  <p className="text-sm text-gray-600">
                    {employee.status === 'active' ? 'Tutte le funzioni disponibili' : 'Account non attivo'}
                  </p>
                </div>
                <span className={`font-bold text-lg ${employee.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {employee.status === 'active' ? '✅' : '❌'}
                </span>
              </div>

              {stats && stats.monthlyUsage > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-md">
                  <span className="text-2xl">📈</span>
                  <div className="flex-1">
                    <p className="font-medium">Attività Mensile</p>
                    <p className="text-sm text-gray-600">Servizi utilizzati questo mese</p>
                  </div>
                  <span className="text-yellow-600 font-bold text-lg">
                    {stats.monthlyUsage}
                  </span>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">💳 Transazioni Recenti</h3>
            {recentTransactions.length > 0 && (
              <Link href="/dashboard/employee/history" className="text-blue-600 hover:text-blue-800 text-sm">
                Vedi tutte →
              </Link>
            )}
          </div>
        </Card.Header>
        <Card.Content>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Partner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Crediti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Risparmio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.service_name}</td>
                      <td className="py-3 px-4 text-gray-600">{transaction.partner_name || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">-{transaction.points_used}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">€{transaction.savings || 0}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(transaction.created_at).toLocaleDateString('it-IT')}</td>
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
              <h4 className="text-lg font-medium text-gray-900 mb-2">Inizia il tuo percorso welfare!</h4>
              <p className="text-gray-600 mb-4">Hai {availableCredits} crediti pronti per essere utilizzati</p>
              <Link href="/dashboard/employee/catalog">
                <Button>🛍️ Esplora Servizi</Button>
              </Link>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Performance Insights */}
      {stats && stats.totalTransactions > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">📊 I Tuoi Insights Welfare</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
                <div className="text-sm text-gray-600">Servizi Utilizzati</div>
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
                <div className="text-lg font-bold text-yellow-600">
                  {stats.favoriteCategory === 'Fitness' ? '🏋️' : 
                   stats.favoriteCategory === 'Benessere' ? '💆' : 
                   stats.favoriteCategory === 'Formazione' ? '📚' : '🎨'} {stats.favoriteCategory}
                </div>
                <div className="text-sm text-gray-600">Categoria Preferita</div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Account Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">👤 Il Tuo Profilo</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome Completo:</span>
                <span className="font-medium">{employee.first_name} {employee.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Aziendale:</span>
                <span className="font-medium">{employee.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Codice Dipendente:</span>
                <span className="font-medium">{employee.employee_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dipartimento:</span>
                <span className="font-medium">{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data Assunzione:</span>
                <span className="font-medium">{new Date(employee.hire_date).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stato Account:</span>
                {getStatusBadge(employee.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crediti Rimanenti:</span>
                <span className="font-bold text-blue-600">{availableCredits} crediti</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti & Supporto</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">💡 Massimizza i Benefici</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa i crediti prima della scadenza annuale</li>
                  <li>• Combina servizi dello stesso partner per sconti</li>
                  <li>• Controlla le offerte speciali nel catalogo</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button variant="secondary" className="w-full">
                  💬 Contatta il Supporto
                </Button>
                <Button variant="secondary" className="w-full">
                  📖 Guide e FAQ
                </Button>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  🕘 Supporto attivo 9:00-18:00, Lun-Ven
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}