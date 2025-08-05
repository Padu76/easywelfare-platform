'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import QRGenerator from '@/components/dashboard/QRGenerator'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

enum ServiceCategory {
  FITNESS = 'fitness',
  WELLNESS = 'wellness',
  HEALTH = 'health',
  NUTRITION = 'nutrition',
  EDUCATION = 'education',
  LIFESTYLE = 'lifestyle'
}

interface ServiceData {
  id: string
  partner_id: string
  name: string
  description: string
  category: string
  points_required: number
  original_price: number
  discount_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
  partners: {
    business_name: string
  }
}

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

interface QRHistoryItem {
  id: string
  service_name: string
  partner_name: string
  points_used: number
  created_at: string
  status: string
  qr_code_data?: string
}

interface ActiveQRData {
  transactionId: string
  serviceName: string
  pointsToRedeem: number
  expiresAt: Date
  createdAt: Date
}

export default function EmployeeQRPage() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [services, setServices] = useState<ServiceData[]>([])
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null)
  const [activeQRs, setActiveQRs] = useState<ActiveQRData[]>([])
  const [qrHistory, setQRHistory] = useState<QRHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployeeData()
    fetchServices()
    fetchQRHistory()
    loadActiveQRs()
  }, [])

  const fetchEmployeeData = async () => {
    try {
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
    } catch (err) {
      console.error('Error fetching employee data:', err)
      setError('Errore nel caricamento dati dipendente')
    }
  }

  const fetchServices = async () => {
    try {
      console.log('🔍 Fetching services...')
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          partners!inner(business_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (servicesError) {
        console.error('Services error:', servicesError)
        // Continue with empty services instead of throwing
      }

      const finalServices = servicesData || []
      setServices(finalServices)
      console.log('✅ Services loaded:', finalServices.length)
    } catch (err) {
      console.error('Error fetching services:', err)
      // Don't throw, continue with empty services
    }
  }

  const fetchQRHistory = async () => {
    try {
      if (!employee) return

      console.log('🔍 Fetching QR history for employee:', employee.id)
      
      // Fetch QR history from transactions
      const { data: historyData, error: historyError } = await supabase
        .from('transactions')
        .select(`
          id,
          service_name,
          points_used,
          created_at,
          status,
          qr_code_data,
          partners!inner(business_name)
        `)
        .eq('employee_id', employee.id)
        .not('qr_code_data', 'is', null) // Only transactions that had QR codes
        .order('created_at', { ascending: false })
        .limit(10)

      if (historyError) {
        console.warn('Error fetching QR history:', historyError)
        // Continue with demo data
      }

      // If no history or error, use demo data
      if (!historyData || historyData.length === 0) {
        console.log('🔧 No QR history found, using demo data')
        const demoHistory = [
          {
            id: 'demo_qr_1',
            service_name: 'Sessione Fitness Premium',
            partner_name: 'FitCenter Milano',
            points_used: 50,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            qr_code_data: 'demo_qr_data_1'
          },
          {
            id: 'demo_qr_2',
            service_name: 'Massaggio Rilassante',
            partner_name: 'Wellness Spa',
            points_used: 80,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            qr_code_data: 'demo_qr_data_2'
          }
        ]
        setQRHistory(demoHistory)
      } else {
        const formattedHistory = historyData.map(tx => {
          const partners = tx.partners as any
          return {
            id: tx.id,
            service_name: tx.service_name,
            partner_name: Array.isArray(partners) 
              ? partners[0]?.business_name || 'Partner Sconosciuto'
              : partners?.business_name || 'Partner Sconosciuto',
            points_used: tx.points_used,
            created_at: tx.created_at,
            status: tx.status,
            qr_code_data: tx.qr_code_data
          }
        })
        setQRHistory(formattedHistory)
      }

      console.log('✅ QR history loaded')
    } catch (err) {
      console.error('Error fetching QR history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadActiveQRs = () => {
    try {
      if (!employee) return

      // Load active QRs from localStorage (in real app, could be from database)
      const storedActiveQRs = localStorage.getItem(`activeQRs_${employee.id}`)
      if (storedActiveQRs) {
        const parsed = JSON.parse(storedActiveQRs)
        // Filter out expired QRs
        const now = new Date()
        const validQRs = parsed.filter((qr: any) => new Date(qr.expiresAt) > now)
        setActiveQRs(validQRs.map((qr: any) => ({
          ...qr,
          expiresAt: new Date(qr.expiresAt),
          createdAt: new Date(qr.createdAt)
        })))
        
        // Update localStorage with only valid QRs
        if (validQRs.length !== parsed.length) {
          localStorage.setItem(`activeQRs_${employee.id}`, JSON.stringify(validQRs))
        }
      }
    } catch (err) {
      console.error('Error loading active QRs:', err)
    }
  }

  const handleQRGenerated = async (qrData: any) => {
    try {
      if (!employee || !selectedService) return

      console.log('🔧 Processing QR generation...')

      // Create the active QR data
      const activeQR: ActiveQRData = {
        transactionId: qrData.transactionId,
        serviceName: selectedService.name,
        pointsToRedeem: qrData.pointsToRedeem,
        expiresAt: qrData.expiresAt,
        createdAt: new Date()
      }

      // Add to active QRs
      const newActiveQRs = [...activeQRs, activeQR]
      setActiveQRs(newActiveQRs)

      // Save to localStorage
      try {
        localStorage.setItem(`activeQRs_${employee.id}`, JSON.stringify(newActiveQRs))
      } catch (storageErr) {
        console.error('Error saving to localStorage:', storageErr)
      }

      // Create transaction in database
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          id: qrData.transactionId,
          employee_id: employee.id,
          partner_id: selectedService.partner_id,
          company_id: employee.company_id,
          service_name: selectedService.name,
          points_used: selectedService.points_required,
          status: 'pending',
          qr_code_data: JSON.stringify(qrData),
          created_at: new Date().toISOString()
        })

      if (txError) {
        console.error('Error creating transaction:', txError)
      }

      // Update employee credits using correct schema
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          used_credits: employee.used_credits + selectedService.points_required
        })
        .eq('id', employee.id)

      if (updateError) {
        console.error('Error updating employee credits:', updateError)
      } else {
        // Update local state
        setEmployee(prev => prev ? {
          ...prev,
          used_credits: prev.used_credits + selectedService.points_required
        } : null)
      }

      console.log('✅ QR Generated and saved:', activeQR)
    } catch (err) {
      console.error('Error handling QR generation:', err)
    }
  }

  const removeExpiredQR = (transactionId: string) => {
    if (!employee) return

    const updatedQRs = activeQRs.filter(qr => qr.transactionId !== transactionId)
    setActiveQRs(updatedQRs)
    try {
      localStorage.setItem(`activeQRs_${employee.id}`, JSON.stringify(updatedQRs))
    } catch (err) {
      console.error('Error updating localStorage:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">✅ Utilizzato</Badge>
      case 'expired':
        return <Badge variant="danger">⏰ Scaduto</Badge>
      case 'pending':
        return <Badge variant="warning">⏳ In Attesa</Badge>
      case 'cancelled':
        return <Badge variant="danger">❌ Annullato</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
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

  // Transform ServiceData to Service format for QRGenerator
  const transformToServiceFormat = (serviceData: ServiceData) => {
    return {
      id: serviceData.id,
      partnerId: serviceData.partner_id,
      name: serviceData.name,
      description: serviceData.description,
      category: serviceData.category as any,
      pointsRequired: serviceData.points_required,
      originalPrice: serviceData.original_price,
      discountPercentage: serviceData.discount_percentage,
      isActive: serviceData.is_active,
      createdAt: new Date(serviceData.created_at),
      updatedAt: new Date(serviceData.updated_at)
    }
  }

  // Calculate available credits using correct schema
  const availableCredits = employee ? (employee.allocated_credits - employee.used_credits) : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        
        <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
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
                setIsLoading(true)
                fetchEmployeeData()
                fetchServices()
                fetchQRHistory()
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
        <h1 className="text-2xl font-bold text-gray-900">📱 Genera QR Code</h1>
        <p className="text-gray-600">
          Genera QR code per utilizzare i servizi welfare
          {employee && ` - ${employee.first_name} ${employee.last_name}`}
        </p>
      </div>

      {/* Employee Info & Credits Balance */}
      <Card>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📱</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">I tuoi crediti disponibili</p>
                <p className="text-3xl font-bold text-blue-600">{availableCredits.toLocaleString()}</p>
                <p className="text-xs text-gray-500">di {employee?.allocated_credits?.toLocaleString() || 0} assegnati</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">QR attivi</p>
              <p className="text-2xl font-bold text-green-600">{activeQRs.length}</p>
              <p className="text-xs text-gray-500">In uso</p>
            </div>
          </div>
          
          {employee && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Utilizzo crediti</span>
                <span>{((employee.used_credits / employee.allocated_credits) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((employee.used_credits / employee.allocated_credits) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Service Selection */}
      {!selectedService ? (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">🎯 Scegli un Servizio</h3>
            <p className="text-sm text-gray-600">Seleziona il servizio per cui vuoi generare il QR code</p>
          </Card.Header>
          <Card.Content>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => {
                  const canAfford = availableCredits >= service.points_required
                  return (
                    <div
                      key={service.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        canAfford 
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' 
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                      onClick={() => canAfford && setSelectedService(service)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                        <Badge variant={canAfford ? 'success' : 'danger'}>
                          {service.points_required} crediti
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <p className="text-xs text-blue-600 mb-3">📍 {service.partners.business_name}</p>
                      
                      {service.original_price && service.discount_percentage && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 line-through">€{service.original_price}</span>
                          <span className="text-green-600 font-medium">-{service.discount_percentage}%</span>
                        </div>
                      )}
                      
                      {!canAfford && (
                        <p className="text-xs text-red-600 mt-2">
                          Ti servono altri {service.points_required - availableCredits} crediti
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🛍️</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun servizio disponibile</h3>
                <p className="text-gray-600 mb-4">Al momento non ci sono servizi attivi per generare QR code</p>
                <Button onClick={fetchServices}>🔄 Ricarica Servizi</Button>
              </div>
            )}
          </Card.Content>
        </Card>
      ) : (
        /* QR Generator */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <QRGenerator
              service={transformToServiceFormat(selectedService)}
              employeeId={employee?.id || 'demo_emp_001'}
              onGenerated={handleQRGenerated}
            />
          </div>
          
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">📋 Istruzioni</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Servizio Selezionato</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(selectedService.category)}</span>
                    <div>
                      <p className="font-medium text-blue-900">{selectedService.name}</p>
                      <p className="text-sm text-blue-700">📍 {selectedService.partners.business_name}</p>
                      <p className="text-sm text-blue-700">💎 {selectedService.points_required} crediti</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <p className="font-medium">Genera il QR Code</p>
                    <p className="text-sm text-gray-600">Clicca su "Genera QR Code" per creare il codice</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <p className="font-medium">Vai dal Partner</p>
                    <p className="text-sm text-gray-600">Recati presso {selectedService.partners.business_name}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <div>
                    <p className="font-medium">Mostra il QR</p>
                    <p className="text-sm text-gray-600">Il partner scannerizza il QR e valida il servizio</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Importante:</strong> Il QR code scade dopo 15 minuti. 
                    I crediti vengono scalati alla generazione del QR.
                  </p>
                </div>
              </div>
            </Card.Content>
            
            <Card.Footer>
              <Button
                variant="secondary"
                onClick={() => setSelectedService(null)}
                className="w-full"
              >
                ← Scegli un Altro Servizio
              </Button>
            </Card.Footer>
          </Card>
        </div>
      )}

      {/* Active QR Codes */}
      {activeQRs.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">⚡ QR Code Attivi</h3>
            <p className="text-sm text-gray-600">QR code generati e non ancora utilizzati</p>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQRs.map((qr, index) => {
                const isExpired = new Date() > qr.expiresAt
                const timeLeft = Math.max(0, Math.floor((qr.expiresAt.getTime() - new Date().getTime()) / 1000))
                const minutes = Math.floor(timeLeft / 60)
                const seconds = timeLeft % 60

                if (isExpired && timeLeft <= 0) {
                  // Auto-remove expired QRs
                  setTimeout(() => removeExpiredQR(qr.transactionId), 1000)
                }

                return (
                  <div key={index} className={`border rounded-lg p-4 ${
                    isExpired ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={isExpired ? 'danger' : 'success'}>
                        {isExpired ? '⏰ Scaduto' : '✅ Attivo'}
                      </Badge>
                      <span className="text-sm text-gray-600">ID: {qr.transactionId.slice(-8)}</span>
                    </div>
                    <p className="font-medium">{qr.serviceName}</p>
                    <p className="text-sm text-gray-600">{qr.pointsToRedeem} crediti</p>
                    {!isExpired && (
                      <p className="text-xs text-green-600 mt-2">
                        Scade tra: {minutes}:{seconds.toString().padStart(2, '0')}
                      </p>
                    )}
                    {isExpired && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2"
                        onClick={() => removeExpiredQR(qr.transactionId)}
                      >
                        Rimuovi
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* QR History */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">📊 Storico QR Code</h3>
        </Card.Header>
        <Card.Content>
          {qrHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Partner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Crediti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Generato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {qrHistory.map((qr) => (
                    <tr key={qr.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{qr.service_name}</td>
                      <td className="py-3 px-4 text-gray-600">{qr.partner_name}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{qr.points_used}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(qr.created_at).toLocaleDateString('it-IT')} {new Date(qr.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(qr.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📱</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun QR generato ancora
              </h3>
              <p className="text-gray-600">
                I QR code che generi appariranno qui
              </p>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Help Section */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">❓ Hai Bisogno di Aiuto?</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Problemi Comuni</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Il QR non funziona? Verifica che non sia scaduto</li>
                <li>• Partner non trova il QR? Controlla la connessione</li>
                <li>• Crediti scalati ma servizio non ricevuto? Contatta il supporto</li>
                <li>• QR scaduto? I crediti verranno rimborsati automaticamente</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full">
                💬 Contatta il Supporto
              </Button>
              <Button variant="secondary" className="w-full">
                📖 Guida Completa
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}