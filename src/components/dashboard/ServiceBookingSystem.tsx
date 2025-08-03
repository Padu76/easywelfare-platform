'use client'

import React, { useState } from 'react'
import Button from '../ui/button'
import Card from '../ui/card'
import Input from '../ui/input'
import Badge from '../ui/badge'
import { Service, ServiceCategory, ServiceFilters } from '@/types'

interface ServiceBookingProps {
  services: Service[]
  userPoints: number
  onBookService?: (serviceId: string) => void
}

const mockServices: Service[] = [
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
    imageUrl: '/images/personal-training.jpg',
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
    imageUrl: '/images/massage.jpg',
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
    imageUrl: '/images/nutrition.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'srv_4',
    partnerId: 'ptr_1',
    name: 'Corso Yoga',
    description: 'Lezione di yoga di gruppo per principianti e intermedi',
    category: ServiceCategory.FITNESS,
    pointsRequired: 80,
    originalPrice: 25,
    discountPercentage: 0,
    isActive: true,
    imageUrl: '/images/yoga.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'srv_5',
    partnerId: 'ptr_4',
    name: 'Check-up Medico',
    description: 'Visita medica completa con analisi di base',
    category: ServiceCategory.HEALTH,
    pointsRequired: 300,
    originalPrice: 120,
    discountPercentage: 30,
    isActive: true,
    imageUrl: '/images/checkup.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export default function ServiceBookingSystem({ 
  services = mockServices, 
  userPoints = 750, 
  onBookService 
}: ServiceBookingProps) {
  const [filters, setFilters] = useState<ServiceFilters>({
    category: undefined,
    minPoints: undefined,
    maxPoints: undefined,
    searchTerm: ''
  })
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isBooking, setIsBooking] = useState(false)

  const categoryLabels = {
    [ServiceCategory.FITNESS]: '🏋️ Fitness',
    [ServiceCategory.WELLNESS]: '💆 Benessere',
    [ServiceCategory.HEALTH]: '🏥 Salute',
    [ServiceCategory.NUTRITION]: '🥗 Nutrizione',
    [ServiceCategory.EDUCATION]: '📚 Formazione',
    [ServiceCategory.LIFESTYLE]: '🎨 Lifestyle'
  }

  const filteredServices = services.filter(service => {
    if (filters.category && service.category !== filters.category) return false
    if (filters.minPoints && service.pointsRequired < filters.minPoints) return false
    if (filters.maxPoints && service.pointsRequired > filters.maxPoints) return false
    if (filters.searchTerm && !service.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false
    return service.isActive
  })

  const handleBookService = async (service: Service) => {
    if (userPoints < service.pointsRequired) return
    
    setIsBooking(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (onBookService) {
        onBookService(service.id)
      }
      
      setSelectedService(null)
      
    } catch (error) {
      console.error('Error booking service:', error)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Points Balance */}
      <Card>
        <Card.Content>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Catalogo Servizi</h2>
              <p className="text-gray-600">Scegli i servizi che preferisci</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">I tuoi punti</p>
              <p className="text-3xl font-bold text-blue-600">{userPoints}</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Filters */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">Filtri</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cerca servizi..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              icon={<span>🔍</span>}
            />
            
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as ServiceCategory || undefined }))}
            >
              <option value="">Tutte le categorie</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <Input
              type="number"
              placeholder="Punti min"
              value={filters.minPoints || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPoints: parseInt(e.target.value) || undefined }))}
            />
            
            <Input
              type="number"
              placeholder="Punti max"
              value={filters.maxPoints || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || undefined }))}
            />
          </div>
          
          <div className="mt-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setFilters({ searchTerm: '', category: undefined, minPoints: undefined, maxPoints: undefined })}
            >
              🗑️ Cancella Filtri
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const canAfford = userPoints >= service.pointsRequired
          const savings = service.originalPrice && service.discountPercentage 
            ? (service.originalPrice * service.discountPercentage / 100).toFixed(0)
            : null

          return (
            <Card key={service.id} hover className={!canAfford ? 'opacity-60' : ''}>
              {/* Service Image Placeholder */}
              <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">
                  {service.category === ServiceCategory.FITNESS && '🏋️'}
                  {service.category === ServiceCategory.WELLNESS && '💆'}
                  {service.category === ServiceCategory.HEALTH && '🏥'}
                  {service.category === ServiceCategory.NUTRITION && '🥗'}
                  {service.category === ServiceCategory.EDUCATION && '📚'}
                  {service.category === ServiceCategory.LIFESTYLE && '🎨'}
                </span>
              </div>
              
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <Badge variant="info" size="sm">
                      {categoryLabels[service.category]}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600">
                        {service.pointsRequired} punti
                      </span>
                      {savings && (
                        <Badge variant="success" size="sm">
                          Risparmi €{savings}
                        </Badge>
                      )}
                    </div>
                    
                    {service.originalPrice && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 line-through">
                          €{service.originalPrice}
                        </p>
                        {service.discountPercentage && (
                          <p className="text-xs text-green-600">
                            -{service.discountPercentage}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
              
              <Card.Footer>
                <Button
                  onClick={() => handleBookService(service)}
                  disabled={!canAfford}
                  loading={isBooking && selectedService?.id === service.id}
                  className="w-full"
                  variant={canAfford ? 'primary' : 'secondary'}
                >
                  {!canAfford ? '💎 Punti insufficienti' : 
                   isBooking && selectedService?.id === service.id ? 'Prenotando...' : 
                   '🎫 Prenota Servizio'}
                </Button>
                
                {!canAfford && (
                  <p className="text-xs text-center text-red-600 mt-2">
                    Ti servono altri {service.pointsRequired - userPoints} punti
                  </p>
                )}
              </Card.Footer>
            </Card>
          )
        })}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun servizio trovato
              </h3>
              <p className="text-gray-600">
                Prova a modificare i filtri di ricerca
              </p>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}