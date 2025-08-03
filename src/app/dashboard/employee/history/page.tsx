'use client'

import { useState } from 'react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { TransactionStatus, ServiceCategory } from '@/types'

export default function EmployeeHistoryPage() {
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const transactions = [
    {
      id: 'txn_1',
      serviceName: 'Personal Training',
      partnerName: 'FitCenter Verona',
      category: ServiceCategory.FITNESS,
      pointsUsed: 200,
      originalPrice: 50,
      savings: 10,
      date: new Date('2024-01-15'),
      status: TransactionStatus.COMPLETED,
      notes: 'Ottima sessione con Marco, trainer molto preparato'
    },
    {
      id: 'txn_2',
      serviceName: 'Massaggio Rilassante',
      partnerName: 'Wellness Spa',
      category: ServiceCategory.WELLNESS,
      pointsUsed: 150,
      originalPrice: 80,
      savings: 20,
      date: new Date('2024-01-12'),
      status: TransactionStatus.COMPLETED,
      notes: 'Molto rilassante, consigliato per lo stress'
    },
    {
      id: 'txn_3',
      serviceName: 'Consulenza Nutrizionale',
      partnerName: 'NutriExpert',
      category: ServiceCategory.NUTRITION,
      pointsUsed: 100,
      originalPrice: 60,
      savings: 9,
      date: new Date('2024-01-10'),
      status: TransactionStatus.COMPLETED,
      notes: 'Piano alimentare personalizzato molto utile'
    },
    {
      id: 'txn_4',
      serviceName: 'Corso Yoga',
      partnerName: 'Harmony Studio',
      category: ServiceCategory.FITNESS,
      pointsUsed: 80,
      originalPrice: 25,
      savings: 0,
      date: new Date('2024-01-08'),
      status: TransactionStatus.COMPLETED,
      notes: ''
    },
    {
      id: 'txn_5',
      serviceName: 'Check-up Medico',
      partnerName: 'Centro Medico',
      category: ServiceCategory.HEALTH,
      pointsUsed: 300,
      originalPrice: 120,
      savings: 36,
      date: new Date('2024-01-05'),
      status: TransactionStatus.CANCELLED,
      notes: 'Annullato per imprevisti'
    }
  ]

  const pointsHistory = [
    { date: new Date('2024-01-01'), type: 'received', amount: 1000, description: 'Assegnazione mensile' },
    { date: new Date('2024-01-05'), type: 'spent', amount: -300, description: 'Check-up Medico' },
    { date: new Date('2024-01-08'), type: 'spent', amount: -80, description: 'Corso Yoga' },
    { date: new Date('2024-01-10'), type: 'spent', amount: -100, description: 'Consulenza Nutrizionale' },
    { date: new Date('2024-01-12'), type: 'spent', amount: -150, description: 'Massaggio Rilassante' },
    { date: new Date('2024-01-15'), type: 'spent', amount: -200, description: 'Personal Training' }
  ]

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case ServiceCategory.FITNESS: return '🏋️'
      case ServiceCategory.WELLNESS: return '💆'
      case ServiceCategory.HEALTH: return '🏥'
      case ServiceCategory.NUTRITION: return '🥗'
      case ServiceCategory.EDUCATION: return '📚'
      case ServiceCategory.LIFESTYLE: return '🎨'
      default: return '⭐'
    }
  }

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
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
      transaction.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    
    // Date filter logic
    let matchesDate = true
    if (dateFilter !== 'all') {
      const now = new Date()
      const transactionDate = transaction.date
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

  const totalSpent = transactions
    .filter(t => t.status === TransactionStatus.COMPLETED)
    .reduce((sum, t) => sum + t.pointsUsed, 0)
  
  const totalSavings = transactions
    .filter(t => t.status === TransactionStatus.COMPLETED)
    .reduce((sum, t) => sum + t.savings, 0)

  const currentBalance = 750 // This would come from user data

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Storico Transazioni</h1>
        <p className="text-gray-600">Visualizza tutte le tue attività welfare e movimenti punti</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Attuale</p>
                <p className="text-2xl font-bold text-blue-600">{currentBalance}</p>
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
                <p className="text-2xl font-bold text-red-600">{totalSpent}</p>
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
              <option value={TransactionStatus.COMPLETED}>Completato</option>
              <option value={TransactionStatus.PENDING}>In Attesa</option>
              <option value={TransactionStatus.CANCELLED}>Annullato</option>
              <option value={TransactionStatus.EXPIRED}>Scaduto</option>
            </select>
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tutte le categorie</option>
              <option value={ServiceCategory.FITNESS}>🏋️ Fitness</option>
              <option value={ServiceCategory.WELLNESS}>💆 Benessere</option>
              <option value={ServiceCategory.HEALTH}>🏥 Salute</option>
              <option value={ServiceCategory.NUTRITION}>🥗 Nutrizione</option>
              <option value={ServiceCategory.EDUCATION}>📚 Formazione</option>
              <option value={ServiceCategory.LIFESTYLE}>🎨 Lifestyle</option>
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

      {/* Transactions Table */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Transazioni ({filteredTransactions.length})
            </h3>
            <Button variant="secondary" size="sm">
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
                          <p className="font-medium text-gray-900">{transaction.serviceName}</p>
                          {transaction.notes && (
                            <p className="text-xs text-gray-500">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{transaction.partnerName}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{transaction.pointsUsed}</td>
                    <td className="py-3 px-4">
                      {transaction.savings > 0 ? (
                        <span className="font-semibold text-green-600">€{transaction.savings}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {transaction.date.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm">
                          👁️ Dettagli
                        </Button>
                        {transaction.status === TransactionStatus.COMPLETED && (
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

      {/* Points Movement History */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Movimenti Punti</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {pointsHistory.map((movement, index) => (
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
                    <p className="text-sm text-gray-600">{movement.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${
                  movement.type === 'received' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {movement.amount > 0 ? '+' : ''}{movement.amount}
                </span>
              </div>
            ))}
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
            <Button variant="secondary">
              📄 Esporta PDF
            </Button>
            <Button variant="secondary">
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