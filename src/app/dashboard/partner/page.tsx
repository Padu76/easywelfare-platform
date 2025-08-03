'use client'

import { useState } from 'react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import QRScanner from '@/components/dashboard/QRScanner'

export default function PartnerVouchersPage() {
  const [showScanner, setShowScanner] = useState(false)
  const [showCreateVoucher, setShowCreateVoucher] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'pending' | 'history'>('scan')

  const [pendingVouchers] = useState([
    {
      id: 'voucher_1',
      customerName: 'Mario Rossi',
      serviceName: 'Personal Training',
      pointsToRedeem: 200,
      qrCode: 'QR_PT_20240115_001',
      generatedAt: new Date('2024-01-15T14:25:00'),
      expiresAt: new Date('2024-01-15T14:40:00'),
      status: 'active'
    },
    {
      id: 'voucher_2',
      customerName: 'Giulia Bianchi',
      serviceName: 'Corso Yoga',
      pointsToRedeem: 80,
      qrCode: 'QR_YG_20240115_002',
      generatedAt: new Date('2024-01-15T09:10:00'),
      expiresAt: new Date('2024-01-15T09:25:00'),
      status: 'expired'
    }
  ])

  const [validatedVouchers] = useState([
    {
      id: 'voucher_3',
      customerName: 'Luca Verdi',
      serviceName: 'Personal Training',
      pointsRedeemed: 200,
      qrCode: 'QR_PT_20240114_003',
      generatedAt: new Date('2024-01-14T16:30:00'),
      validatedAt: new Date('2024-01-14T16:35:00'),
      status: 'completed'
    },
    {
      id: 'voucher_4',
      customerName: 'Anna Neri',
      serviceName: 'Consulenza Nutrizionale',
      pointsRedeemed: 150,
      qrCode: 'QR_NU_20240114_004',
      generatedAt: new Date('2024-01-14T11:00:00'),
      validatedAt: new Date('2024-01-14T11:05:00'),
      status: 'completed'
    },
    {
      id: 'voucher_5',
      customerName: 'Francesco Blu',
      serviceName: 'Personal Training',
      pointsRedeemed: 200,
      qrCode: 'QR_PT_20240113_005',
      generatedAt: new Date('2024-01-13T18:00:00'),
      validatedAt: new Date('2024-01-13T18:05:00'),
      status: 'completed'
    }
  ])

  const [manualVoucher, setManualVoucher] = useState({
    customerEmail: '',
    serviceName: '',
    pointsToRedeem: 0,
    notes: ''
  })

  const voucherStats = {
    todayScanned: 8,
    todayPoints: 1240,
    weeklyTotal: 47,
    pending: pendingVouchers.filter(v => v.status === 'active').length
  }

  const handleScanSuccess = (transaction: any) => {
    console.log('Transaction validated:', transaction)
    // Here would be actual validation logic
  }

  const handleScanError = (error: string) => {
    console.error('Scan error:', error)
  }

  const getVoucherStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" icon="✅">Attivo</Badge>
      case 'expired':
        return <Badge variant="danger" icon="⏰">Scaduto</Badge>
      case 'completed':
        return <Badge variant="info" icon="🎯">Completato</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt
  }

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    
    if (diff <= 0) return 'Scaduto'
    
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const validateVoucherManually = (voucherId: string) => {
    console.log('Validating voucher manually:', voucherId)
    // Here would be manual validation logic
  }

  const createManualVoucher = () => {
    console.log('Creating manual voucher:', manualVoucher)
    setShowCreateVoucher(false)
    setManualVoucher({
      customerEmail: '',
      serviceName: '',
      pointsToRedeem: 0,
      notes: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Voucher</h1>
          <p className="text-gray-600">Scansiona QR code e gestisci le prenotazioni clienti</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowCreateVoucher(true)}
            variant="secondary"
          >
            📝 Crea Voucher Manuale
          </Button>
          <Button
            onClick={() => setShowScanner(true)}
            variant="primary"
          >
            📱 Scansiona QR
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scansioni Oggi</p>
                <p className="text-2xl font-bold text-blue-600">{voucherStats.todayScanned}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📱</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Punti Oggi</p>
                <p className="text-2xl font-bold text-green-600">{voucherStats.todayPoints}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">💎</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totale Settimana</p>
                <p className="text-2xl font-bold text-purple-600">{voucherStats.weeklyTotal}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Attesa</p>
                <p className="text-2xl font-bold text-yellow-600">{voucherStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <Card.Content>
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scan'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📱 Scanner QR
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⏳ In Attesa ({voucherStats.pending})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Storico
            </button>
          </div>
        </Card.Content>
      </Card>

      {/* Tab Content */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QRScanner
            partnerId="ptr_1"
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
          
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Come Funziona</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <p className="font-medium">Cliente genera QR</p>
                    <p className="text-sm text-gray-600">Il cliente sceglie il servizio e genera il QR code</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <p className="font-medium">Scansiona il QR</p>
                    <p className="text-sm text-gray-600">Usa il scanner per leggere il codice del cliente</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <div>
                    <p className="font-medium">Valida il servizio</p>
                    <p className="text-sm text-gray-600">Conferma la prenotazione e eroga il servizio</p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    ✅ <strong>Pagamento automatico:</strong> Riceverai i punti direttamente sul tuo account a fine mese
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Cliente senza QR?</strong> Usa il "Voucher Manuale" per prenotazioni telefoniche, 
                    clienti con telefono scarico o situazioni speciali.
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === 'pending' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Voucher in Attesa di Validazione</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {pendingVouchers.map((voucher) => {
                const expired = isExpired(voucher.expiresAt)
                return (
                  <div key={voucher.id} className={`border rounded-lg p-4 ${expired ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{voucher.customerName}</h4>
                          {getVoucherStatusBadge(expired ? 'expired' : voucher.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Servizio</p>
                            <p className="font-medium">{voucher.serviceName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Punti</p>
                            <p className="font-medium text-blue-600">{voucher.pointsToRedeem}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Generato</p>
                            <p className="font-medium">{voucher.generatedAt.toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tempo rimasto</p>
                            <p className={`font-medium ${expired ? 'text-red-600' : 'text-green-600'}`}>
                              {getTimeRemaining(voucher.expiresAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">QR: {voucher.qrCode}</p>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {!expired ? (
                          <Button
                            onClick={() => validateVoucherManually(voucher.id)}
                            variant="success"
                            size="sm"
                          >
                            ✅ Valida
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled
                          >
                            ⏰ Scaduto
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {pendingVouchers.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">✅</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessun voucher in attesa
                  </h3>
                  <p className="text-gray-600">
                    Tutti i voucher sono stati processati
                  </p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Storico Voucher Validati</h3>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Generato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Validato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedVouchers.map((voucher) => (
                    <tr key={voucher.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{voucher.customerName}</p>
                          <p className="text-sm text-gray-500">QR: {voucher.qrCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{voucher.serviceName}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{voucher.pointsRedeemed}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          <p>{voucher.generatedAt.toLocaleDateString()}</p>
                          <p className="text-sm">{voucher.generatedAt.toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          <p>{voucher.validatedAt.toLocaleDateString()}</p>
                          <p className="text-sm">{voucher.validatedAt.toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getVoucherStatusBadge(voucher.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Scanner QR</h2>
                <Button
                  variant="secondary"
                  onClick={() => setShowScanner(false)}
                >
                  ❌ Chiudi
                </Button>
              </div>
              
              <QRScanner
                partnerId="ptr_1"
                onScanSuccess={(transaction) => {
                  handleScanSuccess(transaction)
                  setShowScanner(false)
                }}
                onScanError={handleScanError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Manual Voucher Modal */}
      {showCreateVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Crea Voucher Manuale</h2>
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateVoucher(false)}
                >
                  ❌ Chiudi
                </Button>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Email Cliente"
                  type="email"
                  value={manualVoucher.customerEmail}
                  onChange={(e) => setManualVoucher(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="cliente@email.com"
                />
                
                <Input
                  label="Nome Servizio"
                  value={manualVoucher.serviceName}
                  onChange={(e) => setManualVoucher(prev => ({ ...prev, serviceName: e.target.value }))}
                  placeholder="Personal Training"
                />
                
                <Input
                  label="Punti da Riscattare"
                  type="number"
                  value={manualVoucher.pointsToRedeem}
                  onChange={(e) => setManualVoucher(prev => ({ ...prev, pointsToRedeem: parseInt(e.target.value) || 0 }))}
                  placeholder="200"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    value={manualVoucher.notes}
                    onChange={(e) => setManualVoucher(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Note aggiuntive..."
                  />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Quando usare i voucher manuali:</strong>
                  </p>
                  <ul className="text-yellow-700 text-xs mt-1 space-y-1">
                    <li>• Cliente con telefono scarico/rotto</li>
                    <li>• Prenotazioni telefoniche</li>
                    <li>• Clienti che preferiscono non usare app</li>
                    <li>• Promozioni speciali o sconti extra</li>
                    <li>• Problemi tecnici con il QR scanner</li>
                  </ul>
                  <p className="text-yellow-800 text-xs mt-2">
                    <strong>Come funziona:</strong> Il cliente riceverà un'email di conferma e dovrà approvare la transazione.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowCreateVoucher(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={createManualVoucher}
                    disabled={!manualVoucher.customerEmail || !manualVoucher.serviceName || manualVoucher.pointsToRedeem <= 0}
                    className="flex-1"
                  >
                    📝 Crea Voucher
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}