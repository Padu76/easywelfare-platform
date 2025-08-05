'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

// Interfaces
interface TransactionData {
  id: string
  employee_id: string
  service_name: string
  points_used: number
  status: string
  created_at: string
  employees?: {
    first_name: string
    last_name: string
  }
}

interface ProcessedTransaction {
  id: string
  customerName: string
  serviceName: string
  pointsUsed: number
  commission: number
  netAmount: number
  date: Date
  status: string
  payoutDate: Date | null
  qrScannedAt: Date
}

interface MonthlyStats {
  totalTransactions: number
  totalGross: number
  totalCommission: number
  totalNet: number
  pendingPayout: number
}

interface PayoutHistory {
  id: string
  month: string
  totalTransactions: number
  grossAmount: number
  commission: number
  netAmount: number
  payoutDate: Date
  status: string
}

export default function PartnerTransactionsPage() {
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([])
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [dateFilter, setDateFilter] = useState('last_30_days')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // For demo purposes, using first partner. In real app, this comes from auth
  const currentPartnerId = 'ptr_1'

  const fetchTransactionsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all transactions for this partner with employee details
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(first_name, last_name)
        `)
        .eq('partner_id', currentPartnerId)
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      // Process transactions data
      const processedTransactions: ProcessedTransaction[] = (transactionsData || []).map(t => {
        const pointsUsed = t.points_used || 0
        const commission = Math.round(pointsUsed * 0.15) // 15% commission
        const netAmount = Math.round(pointsUsed * 0.85) // 85% to partner
        const transactionDate = new Date(t.created_at)
        
        return {
          id: t.id,
          customerName: t.employees 
            ? `${t.employees.first_name} ${t.employees.last_name}`
            : 'Cliente Sconosciuto',
          serviceName: t.service_name || 'Servizio Sconosciuto',
          pointsUsed: pointsUsed,
          commission: commission,
          netAmount: netAmount,
          date: transactionDate,
          status: t.status || 'completed',
          payoutDate: t.status === 'completed' 
            ? new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 0) // Last day of month
            : null,
          qrScannedAt: transactionDate
        }
      })

      setTransactions(processedTransactions)

      // Calculate current month stats
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const currentMonthTransactions = processedTransactions.filter(t => 
        t.date >= startOfMonth
      )

      const completedTransactions = currentMonthTransactions.filter(t => 
        t.status === 'completed'
      )

      const pendingTransactions = currentMonthTransactions.filter(t => 
        t.status === 'pending'
      )

      const stats: MonthlyStats = {
        totalTransactions: currentMonthTransactions.length,
        totalGross: currentMonthTransactions.reduce((sum, t) => sum + t.pointsUsed, 0),
        totalCommission: currentMonthTransactions.reduce((sum, t) => sum + t.commission, 0),
        totalNet: currentMonthTransactions.reduce((sum, t) => sum + t.netAmount, 0),
        pendingPayout: pendingTransactions.reduce((sum, t) => sum + t.netAmount, 0)
      }

      setMonthlyStats(stats)

      // Generate payout history (last 3 months)
      const payoutHistory: PayoutHistory[] = []
      for (let i = 1; i <= 3; i++) {
        const historyDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        
        const monthTransactions = processedTransactions.filter(t => 
          t.date >= historyDate && t.date <= endDate && t.status === 'completed'
        )

        if (monthTransactions.length > 0) {
          const grossAmount = monthTransactions.reduce((sum, t) => sum + t.pointsUsed, 0)
          const commission = monthTransactions.reduce((sum, t) => sum + t.commission, 0)
          const netAmount = monthTransactions.reduce((sum, t) => sum + t.netAmount, 0)

          payoutHistory.push({
            id: `payout_${i}`,
            month: historyDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
            totalTransactions: monthTransactions.length,
            grossAmount,
            commission,
            netAmount,
            payoutDate: new Date(historyDate.getFullYear(), historyDate.getMonth() + 1, 0),
            status: 'completed'
          })
        }
      }

      setPayoutHistory(payoutHistory)

    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Errore nel caricamento delle transazioni. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactionsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    
    // Date filter logic
    let matchesDate = true
    if (dateFilter !== 'all') {
      const now = new Date()
      const transactionDate = transaction.date
      switch (dateFilter) {
        case 'last_7_days':
          matchesDate = (now.getTime() - transactionDate.getTime()) <= (7 * 24 * 60 * 60 * 1000)
          break
        case 'last_30_days':
          matchesDate = (now.getTime() - transactionDate.getTime()) <= (30 * 24 * 60 * 60 * 1000)
          break
        case 'last_3_months':
          matchesDate = (now.getTime() - transactionDate.getTime()) <= (90 * 24 * 60 * 60 * 1000)
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success" icon="✅">Completata</Badge>
      case 'pending':
        return <Badge variant="warning" icon="⏳">In Elaborazione</Badge>
      case 'cancelled':
        return <Badge variant="danger" icon="❌">Annullata</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const exportTransactions = (format: 'csv' | 'excel') => {
    console.log(`Exporting ${filteredTransactions.length} transactions as ${format}`)
    
    // Create CSV content
    if (format === 'csv') {
      const headers = ['ID', 'Cliente', 'Servizio', 'Punti', 'Commissione', 'Netto', 'Data', 'Stato']
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          t.id,
          `"${t.customerName}"`,
          `"${t.serviceName}"`,
          t.pointsUsed,
          t.commission,
          t.netAmount,
          t.date.toLocaleDateString(),
          t.status
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transazioni_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-24"></div>
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
              <Button onClick={fetchTransactionsData}>
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
        <h1 className="text-2xl font-bold text-gray-900">Transazioni e Pagamenti</h1>
        <p className="text-gray-600">Monitora le vendite e gestisci i pagamenti - Dati in tempo reale</p>
      </div>

      {/* Current Month Stats - REAL DATA FROM SUPABASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Transazioni</p>
              <p className="text-2xl font-bold text-blue-600">{monthlyStats?.totalTransactions || 0}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Punti Totali</p>
              <p className="text-2xl font-bold text-purple-600">{monthlyStats?.totalGross?.toLocaleString() || 0}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Commissioni</p>
              <p className="text-2xl font-bold text-red-600">{monthlyStats?.totalCommission?.toLocaleString() || 0}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Netto</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats?.totalNet?.toLocaleString() || 0}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-yellow-600">{monthlyStats?.pendingPayout?.toLocaleString() || 0}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cerca cliente o servizio..."
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
              <option value="last_7_days">Ultimi 7 giorni</option>
              <option value="last_30_days">Ultimi 30 giorni</option>
              <option value="last_3_months">Ultimi 3 mesi</option>
            </select>
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tutti gli stati</option>
              <option value="completed">Completate</option>
              <option value="pending">In Elaborazione</option>
              <option value="cancelled">Annullate</option>
            </select>
            
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => exportTransactions('csv')}
                disabled={filteredTransactions.length === 0}
              >
                📄 CSV ({filteredTransactions.length})
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => exportTransactions('excel')}
                disabled={filteredTransactions.length === 0}
              >
                📊 Excel
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Transactions Table - REAL DATA FROM SUPABASE */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Transazioni Recenti ({filteredTransactions.length})
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Dati in tempo reale</span>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Commissione</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Netto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.customerName}</p>
                        <p className="text-sm text-gray-500">ID: {transaction.id.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{transaction.serviceName}</p>
                      <p className="text-sm text-gray-500">
                        QR: {transaction.qrScannedAt.toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">
                      {transaction.pointsUsed}
                    </td>
                    <td className="py-3 px-4 font-semibold text-red-600">
                      -{transaction.commission}
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {transaction.netAmount}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div>
                        <p>{transaction.date.toLocaleDateString()}</p>
                        <p className="text-sm">{transaction.date.toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="secondary" size="sm">
                        👁️ Dettagli
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Nessuna transazione trovata' 
                  : 'Nessuna transazione ancora'
                }
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Le transazioni dei clienti appariranno qui'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setDateFilter('all')
                  }}
                  className="mt-3"
                >
                  🔄 Reset Filtri
                </Button>
              )}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Payout History - REAL DATA FROM SUPABASE */}
      {payoutHistory.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Storico Pagamenti</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-semibold text-gray-900 capitalize">{payout.month}</h4>
                        <Badge variant="success" icon="✅">Pagato</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Transazioni</p>
                          <p className="font-semibold">{payout.totalTransactions}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Lordo</p>
                          <p className="font-semibold text-blue-600">{payout.grossAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Commissioni</p>
                          <p className="font-semibold text-red-600">-{payout.commission.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Netto Ricevuto</p>
                          <p className="font-semibold text-green-600">{payout.netAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Pagato il</p>
                      <p className="font-semibold">{payout.payoutDate.toLocaleDateString()}</p>
                      <Button variant="secondary" size="sm" className="mt-2">
                        📄 Fattura
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Next Payout Info */}
      {monthlyStats && monthlyStats.totalNet > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Prossimo Pagamento</h3>
          </Card.Header>
          <Card.Content>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Data Pagamento</p>
                  <p className="text-xl font-bold text-blue-800">
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Importo Stimato</p>
                  <p className="text-xl font-bold text-blue-800">{monthlyStats.totalNet.toLocaleString()} punti</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Commissioni</p>
                  <p className="text-xl font-bold text-blue-800">{monthlyStats.totalCommission.toLocaleString()} punti</p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-blue-800">
                  💡 I pagamenti vengono elaborati automaticamente l&apos;ultimo giorno di ogni mese
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Commission Info */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">ℹ️ Informazioni Commissioni</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Come Funzionano le Commissioni</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• EasyWelfare trattiene il 15% di ogni transazione</li>
                <li>• Le commissioni coprono la gestione della piattaforma</li>
                <li>• Include supporto clienti e marketing</li>
                <li>• Nessun costo fisso mensile</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Quando Ricevi i Pagamenti</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pagamenti automatici ogni fine mese</li>
                <li>• Solo per transazioni completate</li>
                <li>• Bonifico diretto sul tuo conto</li>
                <li>• Fattura automatica disponibile</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}