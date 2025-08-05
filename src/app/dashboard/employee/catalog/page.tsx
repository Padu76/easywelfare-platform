'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ServiceBookingSystem from '@/components/dashboard/ServiceBookingSystem'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'

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
  partners: {
    business_name: string
  }
}

interface EmployeeData {
  id: string
  available_points: number
  company_id: string
}

interface CategoryStats {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

interface RecentlyViewedItem {
  id: string
  name: string
  viewedAt: string
}

interface Recommendation {
  id: string
  title: string
  description: string
  services: string[]
  reason: string
}

export default function EmployeeCatalogPage() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [services, setServices] = useState<ServiceData[]>([])
  const [categories, setCategories] = useState<CategoryStats[]>([])
  const [favoriteServices, setFavoriteServices] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using first employee. In real app, this comes from auth
  const currentEmployeeId = 'emp_1'

  useEffect(() => {
    fetchEmployeeData()
    fetchServices()
    loadUserPreferences()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, available_points, company_id')
        .eq('id', currentEmployeeId)
        .single()

      if (employeeError) throw employeeError
      setEmployee(employeeData)
    } catch (err) {
      console.error('Error fetching employee data:', err)
      setError('Errore nel caricamento dati dipendente')
    }
  }

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all active services with partner info
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          partners!inner(business_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (servicesError) throw servicesError

      setServices(servicesData || [])
      
      // Calculate category statistics
      const categoryMap = new Map()
      
      ;(servicesData || []).forEach(service => {
        const category = service.category.toLowerCase()
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            id: category,
            name: getCategoryName(category),
            icon: getCategoryIcon(category),
            count: 0,
            color: getCategoryColor(category)
          })
        }
        categoryMap.get(category).count++
      })

      setCategories(Array.from(categoryMap.values()))
      
      // Generate intelligent recommendations
      await generateRecommendations(servicesData || [])
      
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Errore nel caricamento servizi')
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = async (allServices: ServiceData[]) => {
    try {
      // Get user's transaction history for personalized recommendations
      const { data: userTransactions, error: txError } = await supabase
        .from('transactions')
        .select('service_name, created_at')
        .eq('employee_id', currentEmployeeId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (txError) throw txError

      // Analyze user preferences
      const userCategories = new Set()
      const userServiceNames = new Set()
      
      ;(userTransactions || []).forEach(tx => {
        const service = allServices.find(s => s.name === tx.service_name)
        if (service) {
          userCategories.add(service.category.toLowerCase())
          userServiceNames.add(service.name)
        }
      })

      const recs: Recommendation[] = []

      // Personal recommendations based on history
      if (userCategories.size > 0) {
        const preferredCategory = Array.from(userCategories)[0] as string
        const categoryServices = allServices
          .filter(s => s.category.toLowerCase() === preferredCategory)
          .filter(s => !userServiceNames.has(s.name))
          .slice(0, 3)
          .map(s => s.name)

        if (categoryServices.length > 0) {
          recs.push({
            id: 'rec_personal',
            title: 'Perfetto per te!',
            description: `Basato sui tuoi interessi per ${getCategoryName(preferredCategory)}`,
            services: categoryServices,
            reason: 'personal_history'
          })
        }
      }

      // New services this month
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      const newServices = allServices
        .filter(s => new Date(s.created_at) >= oneMonthAgo)
        .slice(0, 3)
        .map(s => s.name)

      if (newServices.length > 0) {
        recs.push({
          id: 'rec_new',
          title: 'Novità del mese',
          description: 'Nuovi servizi appena aggiunti al catalogo',
          services: newServices,
          reason: 'new_services'
        })
      }

      // Popular services (most transactions)
      const { data: popularTx, error: popularError } = await supabase
        .from('transactions')
        .select('service_name')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (!popularError && popularTx) {
        const serviceCount = new Map()
        popularTx.forEach(tx => {
          serviceCount.set(tx.service_name, (serviceCount.get(tx.service_name) || 0) + 1)
        })

        const popularServices = Array.from(serviceCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name)

        if (popularServices.length > 0) {
          recs.push({
            id: 'rec_popular',
            title: 'I più popolari',
            description: 'Servizi più richiesti dai colleghi questo mese',
            services: popularServices,
            reason: 'popular'
          })
        }
      }

      setRecommendations(recs)
    } catch (err) {
      console.error('Error generating recommendations:', err)
      // Set fallback recommendations
      setRecommendations([
        {
          id: 'rec_fallback',
          title: 'Servizi Consigliati',
          description: 'Una selezione dei nostri migliori servizi',
          services: allServices.slice(0, 3).map(s => s.name),
          reason: 'fallback'
        }
      ])
    }
  }

  const loadUserPreferences = async () => {
    try {
      // Load favorites from localStorage for now (could be moved to database)
      const storedFavorites = localStorage.getItem(`favorites_${currentEmployeeId}`)
      if (storedFavorites) {
        setFavoriteServices(JSON.parse(storedFavorites))
      }

      // Load recently viewed
      const storedRecent = localStorage.getItem(`recent_${currentEmployeeId}`)
      if (storedRecent) {
        setRecentlyViewed(JSON.parse(storedRecent))
      }
    } catch (err) {
      console.error('Error loading user preferences:', err)
    }
  }

  const handleServiceBooked = async (serviceId: string) => {
    if (!employee) return

    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      // Check if user has enough points
      if (employee.available_points < service.points_required) {
        alert('Punti insufficienti per questo servizio')
        return
      }

      // Create transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          employee_id: currentEmployeeId,
          partner_id: service.partner_id,
          company_id: employee.company_id,
          service_name: service.name,
          points_used: service.points_required,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (txError) throw txError

      // Update employee points
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          available_points: employee.available_points - service.points_required,
          used_points: (employee.available_points - service.points_required)
        })
        .eq('id', currentEmployeeId)

      if (updateError) throw updateError

      // Update local state
      setEmployee(prev => prev ? {
        ...prev,
        available_points: prev.available_points - service.points_required
      } : null)

      // Add to recently viewed
      addToRecentlyViewed(service.id, service.name)

      alert('Servizio prenotato con successo! Vai alla sezione QR per generare il codice.')
      
    } catch (err) {
      console.error('Error booking service:', err)
      alert('Errore nella prenotazione. Riprova.')
    }
  }

  const toggleFavorite = (serviceId: string) => {
    const newFavorites = favoriteServices.includes(serviceId)
      ? favoriteServices.filter(id => id !== serviceId)
      : [...favoriteServices, serviceId]
    
    setFavoriteServices(newFavorites)
    
    // Save to localStorage
    try {
      localStorage.setItem(`favorites_${currentEmployeeId}`, JSON.stringify(newFavorites))
    } catch (err) {
      console.error('Error saving favorites:', err)
    }
  }

  const addToRecentlyViewed = (serviceId: string, serviceName: string) => {
    const newItem = {
      id: serviceId,
      name: serviceName,
      viewedAt: new Date().toLocaleString()
    }

    const filtered = recentlyViewed.filter(item => item.id !== serviceId)
    const newRecent = [newItem, ...filtered].slice(0, 5)
    
    setRecentlyViewed(newRecent)
    
    try {
      localStorage.setItem(`recent_${currentEmployeeId}`, JSON.stringify(newRecent))
    } catch (err) {
      console.error('Error saving recent items:', err)
    }
  }

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      fitness: 'Fitness',
      wellness: 'Benessere',
      health: 'Salute',
      nutrition: 'Nutrizione',
      education: 'Formazione',
      lifestyle: 'Lifestyle'
    }
    return names[category] || category
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      fitness: '🏋️',
      wellness: '💆',
      health: '🏥',
      nutrition: '🥗',
      education: '📚',
      lifestyle: '🎨'
    }
    return icons[category] || '⭐'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fitness: 'blue',
      wellness: 'purple',
      health: 'red',
      nutrition: 'green',
      education: 'yellow',
      lifestyle: 'pink'
    }
    return colors[category] || 'gray'
  }

  const getFilteredServices = () => {
    if (selectedCategory === 'all') return services
    return services.filter(service => service.category.toLowerCase() === selectedCategory)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <Button onClick={() => {
                setError(null)
                fetchServices()
                fetchEmployeeData()
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogo Servizi</h1>
          <p className="text-gray-600">Scopri e prenota i servizi welfare disponibili</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">I tuoi punti</p>
          <p className="text-3xl font-bold text-blue-600">{employee?.available_points?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Quick Categories - REAL DATA */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Esplora per Categoria</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-3xl mb-2">🎯</span>
              <span className="font-medium text-gray-900">Tutti</span>
              <Badge variant="default" size="sm" className="mt-1">
                {services.length} servizi
              </Badge>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
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

      {/* Recommendations - INTELLIGENT DATA */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="border-2 border-blue-200">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  <Badge variant="info">
                    {rec.reason === 'personal_history' && '🎯'}
                    {rec.reason === 'new_services' && '✨'}
                    {rec.reason === 'popular' && '🔥'}
                    {rec.reason === 'fallback' && '⭐'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2">
                  {rec.services.map((serviceName, index) => {
                    const service = services.find(s => s.name === serviceName)
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{serviceName}</span>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => service && addToRecentlyViewed(service.id, service.name)}
                        >
                          Vedi
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {/* Recently Viewed - PERSISTENT DATA */}
      {recentlyViewed.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Visualizzati di Recente</h3>
          </Card.Header>
          <Card.Content>
            <div className="flex space-x-4 overflow-x-auto">
              {recentlyViewed.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-48 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.viewedAt}</p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => addToRecentlyViewed(item.id, item.name)}
                  >
                    Visualizza Dettagli
                  </Button>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Your Favorites - PERSISTENT DATA */}
      {favoriteServices.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">I Tuoi Preferiti ❤️</h3>
          </Card.Header>
          <Card.Content>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-3">
                Hai {favoriteServices.length} servizi nei preferiti. 
                Riceverai notifiche quando saranno disponibili offerte speciali!
              </p>
              <div className="flex flex-wrap gap-2">
                {favoriteServices.map(serviceId => {
                  const service = services.find(s => s.id === serviceId)
                  return service ? (
                    <Badge key={serviceId} variant="warning" className="text-xs">
                      {service.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Main Service Catalog - REAL DATA FROM SUPABASE */}
      <ServiceBookingSystem 
        services={getFilteredServices()}
        userPoints={employee?.available_points || 0}
        onBookService={handleServiceBooked}
        favoriteServices={favoriteServices}
        onToggleFavorite={toggleFavorite}
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
                <li>• Genera il QR code nella sezione QR</li>
                <li>• Mostra il QR al partner per il servizio</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Risparmia di più</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Controlla le offerte speciali sui servizi</li>
                <li>• Aggiungi servizi ai preferiti per trackarli</li>
                <li>• Combina più servizi dello stesso partner</li>
                <li>• Usa tutti i punti prima della scadenza</li>
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