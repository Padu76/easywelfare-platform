'use client'

import { useState } from 'react'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'
import { Service, ServiceCategory } from '@/types'

export default function PartnerServicesPage() {
  const [showAddService, setShowAddService] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [services, setServices] = useState<Service[]>([
    {
      id: 'srv_1',
      partnerId: 'ptr_1',
      name: 'Personal Training',
      description: 'Sessione di allenamento personalizzato con trainer qualificato da 60 minuti',
      category: ServiceCategory.FITNESS,
      pointsRequired: 200,
      originalPrice: 50,
      discountPercentage: 20,
      maxRedemptions: 50,
      isActive: true,
      imageUrl: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'srv_2',
      partnerId: 'ptr_1',
      name: 'Corso Yoga Mattutino',
      description: 'Lezione di yoga di gruppo per iniziare la giornata con energia positiva',
      category: ServiceCategory.FITNESS,
      pointsRequired: 80,
      originalPrice: 25,
      discountPercentage: 0,
      maxRedemptions: 20,
      isActive: true,
      imageUrl: '',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'srv_3',
      partnerId: 'ptr_1',
      name: 'Consulenza Nutrizionale',
      description: 'Consulenza completa con nutrizionista certificato e piano alimentare personalizzato',
      category: ServiceCategory.NUTRITION,
      pointsRequired: 150,
      originalPrice: 80,
      discountPercentage: 25,
      maxRedemptions: 30,
      isActive: false,
      imageUrl: '',
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date('2024-01-01')
    }
  ])

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: ServiceCategory.FITNESS,
    pointsRequired: 0,
    originalPrice: 0,
    discountPercentage: 0,
    maxRedemptions: 0
  })

  const serviceStats = {
    totalServices: services.length,
    activeServices: services.filter(s => s.isActive).length,
    totalBookings: 127,
    monthlyRevenue: 2850
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

  const handleAddService = () => {
    const service: Service = {
      id: `srv_${Date.now()}`,
      partnerId: 'ptr_1',
      ...newService,
      isActive: true,
      imageUrl: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setServices(prev => [...prev, service])
    setNewService({
      name: '',
      description: '',
      category: ServiceCategory.FITNESS,
      pointsRequired: 0,
      originalPrice: 0,
      discountPercentage: 0,
      maxRedemptions: 0
    })
    setShowAddService(false)
  }

  const handleToggleActive = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive, updatedAt: new Date() }
        : service
    ))
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setNewService({
      name: service.name,
      description: service.description,
      category: service.category,
      pointsRequired: service.pointsRequired,
      originalPrice: service.originalPrice || 0,
      discountPercentage: service.discountPercentage || 0,
      maxRedemptions: service.maxRedemptions || 0
    })
    setShowAddService(true)
  }

  const handleSaveEdit = () => {
    if (!editingService) return
    
    setServices(prev => prev.map(service => 
      service.id === editingService.id 
        ? { ...service, ...newService, updatedAt: new Date() }
        : service
    ))
    
    setEditingService(null)
    setNewService({
      name: '',
      description: '',
      category: ServiceCategory.FITNESS,
      pointsRequired: 0,
      originalPrice: 0,
      discountPercentage: 0,
      maxRedemptions: 0
    })
    setShowAddService(false)
  }

  const calculateFinalPrice = (originalPrice: number, discount: number) => {
    return originalPrice * (1 - discount / 100)
  }

  const calculateCommission = (pointsRequired: number) => {
    const commissionRate = 15 // 15% commission
    return Math.round(pointsRequired * (commissionRate / 100))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">I Tuoi Servizi</h1>
          <p className="text-gray-600">Gestisci i servizi che offri nel circuito EasyWelfare</p>
        </div>
        <Button onClick={() => setShowAddService(true)} variant="primary">
          ➕ Aggiungi Servizio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Servizi Totali</p>
                <p className="text-2xl font-bold text-gray-900">{serviceStats.totalServices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">⚡</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Servizi Attivi</p>
                <p className="text-2xl font-bold text-green-600">{serviceStats.activeServices}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prenotazioni</p>
                <p className="text-2xl font-bold text-purple-600">{serviceStats.totalBookings}</p>
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
                <p className="text-sm font-medium text-gray-600">Ricavi Mese</p>
                <p className="text-2xl font-bold text-yellow-600">€{serviceStats.monthlyRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">💰</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className={!service.isActive ? 'opacity-60' : ''}>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                </div>
                <Badge variant={service.isActive ? 'success' : 'danger'}>
                  {service.isActive ? 'Attivo' : 'Inattivo'}
                </Badge>
              </div>
            </Card.Header>

            <Card.Content>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{service.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-600 font-medium">Punti Richiesti</p>
                    <p className="text-blue-800 font-bold">{service.pointsRequired}</p>
                  </div>
                  
                  {service.originalPrice && (
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-green-600 font-medium">Prezzo Originale</p>
                      <p className="text-green-800 font-bold">€{service.originalPrice}</p>
                    </div>
                  )}
                  
                  {service.discountPercentage && service.discountPercentage > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <p className="text-yellow-600 font-medium">Sconto</p>
                      <p className="text-yellow-800 font-bold">{service.discountPercentage}%</p>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-purple-600 font-medium">Commissione</p>
                    <p className="text-purple-800 font-bold">{calculateCommission(service.pointsRequired)} punti</p>
                  </div>
                </div>

                {service.originalPrice && service.discountPercentage && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prezzo finale cliente:</span>
                      <span className="font-bold text-gray-900">
                        €{calculateFinalPrice(service.originalPrice, service.discountPercentage).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Max prenotazioni: {service.maxRedemptions || 'Illimitate'}</span>
                  <span>Aggiornato: {service.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </Card.Content>

            <Card.Footer>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEditService(service)}
                  className="flex-1"
                >
                  ✏️ Modifica
                </Button>
                <Button
                  variant={service.isActive ? 'danger' : 'success'}
                  onClick={() => handleToggleActive(service.id)}
                  className="flex-1"
                >
                  {service.isActive ? '🚫 Disattiva' : '✅ Attiva'}
                </Button>
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>

      {/* Add/Edit Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Modifica Servizio' : 'Aggiungi Nuovo Servizio'}
                </h2>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddService(false)
                    setEditingService(null)
                    setNewService({
                      name: '',
                      description: '',
                      category: ServiceCategory.FITNESS,
                      pointsRequired: 0,
                      originalPrice: 0,
                      discountPercentage: 0,
                      maxRedemptions: 0
                    })
                  }}
                >
                  ❌ Chiudi
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome Servizio *"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Es. Personal Training"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione *
                  </label>
                  <textarea
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrizione dettagliata del servizio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                  >
                    <option value={ServiceCategory.FITNESS}>🏋️ Fitness</option>
                    <option value={ServiceCategory.WELLNESS}>💆 Benessere</option>
                    <option value={ServiceCategory.HEALTH}>🏥 Salute</option>
                    <option value={ServiceCategory.NUTRITION}>🥗 Nutrizione</option>
                    <option value={ServiceCategory.EDUCATION}>📚 Formazione</option>
                    <option value={ServiceCategory.LIFESTYLE}>🎨 Lifestyle</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Punti Richiesti *"
                    type="number"
                    value={newService.pointsRequired}
                    onChange={(e) => setNewService(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 0 }))}
                    placeholder="200"
                  />

                  <Input
                    label="Prezzo Originale (€)"
                    type="number"
                    value={newService.originalPrice}
                    onChange={(e) => setNewService(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="50.00"
                  />

                  <Input
                    label="Sconto (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={newService.discountPercentage}
                    onChange={(e) => setNewService(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                    placeholder="20"
                  />

                  <Input
                    label="Max Prenotazioni"
                    type="number"
                    value={newService.maxRedemptions}
                    onChange={(e) => setNewService(prev => ({ ...prev, maxRedemptions: parseInt(e.target.value) || 0 }))}
                    placeholder="50 (0 = illimitate)"
                  />
                </div>

                {/* Preview */}
                {newService.pointsRequired > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">📋 Anteprima</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Commissione EasyWelfare:</span>
                        <span className="ml-2 font-bold text-purple-600">
                          {calculateCommission(newService.pointsRequired)} punti (15%)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tu ricevi:</span>
                        <span className="ml-2 font-bold text-green-600">
                          {newService.pointsRequired - calculateCommission(newService.pointsRequired)} punti
                        </span>
                      </div>
                      {newService.originalPrice > 0 && newService.discountPercentage > 0 && (
                        <>
                          <div>
                            <span className="text-gray-600">Prezzo finale cliente:</span>
                            <span className="ml-2 font-bold text-blue-600">
                              €{calculateFinalPrice(newService.originalPrice, newService.discountPercentage).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risparmio cliente:</span>
                            <span className="ml-2 font-bold text-green-600">
                              €{(newService.originalPrice * newService.discountPercentage / 100).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAddService(false)
                      setEditingService(null)
                    }}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={editingService ? handleSaveEdit : handleAddService}
                    disabled={!newService.name || !newService.description || newService.pointsRequired <= 0}
                    className="flex-1"
                  >
                    {editingService ? '💾 Salva Modifiche' : '➕ Aggiungi Servizio'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti per i Tuoi Servizi</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Come Aumentare le Prenotazioni</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Offri sconti esclusivi per il circuito welfare</li>
                <li>• Mantieni descrizioni chiare e dettagliate</li>
                <li>• Aggiorna regolarmente i tuoi servizi</li>
                <li>• Rispondi velocemente alle prenotazioni</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Ottimizza i Punti</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Punti troppo alti = meno prenotazioni</li>
                <li>• Punti troppo bassi = meno guadagno</li>
                <li>• Considera il valore percepito dal cliente</li>
                <li>• Monitora la concorrenza nel tuo settore</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}