'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

enum ServiceCategory {
  FITNESS = 'fitness',
  WELLNESS = 'wellness',
  HEALTH = 'health',
  NUTRITION = 'nutrition',
  EDUCATION = 'education',
  LIFESTYLE = 'lifestyle'
}

interface TransactionData {
  id: string
  service_name: string
  partner_name?: string
  points_used: number
  status: string
  created_at: string
  notes?: string
  savings?: number
  original_price?: number
  category?: string
  partners?: {
    business_name: string
  }
  services?: {
    category: string
    original_price: number
    discount_percentage: number
  }
}

interface EmployeeData {
  id: string
  available_points: number
  total_points: number
  used_points: number
}

interface PointsMovement {
  date: Date
  type: 'received' | 'spent'
  amount: number
  description: string
}

export default function EmployeeHistoryPage() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [pointsHistory, setPointsHistory] = useState<PointsMovement[]>([])
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using first employee. In real app, this comes from auth
  const currentEmployeeId = 'emp_1'

  useEffect(() => {
    fetchEmployeeData()
    fetchTransactions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEmployeeData = async () => {
    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, available_points, total_points, used_points')
        .eq('id', currentEmployeeId)
        .single()

      if (employeeError) throw employeeError
      setEmployee(employeeData)
    } catch (err) {
      console.error('Error fetching employee data:', err)
      setError('Errore nel caricamento dati dipendente')
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch transactions with partner and service info
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          partners(business_name),
          services(category, original_price, discount_percentage)
        `)
        .eq('employee_id', currentEmployeeId)
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      // Format transaction data and calculate savings
      const formattedTransactions = (transactionsData || []).map(tx => {
        const service = tx.services
        const partner = tx.partners
        
        let savings = 0
        let originalPrice = 0
        
        if (service && service.original_price && service.discount_percentage) {
          originalPrice = service.original_price
          savings = Math.round(originalPrice * (service.discount_percentage / 100))
        }

        return {
          ...tx,
          partner_name: partner?.business_name || 'Partner Sconosciuto',
          category: service?.category || 'other',
          original_price: originalPrice,
          savings: savings
        }
      })

      setTransactions(formattedTransactions)

      // Generate points movement history
      await generatePointsHistory(formattedTransactions)

    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Errore nel caricamento transazioni')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePointsHistory = async (transactions: TransactionData[]) => {
    try {
      // Get employee creation/hiring data for initial points assignment
      const { data: employeeCreation, error: creationError } = await supabase
        .from('employees')
        .select('created_at, total_points')
        .eq('id', currentEmployeeId)
        .single()

      if (creationError) throw creationError

      const movements: PointsMovement[] = []

      // Add initial points assignment
      if (employeeCreation) {
        movements.push({
          date: new Date(employeeCreation.created_at),
          type: 'received',
          amount: employeeCreation.total_points,
          description: 'Assegnazione iniziale punti'
        })
      }

      // Add transaction movements
      transactions.forEach(tx => {
        if (tx.status === 'completed' || tx.status === 'pending') {
          movements.push({
            date: new Date(tx.created_at),
            type: 'spent',
            amount: -tx.points_used,
            description: tx.service_name
          })
        }
      })

      // Sort by date (most recent first)
      movements.sort((a, b) => b.date.getTime() - a.date.getTime())

      setPointsHistory(movements)
    } catch (err) {
      console.error('Error generating points history:', err)
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case ServiceCategory.FITNESS: return '🏋️'
      case ServiceCategory.WELLNESS: return '💆'
      case ServiceCategory.HEALTH: return '🏥'
      case ServiceCategory.NUTRITION: return '🥗'
      case ServiceCategory.EDUCATION: return '📚'
      case ServiceCategory.LIFESTYLE: return '🎨'
      default: return '⭐'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case TransactionStatus.COMPLETED:
        return <Badge variant="success" icon="✅">Completato</Badge>
      case TransactionStatus.PENDING:
        return <Badge variant="warning" icon="⏳">In Attesa</Badge>
      case TransactionStatus.CANCELLED:
        return <Badge variant="danger" icon="❌">Annullato</Badge>
      case TransactionStatus.EXPIRED:
        return <Badge variant="default" icon="⏰">Scaduto</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.partner_name && transaction.partner_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    
    // Date filter logic
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
        case 'last_3_months':
          matchesDate = (now.getTime() - transactionDate.getTime()) <= (90 * 24 * 60 * 60 * 1000)
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate
  })

  // Calculate statistics from real data
  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.points_used, 0)
  
  const totalSavings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.savings || 0), 0)

  const handleExportExcel = () => {
    console.log('Exporting to Excel:', filteredTransactions)
    alert('Funzione export Excel - da implementare con libreria XLSX')
  }

  const handleExportPDF = () => {
    console.log('Exporting to PDF:', filteredTransactions)
    alert('Funzione export PDF - da implementare con libreria jsPDF')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Button onClick={() => {
                setError(null)
                fetchTransactions()
                fetchEmployeeData()
              }}>
                🔄 Riprova
              </Button>
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
        <h1 className="text-2xl font-bold text-gray-900">Storico Transazioni</h1>
        <p className="text-gray-600">Visualizza tutte le tue attività welfare e movimenti punti</p>
      </div>

      {/* Summary Cards - REAL DATA FROM SUPABASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Attuale</p>
                <p className="text-2xl font-bold text-blue-600">{employee?.available_points?.toLocaleString() || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Risparmi Totali</p>
                <p className="text-2xl font-bold text-green-600">€{totalSavings.toLocaleString()}</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Filtri</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Cerca servizi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<span>🔍</span>}
            />
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Tutti i periodi</option>
              <option value="last_week">Ultima settimana</option>
              <option value="last_month">Ultimo mese</option>
              <option value="last_3_months">Ultimi 3 mesi</option>
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
              <option value="expired">Scaduto</option>
            </select>
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tutte le categorie</option>
              <option value="fitness">🏋️ Fitness</option>
              <option value="wellness">💆 Benessere</option>
              <option value="health">🏥 Salute</option>
              <option value="nutrition">🥗 Nutrizione</option>
              <option value="education">📚 Formazione</option>
              <option value="lifestyle">🎨 Lifestyle</option>
            </select>
            
            <Button 
              variant="secondary"
              onClick={() => {
                setSearchTerm('')
                setDateFilter('all')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
            >
              🗑️ Reset
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Transactions Table - REAL DATA FROM SUPABASE */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Transazioni ({filteredTransactions.length})
            </h3>
            <Button variant="secondary" size="sm" onClick={handleExportExcel}>
              📊 Esporta Excel
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Partner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Risparmi</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
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
                          {transaction.notes && (
                            <p className="text-xs text-gray-500">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{transaction.partner_name}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{transaction.points_used}</td>
                    <td className="py-3 px-4">
                      {transaction.savings && transaction.savings > 0 ? (
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
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm">
                          👁️ Dettagli
                        </Button>
                        {transaction.status === 'completed' && (
                          <Button variant="secondary" size="sm">
                            ⭐ Recensione
                          </Button>
                        )}
                      </div>
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
                Prova a modificare i filtri di ricerca o inizia a utilizzare i servizi welfare
              </p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Points Movement History - REAL DATA */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Movimenti Punti</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {pointsHistory.slice(0, 10).map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    movement.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={movement.type === 'received' ? 'text-green-600' : 'text-red-600'}>
                      {movement.type === 'received' ? '➕' : '➖'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{movement.description}</p>
                    <p className="text-sm text-gray-600">{movement.date.toLocaleDateString()} {movement.date.toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${
                  movement.type === 'received' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {movement.amount > 0 ? '+' : ''}{movement.amount}
                </span>
              </div>
            ))}
            
            {pointsHistory.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="secondary" size="sm">
                  Mostra tutti i movimenti ({pointsHistory.length})
                </Button>
              </div>
            )}
            
            {pointsHistory.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">💎</span>
                <p className="text-gray-600">Nessun movimento punti ancora</p>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Export Options */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Esporta Dati</h3>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExportPDF}>
              📄 Esporta PDF
            </Button>
            <Button variant="secondary" onClick={handleExportExcel}>
              📊 Esporta Excel
            </Button>
            <Button variant="secondary">
              📧 Invia via Email
            </Button>
            <Button variant="secondary">
              🗂️ Scarica Ricevute
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}