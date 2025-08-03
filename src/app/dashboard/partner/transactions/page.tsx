'use client'

import { useState } from 'react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { TransactionStatus } from '@/types'

export default function PartnerTransactionsPage() {
  const [dateFilter, setDateFilter] = useState('last_30_days')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const transactions = [
    {
      id: 'txn_1',
      customerName: 'Mario R.',
      serviceName: 'Personal Training',
      pointsUsed: 200,
      commission: 30,
      netAmount: 170,
      date: new Date('2024-01-15T14:30:00'),
      status: TransactionStatus.COMPLETED,
      payoutDate: new Date('2024-01-31'),
      qrScannedAt: new Date('2024-01-15T14:30:00')
    },
    {
      id: 'txn_2',
      customerName: 'Giulia B.',
      serviceName: 'Corso Yoga',
      pointsUsed: 80,
      commission: 12,
      netAmount: 68,
      date: new Date('2024-01-14T09:15:00'),
      status: TransactionStatus.COMPLETED,
      payoutDate: new Date('2024-01-31'),
      qrScannedAt: new Date('2024-01-14T09:15:00')
    },
    {
      id: 'txn_3',
      customerName: 'Luca V.',
      serviceName: 'Personal Training',
      pointsUsed: 200,
      commission: 30,
      netAmount: 170,
      date: new Date('2024-01-13T16:45:00'),
      status: TransactionStatus.COMPLETED,
      payoutDate: new Date('2024-01-31'),
      qrScannedAt: new Date('2024-01-13T16:45:00')
    },
    {
      id: 'txn_4',
      customerName: 'Anna N.',
      serviceName: 'Consulenza Nutrizionale',
      pointsUsed: 150,
      commission: 23,
      netAmount: 127,
      date: new Date('2024-01-12T11:00:00'),
      status: TransactionStatus.PENDING,
      payoutDate: null,
      qrScannedAt: new Date('2024-01-12T11:00:00')
    },
    {
      id: 'txn_5',
      customerName: 'Francesco B.',
      serviceName: 'Personal Training',
      pointsUsed: 200,
      commission: 30,
      netAmount: 170,
      date: new Date('2024-01-10T18:00:00'),
      status: TransactionStatus.COMPLETED,
      payoutDate: new Date('2024-01-31'),
      qrScannedAt: new Date('2024-01-10T18:00:00')
    }
  ]

  const payoutHistory = [
    {
      id: 'payout_1',
      month: 'Gennaio 2024',
      totalTransactions: 47,
      grossAmount: 7850,
      commission: 1178,
      netAmount: 6672,
      payoutDate: new Date('2024-01-31'),
      status: 'completed'
    },
    {
      id: 'payout_2',
      month: 'Dicembre 2023',
      totalTransactions: 42,
      grossAmount: 6920,
      commission: 1038,
      netAmount: 5882,
      payoutDate: new Date('2023-12-31'),
      status: 'completed'
    }
  ]

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

  const currentMonthStats = {
    totalTransactions: filteredTransactions.length,
    totalGross: filteredTransactions.reduce((sum, t) => sum + t.pointsUsed, 0),
    totalCommission: filteredTransactions.reduce((sum, t) => sum + t.commission, 0),
    totalNet: filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0),
    pendingPayout: filteredTransactions
      .filter(t => t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + t.netAmount, 0)
  }

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return <Badge variant="success" icon="✅">Completata</Badge>
      case TransactionStatus.PENDING:
        return <Badge variant="warning" icon="⏳">In Elaborazione</Badge>
      case TransactionStatus.CANCELLED:
        return <Badge variant="danger" icon="❌">Annullata</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const exportTransactions = (format: 'csv' | 'excel') => {
    console.log(`Exporting transactions as ${format}`)
    // Here would be actual export logic
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transazioni e Pagamenti</h1>
        <p className="text-gray-600">Monitora le vendite e gestisci i pagamenti</p>
      </div>

      {/* Current Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Transazioni</p>
              <p className="text-2xl font-bold text-blue-600">{currentMonthStats.totalTransactions}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Punti Totali</p>
              <p className="text-2xl font-bold text-purple-600">{currentMonthStats.totalGross.toLocaleString()}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Commissioni</p>
              <p className="text-2xl font-bold text-red-600">{currentMonthStats.totalCommission.toLocaleString()}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Netto</p>
              <p className="text-2xl font-bold text-green-600">{currentMonthStats.totalNet.toLocaleString()}</p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-yellow-600">{currentMonthStats.pendingPayout.toLocaleString()}</p>
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
              <option value={TransactionStatus.COMPLETED}>Completate</option>
              <option value={TransactionStatus.PENDING}>In Elaborazione</option>
              <option value={TransactionStatus.CANCELLED}>Annullate</option>
            </select>
            
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => exportTransactions('csv')}
              >
                📄 CSV
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => exportTransactions('excel')}
              >
                📊 Excel
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Transazioni Recenti ({filteredTransactions.length})
            </h3>
            <div className="text-sm text-gray-600">
              Aggiornato in tempo reale
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
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna transazione trovata
              </h3>
              <p className="text-gray-600">
                Prova a modificare i filtri di ricerca
              </p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Payout History */}
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
                      <h4 className="font-semibold text-gray-900">{payout.month}</h4>
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

      {/* Next Payout Info */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Prossimo Pagamento</h3>
        </Card.Header>
        <Card.Content>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium">Data Pagamento</p>
                <p className="text-xl font-bold text-blue-800">31 Gennaio 2024</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium">Importo Stimato</p>
                <p className="text-xl font-bold text-blue-800">{currentMonthStats.totalNet.toLocaleString()} punti</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium">Commissioni</p>
                <p className="text-xl font-bold text-blue-800">{currentMonthStats.totalCommission.toLocaleString()} punti</p>
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