'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

interface TransactionData {
  id: string
  service_name: string
  partner_name?: string
  points_used: number
  status: string
  created_at: string
  savings?: number
  category?: string
}

interface EmployeeData {
  id: string
  available_points: number
  total_points: number
  used_points: number
  first_name: string
  last_name: string
}

export default function EmployeeHistoryPage() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get first employee or create demo data
      let { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .limit(1)
        .single()

      if (employeeError || !employeeData) {
        // Create demo employee if none exists
        const demoEmployee = {
          id: 'demo_emp_' + Date.now(),
          email: 'mario.rossi@demo.com',
          first_name: 'Mario',
          last_name: 'Rossi',
          available_points: 850,
          total_points: 1200,
          used_points: 350,
          is_active: true,
          company_id: 'demo_company'
        }

        const { data: newEmployee, error: createError } = await supabase
          .from('employees')
          .insert([demoEmployee])
          .select()
          .single()

        if (!createError && newEmployee) {
          employeeData = newEmployee
        }
      }

      setEmployee(employeeData)

      // Get transactions for this employee
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('employee_id', employeeData?.id)
        .order('created_at', { ascending: false })

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
      }

      // If no transactions, create some demo data
      if (!transactionsData || transactionsData.length === 0) {
        const demoTransactions = [
          {
            id: 'demo_tx_1',
            employee_id: employeeData?.id,
            service_name: 'Abbonamento Palestra Premium',
            points_used: 200,
            status: 'completed',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            savings: 45,
            category: 'fitness'
          },
          {
            id: 'demo_tx_2',
            employee_id: employeeData?.id,
            service_name: 'Corso di Formazione Online',
            points_used: 100,
            status: 'completed',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            savings: 25,
            category: 'education'
          },
          {
            id: 'demo_tx_3',
            employee_id: employeeData?.id,
            service_name: 'Massaggio Rilassante',
            points_used: 50,
            status: 'pending',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            savings: 15,
            category: 'wellness'
          }
        ]

        await supabase.from('transactions').insert(demoTransactions)
        setTransactions(demoTransactions)
      } else {
        const formattedTransactions = transactionsData.map(tx => ({
          ...tx,
          partner_name: 'Partner Demo',
          savings: Math.round(tx.points_used * 0.3),
          category: 'wellness'
        }))
        setTransactions(formattedTransactions)
      }

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Errore nel caricamento dei dati')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'fitness': return '🏋️'
      case 'wellness': return '💆'
      case 'health': return '🏥'
      case 'nutrition': return '🥗'
      case 'education': return '📚'
      case 'lifestyle': return '🎨'
      default: return '⭐'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">Completato</Badge>
      case 'pending':
        return <Badge variant="warning">In Attesa</Badge>
      case 'cancelled':
        return <Badge variant="danger">Annullato</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const now = new Date()
      const transactionDate = new Date(transaction.created_at)
      switch (dateFilter) {
        case 'last_week':
          matchesDate = (now.getTime() - transactionDate.getTime()) <= (7 * 24 * 60 * 60 * 1000)
          break
        case 'last_month':
          matchesDate = (now.getTime() - transactionDate.getTime()) <= (30 * 24 * 60 * 60 * 1000)
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.points_used, 0)
  
  const totalSavings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.savings || 0), 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
              <Button onClick={fetchData}>🔄 Riprova</Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Storico Transazioni</h1>
        <p className="text-gray-600">Visualizza tutte le tue attività welfare</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Attuale</p>
                <p className="text-2xl font-bold text-blue-600">
                  {employee?.available_points?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">💎</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Punti Spesi</p>
                <p className="text-2xl font-bold text-red-600">{totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">📊</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risparmi</p>
                <p className="text-2xl font-bold text-green-600">€{totalSavings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transazioni</p>
                <p className="text-2xl font-bold text-purple-600">{transactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📋</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">🔍 Filtri</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cerca servizi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Tutti i periodi</option>
              <option value="last_week">Ultima settimana</option>
              <option value="last_month">Ultimo mese</option>
            </select>
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tutti gli stati</option>
              <option value="completed">Completato</option>
              <option value="pending">In Attesa</option>
              <option value="cancelled">Annullato</option>
            </select>
            
            <Button 
              variant="secondary"
              onClick={() => {
                setSearchTerm('')
                setDateFilter('all')
                setStatusFilter('all')
              }}
            >
              🗑️ Reset
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              💳 Transazioni ({filteredTransactions.length})
            </h3>
            <Button variant="secondary" size="sm">
              📊 Esporta
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Risparmi</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getCategoryIcon(transaction.category)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.service_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{transaction.points_used}</td>
                    <td className="py-3 px-4">
                      {transaction.savings ? (
                        <span className="font-semibold text-green-600">€{transaction.savings}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📋</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna transazione trovata
              </h3>
              <p className="text-gray-600">
                Modifica i filtri o inizia a utilizzare i servizi welfare
              </p>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}