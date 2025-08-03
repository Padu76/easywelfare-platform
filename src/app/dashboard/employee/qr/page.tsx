'use client'

import { useState } from 'react'
import QRGenerator from '@/components/dashboard/QRGenerator'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Service, ServiceCategory, QRCodeData } from '@/types'

export default function EmployeeQRPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [activeQRs, setActiveQRs] = useState<QRCodeData[]>([])
  const [qrHistory] = useState([
    {
      id: 'qr_1',
      serviceName: 'Personal Training',
      partnerName: 'FitCenter Verona',
      pointsUsed: 200,
      generatedAt: new Date('2024-01-15T10:30:00'),
      status: 'completed',
      usedAt: new Date('2024-01-15T14:30:00')
    },
    {
      id: 'qr_2',
      serviceName: 'Massaggio Rilassante',
      partnerName: 'Wellness Spa',
      pointsUsed: 150,
      generatedAt: new Date('2024-01-12T16:15:00'),
      status: 'completed',
      usedAt: new Date('2024-01-12T17:00:00')
    },
    {
      id: 'qr_3',
      serviceName: 'Corso Yoga',
      partnerName: 'Harmony Studio',
      pointsUsed: 80,
      generatedAt: new Date('2024-01-10T09:00:00'),
      status: 'expired',
      usedAt: null
    }
  ])

  const availableServices: Service[] = [
    {
      id: 'srv_1',
      partnerId: 'ptr_1',
      name: 'Personal Training',
      description: 'Sessione di allenamento personalizzato con trainer qualificato',
      category: ServiceCategory.FITNESS,
      pointsRequired: 200,
      originalPrice: 50,
      discountPercentage: 20,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'srv_2',
      partnerId: 'ptr_2',
      name: 'Massaggio Rilassante',
      description: 'Massaggio rilassante di 60 minuti per ridurre stress e tensioni',
      category: ServiceCategory.WELLNESS,
      pointsRequired: 150,
      originalPrice: 80,
      discountPercentage: 25,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'srv_3',
      partnerId: 'ptr_3',
      name: 'Consulenza Nutrizionale',
      description: 'Consulenza personalizzata con nutrizionista certificato',
      category: ServiceCategory.NUTRITION,
      pointsRequired: 100,
      originalPrice: 60,
      discountPercentage: 15,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const userPoints = 750

  const handleQRGenerated = (qrData: QRCodeData) => {
    setActiveQRs(prev => [...prev, qrData])
    console.log('QR Generated:', qrData)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" icon="✅">Utilizzato</Badge>
      case 'expired':
        return <Badge variant="danger" icon="⏰">Scaduto</Badge>
      case 'active':
        return <Badge variant="info" icon="⏳">Attivo</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Genera QR Code</h1>
        <p className="text-gray-600">Genera QR code per utilizzare i servizi welfare</p>
      </div>

      {/* Points Balance */}
      <Card>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">I tuoi punti disponibili</p>
              <p className="text-3xl font-bold text-blue-600">{userPoints.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">QR attivi</p>
              <p className="text-2xl font-bold text-green-600">{activeQRs.length}</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Service Selection */}
      {!selectedService ? (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Scegli un Servizio</h3>
            <p className="text-sm text-gray-600">Seleziona il servizio per cui vuoi generare il QR code</p>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableServices.map((service) => {
                const canAfford = userPoints >= service.pointsRequired
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
                        {service.pointsRequired} punti
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    
                    {service.originalPrice && service.discountPercentage && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 line-through">€{service.originalPrice}</span>
                        <span className="text-green-600 font-medium">-{service.discountPercentage}%</span>
                      </div>
                    )}
                    
                    {!canAfford && (
                      <p className="text-xs text-red-600 mt-2">
                        Ti servono altri {service.pointsRequired - userPoints} punti
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card.Content>
        </Card>
      ) : (
        /* QR Generator */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <QRGenerator
              service={selectedService}
              employeeId="emp_123" // This would come from auth context
              onGenerated={handleQRGenerated}
            />
          </div>
          
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Istruzioni</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <p className="font-medium">Genera il QR Code</p>
                    <p className="text-sm text-gray-600">Clicca su &quot;Genera QR Code&quot; per creare il codice</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <p className="font-medium">Vai dal Partner</p>
                    <p className="text-sm text-gray-600">Recati presso il partner che eroga il servizio</p>
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
                    Generalo solo quando sei pronto a utilizzarlo.
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
            <h3 className="text-lg font-semibold text-gray-900">QR Code Attivi</h3>
            <p className="text-sm text-gray-600">QR code generati e non ancora utilizzati</p>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQRs.map((qr, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="success" icon="✅">Attivo</Badge>
                    <span className="text-sm text-gray-600">ID: {qr.transactionId.slice(-8)}</span>
                  </div>
                  <p className="font-medium">Servizio in attesa</p>
                  <p className="text-sm text-gray-600">{qr.pointsToRedeem} punti</p>
                  <p className="text-xs text-green-600 mt-2">
                    Scade: {qr.expiresAt.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* QR History */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Storico QR Code</h3>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Partner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Generato</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                </tr>
              </thead>
              <tbody>
                {qrHistory.map((qr) => (
                  <tr key={qr.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{qr.serviceName}</td>
                    <td className="py-3 px-4 text-gray-600">{qr.partnerName}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{qr.pointsUsed}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {qr.generatedAt.toLocaleDateString()} {qr.generatedAt.toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(qr.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <li>• Punti non scalati? Contatta il supporto</li>
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