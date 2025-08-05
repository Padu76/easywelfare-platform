'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import QRScanner from '@/components/dashboard/QRScanner'

// Interfaces
interface VoucherData {
  id: string
  employee_id: string
  service_name: string
  points_used: number
  status: string
  created_at: string
  qr_code_data?: string
  employees?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface ProcessedVoucher {
  id: string
  customerName: string
  customerEmail: string
  serviceName: string
  pointsToRedeem: number
  qrCode: string
  generatedAt: Date
  expiresAt: Date
  validatedAt?: Date
  status: 'active' | 'expired' | 'completed' | 'pending'
}

interface VoucherStats {
  todayScanned: number
  todayPoints: number
  weeklyTotal: number
  pending: number
}

interface ManualVoucher {
  customerEmail: string
  serviceName: string
  pointsToRedeem: number
  notes: string
}

export default function PartnerVouchersPage() {
  const [vouchers, setVouchers] = useState<ProcessedVoucher[]>([])
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [showScanner, setShowScanner] = useState(false)
  const [showCreateVoucher, setShowCreateVoucher] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'pending' | 'history'>('scan')
  
  // Manual voucher form
  const [manualVoucher, setManualVoucher] = useState<ManualVoucher>({
    customerEmail: '',
    serviceName: '',
    pointsToRedeem: 0,
    notes: ''
  })

  const fetchPartnerIdAndVouchers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get first active partner, fallback to any partner
      let { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .single()

      if (partnerError || !partnerData) {
        console.log('🔧 No active partner found, trying any partner...')
        const { data: anyPartner, error: anyPartnerError } = await supabase
          .from('partners')
          .select('id')
          .limit(1)
          .single()

        if (anyPartnerError || !anyPartner) {
          console.log('🔧 No partner found, using demo ID...')
          partnerData = { id: 'demo_partner_1' }
        } else {
          partnerData = anyPartner
        }
      }

      const partnerId = partnerData.id
      setCurrentPartnerId(partnerId)

      await fetchVouchersData(partnerId)

    } catch (err) {
      console.error('Error fetching partner and vouchers:', err)
      setError('Errore nel caricamento dei voucher. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVouchersData = async (partnerId: string) => {
    try {
      // Fetch partner services for manual voucher creation
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('status', 'active')

      if (servicesError) {
        console.error('Error fetching services:', servicesError)
        setServices([])
      } else {
        setServices(servicesData || [])
      }

      // Fetch all transactions for this partner that have QR codes (vouchers)
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(first_name, last_name, email)
        `)
        .eq('partner_id', partnerId)
        .not('qr_code_data', 'is', null)
        .order('created_at', { ascending: false })

      let processedVouchers: ProcessedVoucher[] = []
      
      if (vouchersError) {
        console.error('Error fetching vouchers:', vouchersError)
        // Create demo vouchers if none exist
        processedVouchers = [
          {
            id: 'demo_voucher_1',
            customerName: 'Mario Rossi',
            customerEmail: 'mario.rossi@email.com',
            serviceName: 'Personal Training Demo',
            pointsToRedeem: 200,
            qrCode: 'QR_DEMO_001',
            generatedAt: new Date(Date.now() - 300000), // 5 minutes ago
            expiresAt: new Date(Date.now() + 600000), // 10 minutes from now
            status: 'active'
          },
          {
            id: 'demo_voucher_2',
            customerName: 'Giulia Bianchi',
            customerEmail: 'giulia.bianchi@email.com',
            serviceName: 'Massaggio Rilassante Demo',
            pointsToRedeem: 150,
            qrCode: 'QR_DEMO_002',
            generatedAt: new Date(Date.now() - 3600000), // 1 hour ago
            expiresAt: new Date(Date.now() - 2700000), // Expired 45 minutes ago
            validatedAt: new Date(Date.now() - 2700000),
            status: 'completed'
          }
        ]
      } else {
        // Process real vouchers data
        processedVouchers = (vouchersData || []).map(v => {
          const createdAt = new Date(v.created_at)
          const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000) // 15 minutes expiry
          const now = new Date()
          
          let status: 'active' | 'expired' | 'completed' | 'pending'
          if (v.status === 'completed') {
            status = 'completed'
          } else if (v.status === 'pending' && now > expiresAt) {
            status = 'expired'
          } else if (v.status === 'pending') {
            status = 'active'
          } else {
            status = 'pending'
          }

          return {
            id: v.id,
            customerName: v.employees 
              ? `${v.employees.first_name} ${v.employees.last_name}`
              : 'Cliente Sconosciuto',
            customerEmail: v.employees?.email || '',
            serviceName: v.service_name || 'Servizio Sconosciuto',
            pointsToRedeem: v.points_used || 0,
            qrCode: v.qr_code_data || `QR_${v.id.slice(-8)}`,
            generatedAt: createdAt,
            expiresAt: expiresAt,
            validatedAt: v.status === 'completed' ? createdAt : undefined,
            status: status
          }
        })
      }

      setVouchers(processedVouchers)

      // Calculate stats
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

      const todayVouchers = processedVouchers.filter(v => 
        v.validatedAt && v.validatedAt >= startOfDay
      )
      
      const weeklyVouchers = processedVouchers.filter(v => 
        v.validatedAt && v.validatedAt >= startOfWeek
      )

      const stats: VoucherStats = {
        todayScanned: todayVouchers.length,
        todayPoints: todayVouchers.reduce((sum, v) => sum + v.pointsToRedeem, 0),
        weeklyTotal: weeklyVouchers.length,
        pending: processedVouchers.filter(v => v.status === 'active').length
      }

      setVoucherStats(stats)

    } catch (err) {
      console.error('Error in fetchVouchersData:', err)
    }
  }

  useEffect(() => {
    fetchPartnerIdAndVouchers()
  }, [])

  const handleScanSuccess = async (transaction: any) => {
    console.log('QR Scan successful:', transaction)
    
    try {
      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      if (updateError) throw updateError

      // Refresh data after successful scan
      if (currentPartnerId) {
        await fetchVouchersData(currentPartnerId)
      }
      setShowScanner(false)

      // Show success message (you could add a toast notification here)
      console.log('Voucher validated successfully!')

    } catch (err) {
      console.error('Error validating voucher:', err)
      handleScanError('Errore nella validazione del voucher')
    }
  }

  const handleScanError = (error: string) => {
    console.error('QR Scan error:', error)
    // Here you could show an error toast
  }

  const validateVoucherManually = async (voucherId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', voucherId)

      if (updateError) throw updateError

      // Refresh data
      if (currentPartnerId) {
        await fetchVouchersData(currentPartnerId)
      }
      
      console.log('Manual validation successful!')

    } catch (err) {
      console.error('Error in manual validation:', err)
    }
  }

  const createManualVoucher = async () => {
    try {
      if (!manualVoucher.customerEmail || !manualVoucher.serviceName || manualVoucher.pointsToRedeem <= 0) {
        return
      }

      // Find employee by email
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, allocated_credits, used_credits')
        .eq('email', manualVoucher.customerEmail)
        .single()

      if (employeeError) {
        console.error('Employee not found:', employeeError)
        alert('Employee non trovato con questa email')
        return
      }

      // Check if employee has enough credits
      const availableCredits = (employeeData.allocated_credits || 0) - (employeeData.used_credits || 0)
      if (availableCredits < manualVoucher.pointsToRedeem) {
        console.error('Employee does not have enough credits')
        alert('Il dipendente non ha abbastanza crediti disponibili')
        return
      }

      // Create transaction
      const newTransaction = {
        employee_id: employeeData.id,
        partner_id: currentPartnerId,
        service_name: manualVoucher.serviceName,
        points_used: manualVoucher.pointsToRedeem,
        status: 'pending',
        qr_code_data: `MANUAL_${Date.now()}`,
        created_at: new Date().toISOString(),
        notes: manualVoucher.notes || null
      }

      const { error: insertError } = await supabase
        .from('transactions')
        .insert([newTransaction])

      if (insertError) throw insertError

      // Update employee credits
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          used_credits: (employeeData.used_credits || 0) + manualVoucher.pointsToRedeem 
        })
        .eq('id', employeeData.id)

      if (updateError) throw updateError

      // Reset form and close modal
      setManualVoucher({
        customerEmail: '',
        serviceName: '',
        pointsToRedeem: 0,
        notes: ''
      })
      setShowCreateVoucher(false)

      // Refresh data
      if (currentPartnerId) {
        await fetchVouchersData(currentPartnerId)
      }

      alert('Voucher manuale creato con successo!')

    } catch (err) {
      console.error('Error creating manual voucher:', err)
      alert('Errore nella creazione del voucher manuale')
    }
  }

  const getVoucherStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">✅ Attivo</Badge>
      case 'expired':
        return <Badge variant="danger">⏰ Scaduto</Badge>
      case 'completed':
        return <Badge variant="info">🎯 Completato</Badge>
      case 'pending':
        return <Badge variant="warning">⏳ In Attesa</Badge>
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

  // Separate vouchers by status
  const pendingVouchers = vouchers.filter(v => v.status === 'active' || v.status === 'expired')
  const validatedVouchers = vouchers.filter(v => v.status === 'completed')

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
              <Button onClick={fetchPartnerIdAndVouchers}>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Voucher</h1>
          <p className="text-gray-600">Scansiona QR code e gestisci le prenotazioni clienti - Dati in tempo reale</p>
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

      {/* Stats Cards - REAL DATA FROM SUPABASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scansioni Oggi</p>
                <p className="text-2xl font-bold text-blue-600">{voucherStats?.todayScanned || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{voucherStats?.todayPoints || 0}</p>
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
                <p className="text-2xl font-bold text-purple-600">{voucherStats?.weeklyTotal || 0}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{voucherStats?.pending || 0}</p>
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
              ⏳ In Attesa ({voucherStats?.pending || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Storico ({validatedVouchers.length})
            </button>
          </div>
        </Card.Content>
      </Card>

      {/* Tab Content */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Scanner QR</h3>
            </Card.Header>
            <Card.Content>
              <QRScanner
                partnerId={currentPartnerId || 'demo_partner_1'}
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </Card.Content>
          </Card>
          
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
                          <p className="text-xs text-gray-500">Email: {voucher.customerEmail}</p>
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
                          <p className="text-sm text-gray-500">{voucher.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{voucher.serviceName}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{voucher.pointsToRedeem}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          <p>{voucher.generatedAt.toLocaleDateString()}</p>
                          <p className="text-sm">{voucher.generatedAt.toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          <p>{voucher.validatedAt?.toLocaleDateString()}</p>
                          <p className="text-sm">{voucher.validatedAt?.toLocaleTimeString()}</p>
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
            
            {validatedVouchers.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun voucher validato ancora
                </h3>
                <p className="text-gray-600">
                  I voucher completati appariranno qui
                </p>
              </div>
            )}
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
                partnerId={currentPartnerId || 'demo_partner_1'}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servizio
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={manualVoucher.serviceName}
                    onChange={(e) => {
                      const selectedService = services.find(s => s.name === e.target.value)
                      setManualVoucher(prev => ({ 
                        ...prev, 
                        serviceName: e.target.value,
                        pointsToRedeem: selectedService?.points_required || 0
                      }))
                    }}
                  >
                    <option value="">Seleziona un servizio</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} ({service.points_required} punti)
                      </option>
                    ))}
                  </select>
                </div>
                
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
                    ⚠️ <strong>Attenzione:</strong> Il sistema verificherà automaticamente che il cliente abbia crediti sufficienti.
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