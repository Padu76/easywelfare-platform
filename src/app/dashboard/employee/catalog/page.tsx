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

  useEffect(() => {
    fetchEmployeeData()
    fetchServices()
    loadUserPreferences()
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
      setIsLoading(true)
      console.log('🔍 Fetching services...')
      
      // Fetch all active services with partner info
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
      
      // Calculate category statistics
      const categoryMap = new Map()
      
      finalServices.forEach(service => {
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
      await generateRecommendations(finalServices)
      
      console.log('✅ Services loaded:', finalServices.length)
      
    } catch (err) {
      console.error('Error fetching services:', err)
      // Don't throw, continue with empty services
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = async (allServices: ServiceData[]) => {
    try {
      if (!employee) return

      console.log('🔍 Generating recommendations for employee:', employee.id)

      // Get user's transaction history for personalized recommendations
      const { data: userTransactions, error: txError } = await supabase
        .from('transactions')
        .select('service_name, created_at')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (txError) {
        console.warn('Error fetching transactions for recommendations:', txError)
        // Continue with fallback recommendations
      }

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

      // Popular services (fallback with top services)
      if (allServices.length > 0) {
        const popularServices = allServices
          .slice(0, 3)
          .map(s => s.name)

        if (popularServices.length > 0) {
          recs.push({
            id: 'rec_popular',
            title: 'I più popolari',
            description: 'Servizi più richiesti dai colleghi',
            services: popularServices,
            reason: 'popular'
          })
        }
      }

      // If no recommendations, add fallback
      if (recs.length === 0 && allServices.length > 0) {
        recs.push({
          id: 'rec_fallback',
          title: 'Servizi Consigliati',
          description: 'Una selezione dei nostri migliori servizi',
          services: allServices.slice(0, 3).map(s => s.name),
          reason: 'fallback'
        })
      }

      setRecommendations(recs)
      console.log('✅ Recommendations generated:', recs.length)
    } catch (err) {
      console.error('Error generating recommendations:', err)
      // Set minimal fallback recommendations
      if (allServices.length > 0) {
        setRecommendations([
          {
            id: 'rec_fallback',
            title: 'Servizi Disponibili',
            description: 'Esplora i nostri servizi welfare',
            services: allServices.slice(0, 3).map(s => s.name),
            reason: 'fallback'
          }
        ])
      }
    }
  }

  const loadUserPreferences = async () => {
    try {
      if (!employee) return

      // Load favorites from localStorage for now (could be moved to database)
      const storedFavorites = localStorage.getItem(`favorites_${employee.id}`)
      if (storedFavorites) {
        setFavoriteServices(JSON.parse(storedFavorites))
      }

      // Load recently viewed
      const storedRecent = localStorage.getItem(`recent_${employee.id}`)
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

      // Calculate available credits using correct schema
      const availableCredits = employee.allocated_credits - employee.used_credits

      // Check if user has enough credits
      if (availableCredits < service.points_required) {
        alert('Crediti insufficienti per questo servizio')
        return
      }

      // Create transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          employee_id: employee.id,
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

      // Update employee credits using correct schema
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          used_credits: employee.used_credits + service.points_required
        })
        .eq('id', employee.id)

      if (updateError) throw updateError

      // Update local state
      setEmployee(prev => prev ? {
        ...prev,
        used_credits: prev.used_credits + service.points_required
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
    if (!employee) return

    const newFavorites = favoriteServices.includes(serviceId)
      ? favoriteServices.filter(id => id !== serviceId)
      : [...favoriteServices, serviceId]
    
    setFavoriteServices(newFavorites)
    
    // Save to localStorage
    try {
      localStorage.setItem(`favorites_${employee.id}`, JSON.stringify(newFavorites))
    } catch (err) {
      console.error('Error saving favorites:', err)
    }
  }

  const addToRecentlyViewed = (serviceId: string, serviceName: string) => {
    if (!employee) return

    const newItem = {
      id: serviceId,
      name: serviceName,
      viewedAt: new Date().toLocaleString()
    }

    const filtered = recentlyViewed.filter(item => item.id !== serviceId)
    const newRecent = [newItem, ...filtered].slice(0, 5)
    
    setRecentlyViewed(newRecent)
    
    try {
      localStorage.setItem(`recent_${employee.id}`, JSON.stringify(newRecent))
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

  const transformServicesToServiceBookingFormat = (services: ServiceData[]) => {
    return services.map(service => ({
      id: service.id,
      partnerId: service.partner_id,
      name: service.name,
      description: service.description,
      category: service.category as any, // ServiceCategory enum
      pointsRequired: service.points_required,
      originalPrice: service.original_price,
      discountPercentage: service.discount_percentage,
      isActive: service.is_active,
      createdAt: new Date(service.created_at),
      updatedAt: new Date(service.created_at)
    }))
  }

  const getFilteredServices = () => {
    const filtered = selectedCategory === 'all' 
      ? services 
      : services.filter(service => service.category.toLowerCase() === selectedCategory)
    
    return transformServicesToServiceBookingFormat(filtered)
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
          <h1 className="text-2xl font-bold text-gray-900">🛍️ Catalogo Servizi</h1>
          <p className="text-gray-600">
            Scopri e prenota i servizi welfare disponibili
            {employee && ` - ${employee.first_name} ${employee.last_name}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">I tuoi crediti</p>
          <p className="text-3xl font-bold text-blue-600">{availableCredits.toLocaleString()}</p>
          <p className="text-xs text-gray-500">di {employee?.allocated_credits?.toLocaleString() || 0} assegnati</p>
        </div>
      </div>

      {/* Employee Info */}
      {employee && (
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👤</span>
                </div>
                <div>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                  <p className="text-sm text-gray-600">{employee.department} • {employee.employee_code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Utilizzo crediti</p>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((employee.used_credits / employee.allocated_credits) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {((employee.used_credits / employee.allocated_credits) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Quick Categories */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">🎯 Esplora per Categoria</h3>
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

      {/* Recommendations */}
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

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">👀 Visualizzati di Recente</h3>
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

      {/* Favorites */}
      {favoriteServices.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">❤️ I Tuoi Preferiti</h3>
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

      {/* Main Service Catalog */}
      {services.length > 0 ? (
        <ServiceBookingSystem 
          services={getFilteredServices()}
          userPoints={availableCredits}
          onBookService={handleServiceBooked}
        />
      ) : (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🛍️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun servizio disponibile
              </h3>
              <p className="text-gray-600 mb-4">
                Al momento non ci sono servizi attivi nel catalogo
              </p>
              <Button onClick={fetchServices}>
                🔄 Ricarica Servizi
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

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
                <li>• Prenota utilizzando i tuoi crediti</li>
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
                <li>• Usa tutti i crediti prima della scadenza</li>
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