'use client'

import { useState } from 'react'
import ServiceBookingSystem from '@/components/dashboard/ServiceBookingSystem'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'

export default function EmployeeCatalogPage() {
  const [userPoints] = useState(750)
  const [favoriteServices, setFavoriteServices] = useState<string[]>(['srv_1', 'srv_3'])
  const [recentlyViewed] = useState([
    { id: 'srv_1', name: 'Personal Training', viewedAt: '2 ore fa' },
    { id: 'srv_2', name: 'Massaggio Rilassante', viewedAt: '1 giorno fa' },
    { id: 'srv_4', name: 'Corso Yoga', viewedAt: '3 giorni fa' }
  ])

  const recommendations = [
    {
      id: 'rec_1',
      title: 'Perfetto per te!',
      description: 'Basato sui tuoi interessi per fitness',
      services: ['Personal Training', 'Corso Yoga'],
      reason: 'fitness_interest'
    },
    {
      id: 'rec_2', 
      title: 'Novità del mese',
      description: 'Nuovi servizi appena aggiunti',
      services: ['Pilates Reformer', 'Crioterapia'],
      reason: 'new_services'
    },
    {
      id: 'rec_3',
      title: 'I più popolari',
      description: 'Servizi più richiesti dai colleghi',
      services: ['Massaggio Rilassante', 'Consulenza Nutrizionale'],
      reason: 'popular'
    }
  ]

  const categories = [
    { id: 'fitness', name: 'Fitness', icon: '🏋️', count: 8, color: 'blue' },
    { id: 'wellness', name: 'Benessere', icon: '💆', count: 12, color: 'purple' },
    { id: 'health', name: 'Salute', icon: '🏥', count: 6, color: 'red' },
    { id: 'nutrition', name: 'Nutrizione', icon: '🥗', count: 4, color: 'green' },
    { id: 'education', name: 'Formazione', icon: '📚', count: 3, color: 'yellow' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🎨', count: 5, color: 'pink' }
  ]

  const handleServiceBooked = (serviceId: string) => {
    console.log('Service booked:', serviceId)
    // Here would be actual booking logic
  }

  const toggleFavorite = (serviceId: string) => {
    setFavoriteServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogo Servizi</h1>
          <p className="text-gray-600">Scopri e prenota i servizi welfare disponibili</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">I tuoi punti</p>
          <p className="text-3xl font-bold text-blue-600">{userPoints}</p>
        </div>
      </div>

      {/* Quick Categories */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Esplora per Categoria</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
                <Badge variant="default" size="sm" className="mt-1">
                  {category.count} servizi
                </Badge>
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border-2 border-blue-200">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                <Badge variant="info">
                  {rec.reason === 'fitness_interest' && '🎯'}
                  {rec.reason === 'new_services' && '✨'}
                  {rec.reason === 'popular' && '🔥'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {rec.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{service}</span>
                    <Button size="sm" variant="secondary">
                      Vedi
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Recently Viewed */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Visualizzati di Recente</h3>
        </Card.Header>
        <Card.Content>
          <div className="flex space-x-4 overflow-x-auto">
            {recentlyViewed.map((service) => (
              <div key={service.id} className="flex-shrink-0 w-48 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{service.viewedAt}</p>
                <Button size="sm" className="mt-2 w-full">
                  Visualizza Dettagli
                </Button>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Your Favorites */}
      {favoriteServices.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">I Tuoi Preferiti ❤️</h3>
          </Card.Header>
          <Card.Content>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Hai {favoriteServices.length} servizi nei preferiti. 
                Riceverai notifiche quando saranno disponibili offerte speciali!
              </p>
              <Button variant="secondary" size="sm" className="mt-2">
                Gestisci Preferiti
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Main Service Catalog */}
      <ServiceBookingSystem 
        services={[]} // Uses mock services from component
        userPoints={userPoints}
        onBookService={handleServiceBooked}
      />

      {/* Quick Tips */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Come funziona</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Scegli il servizio che ti interessa</li>
                <li>• Prenota utilizzando i tuoi punti</li>
                <li>• Genera il QR code</li>
                <li>• Mostra il QR al partner</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Risparmia di più</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Controlla le offerte speciali</li>
                <li>• Prenota in anticipo per sconti</li>
                <li>• Combina più servizi dello stesso partner</li>
                <li>• Segui i servizi preferiti</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Support */}
      <Card>
        <Card.Content>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Non trovi quello che cerchi? Hai bisogno di aiuto?
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="secondary">
                💬 Contatta il Supporto
              </Button>
              <Button variant="secondary">
                📝 Suggerisci un Servizio
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}