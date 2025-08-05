'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
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
  max_redemptions: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ServiceStats {
  totalServices: number
  activeServices: number
  totalBookings: number
  monthlyRevenue: number
  totalTransactions: number
}

interface NewServiceForm {
  name: string
  description: string
  category: ServiceCategory
  points_required: number
  original_price: number
  discount_percentage: number
  max_redemptions: number
}

export default function PartnerServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([])
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [showAddService, setShowAddService] = useState(false)
  const [editingService, setEditingService] = useState<ServiceData | null>(null)
  const [newService, setNewService] = useState<NewServiceForm>({
    name: '',
    description: '',
    category: ServiceCategory.FITNESS,
    points_required: 0,
    original_price: 0,
    discount_percentage: 0,
    max_redemptions: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using first partner. In real app, this comes from auth
  const currentPartnerId = 'ptr_1'

  useEffect(() => {
    fetchServices()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('partner_id', currentPartnerId)
        .order('created_at', { ascending: false })

      if (servicesError) throw servicesError

      setServices(servicesData || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Errore nel caricamento servizi')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get transactions data for stats
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('points_used, status, created_at')
        .eq('partner_id', currentPartnerId)

      if (transactionsError) throw transactionsError

      const completedTransactions = (transactionsData || []).filter(t => t.status === 'completed')
      
      // Calculate monthly stats
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyTransactions = completedTransactions.filter(t => 
        new Date(t.created_at) >= startOfMonth
      )

      const monthlyRevenue = monthlyTransactions.reduce(
        (sum, t) => sum + Math.round((t.points_used || 0) * 0.85), // Partner gets 85%
        0
      )

      const statsData: ServiceStats = {
        totalServices: services.length,
        activeServices: services.filter(s => s.is_active).length,
        totalBookings: completedTransactions.length,
        monthlyRevenue,
        totalTransactions: monthlyTransactions.length
      }

      setStats(statsData)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleAddService = async () => {
    if (!newService.name || !newService.description || newService.points_required <= 0) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    try {
      setIsProcessing(true)

      const serviceData = {
        partner_id: currentPartnerId,
        name: newService.name,
        description: newService.description,
        category: newService.category,
        points_required: newService.points_required,
        original_price: newService.original_price,
        discount_percentage: newService.discount_percentage,
        max_redemptions: newService.max_redemptions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setServices(prev => [data, ...prev])
      
      // Reset form
      setNewService({
        name: '',
        description: '',
        category: ServiceCategory.FITNESS,
        points_required: 0,
        original_price: 0,
        discount_percentage: 0,
        max_redemptions: 0
      })
      
      setShowAddService(false)
      
      // Refresh stats
      fetchStats()

      alert('Servizio aggiunto con successo!')
    } catch (err) {
      console.error('Error adding service:', err)
      alert('Errore nell\'aggiunta del servizio. Riprova.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditService = (service: ServiceData) => {
    setEditingService(service)
    setNewService({
      name: service.name,
      description: service.description,
      category: service.category as ServiceCategory,
      points_required: service.points_required,
      original_price: service.original_price || 0,
      discount_percentage: service.discount_percentage || 0,
      max_redemptions: service.max_redemptions || 0
    })
    setShowAddService(true)
  }

  const handleSaveEdit = async () => {
    if (!editingService) return

    try {
      setIsProcessing(true)

      const updateData = {
        name: newService.name,
        description: newService.description,
        category: newService.category,
        points_required: newService.points_required,
        original_price: newService.original_price,
        discount_percentage: newService.discount_percentage,
        max_redemptions: newService.max_redemptions,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', editingService.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setServices(prev => prev.map(service => 
        service.id === editingService.id ? data : service
      ))

      // Reset form
      setEditingService(null)
      setNewService({
        name: '',
        description: '',
        category: ServiceCategory.FITNESS,
        points_required: 0,
        original_price: 0,
        discount_percentage: 0,
        max_redemptions: 0
      })
      
      setShowAddService(false)
      
      // Refresh stats
      fetchStats()

      alert('Servizio modificato con successo!')
    } catch (err) {
      console.error('Error updating service:', err)
      alert('Errore nella modifica del servizio. Riprova.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleActive = async (serviceId: string) => {
    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      const { data, error } = await supabase
        .from('services')
        .update({ 
          is_active: !service.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setServices(prev => prev.map(s => 
        s.id === serviceId ? data : s
      ))

      // Refresh stats
      fetchStats()

      alert(`Servizio ${data.is_active ? 'attivato' : 'disattivato'} con successo!`)
    } catch (err) {
      console.error('Error toggling service status:', err)
      alert('Errore nell\'aggiornamento del servizio. Riprova.')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo servizio? Questa azione non può essere annullata.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error

      // Update local state
      setServices(prev => prev.filter(s => s.id !== serviceId))
      
      // Refresh stats
      fetchStats()

      alert('Servizio eliminato con successo!')
    } catch (err) {
      console.error('Error deleting service:', err)
      alert('Errore nell\'eliminazione del servizio. Riprova.')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case ServiceCategory.FITNESS: return '🏋️'
      case ServiceCategory.WELLNESS: return '💆'
      case ServiceCategory.HEALTH: return '🏥'
      case ServiceCategory.NUTRITION: return '🥗'
      case ServiceCategory.EDUCATION: return '📚'
      case ServiceCategory.LIFESTYLE: return '🎨'
      default: return '⭐'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category.toLowerCase()) {
      case ServiceCategory.FITNESS: return 'Fitness'
      case ServiceCategory.WELLNESS: return 'Benessere'
      case ServiceCategory.HEALTH: return 'Salute'
      case ServiceCategory.NUTRITION: return 'Nutrizione'
      case ServiceCategory.EDUCATION: return 'Formazione'
      case ServiceCategory.LIFESTYLE: return 'Lifestyle'
      default: return category
    }
  }

  const calculateFinalPrice = (originalPrice: number, discount: number) => {
    return originalPrice * (1 - discount / 100)
  }

  const calculateCommission = (pointsRequired: number) => {
    const commissionRate = 15 // 15% commission
    return Math.round(pointsRequired * (commissionRate / 100))
  }

  const resetForm = () => {
    setNewService({
      name: '',
      description: '',
      category: ServiceCategory.FITNESS,
      points_required: 0,
      original_price: 0,
      discount_percentage: 0,
      max_redemptions: 0
    })
    setEditingService(null)
    setShowAddService(false)
  }

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
              <div className="bg-gray-200 rounded-lg h-32"></div>
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
                fetchStats()
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
          <h1 className="text-2xl font-bold text-gray-900">I Tuoi Servizi</h1>
          <p className="text-gray-600">Gestisci i servizi che offri nel circuito EasyWelfare</p>
        </div>
        <Button onClick={() => setShowAddService(true)} variant="primary">
          ➕ Aggiungi Servizio
        </Button>
      </div>

      {/* Stats Cards - REAL DATA FROM SUPABASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Servizi Totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalServices || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats?.activeServices || 0}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats?.totalBookings || 0}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats?.monthlyRevenue?.toLocaleString() || 0} punti</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">💰</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Services List - REAL DATA FROM SUPABASE */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  </div>
                  <Badge variant={service.is_active ? 'success' : 'danger'}>
                    {service.is_active ? 'Attivo' : 'Inattivo'}
                  </Badge>
                </div>
              </Card.Header>

              <Card.Content>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-blue-600 font-medium">Punti Richiesti</p>
                      <p className="text-blue-800 font-bold">{service.points_required}</p>
                    </div>
                    
                    {service.original_price > 0 && (
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-green-600 font-medium">Prezzo Originale</p>
                        <p className="text-green-800 font-bold">€{service.original_price}</p>
                      </div>
                    )}
                    
                    {service.discount_percentage > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-2">
                        <p className="text-yellow-600 font-medium">Sconto</p>
                        <p className="text-yellow-800 font-bold">{service.discount_percentage}%</p>
                      </div>
                    )}
                    
                    <div className="bg-purple-50 rounded-lg p-2">
                      <p className="text-purple-600 font-medium">Commissione</p>
                      <p className="text-purple-800 font-bold">{calculateCommission(service.points_required)} punti</p>
                    </div>
                  </div>

                  {service.original_price > 0 && service.discount_percentage > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Prezzo finale cliente:</span>
                        <span className="font-bold text-gray-900">
                          €{calculateFinalPrice(service.original_price, service.discount_percentage).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Max prenotazioni: {service.max_redemptions || 'Illimitate'}</span>
                    <span>Aggiornato: {new Date(service.updated_at).toLocaleDateString()}</span>
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
                    variant={service.is_active ? 'danger' : 'success'}
                    onClick={() => handleToggleActive(service.id)}
                    className="flex-1"
                  >
                    {service.is_active ? '🚫 Disattiva' : '✅ Attiva'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteService(service.id)}
                    size="sm"
                  >
                    🗑️
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🛍️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun servizio ancora
              </h3>
              <p className="text-gray-600 mb-4">
                Inizia ad aggiungere i tuoi servizi per attirare clienti welfare
              </p>
              <Button onClick={() => setShowAddService(true)}>
                ➕ Aggiungi il Primo Servizio
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

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
                  onClick={resetForm}
                  disabled={isProcessing}
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
                  disabled={isProcessing}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione *
                  </label>
                  <textarea
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    rows={3}
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrizione dettagliata del servizio..."
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value as ServiceCategory }))}
                    disabled={isProcessing}
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
                    value={newService.points_required}
                    onChange={(e) => setNewService(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
                    placeholder="200"
                    disabled={isProcessing}
                  />

                  <Input
                    label="Prezzo Originale (€)"
                    type="number"
                    step="0.01"
                    value={newService.original_price}
                    onChange={(e) => setNewService(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                    placeholder="50.00"
                    disabled={isProcessing}
                  />

                  <Input
                    label="Sconto (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={newService.discount_percentage}
                    onChange={(e) => setNewService(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) || 0 }))}
                    placeholder="20"
                    disabled={isProcessing}
                  />

                  <Input
                    label="Max Prenotazioni"
                    type="number"
                    value={newService.max_redemptions}
                    onChange={(e) => setNewService(prev => ({ ...prev, max_redemptions: parseInt(e.target.value) || 0 }))}
                    placeholder="50 (0 = illimitate)"
                    disabled={isProcessing}
                  />
                </div>

                {/* Preview */}
                {newService.points_required > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">📋 Anteprima</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Commissione EasyWelfare:</span>
                        <span className="ml-2 font-bold text-purple-600">
                          {calculateCommission(newService.points_required)} punti (15%)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tu ricevi:</span>
                        <span className="ml-2 font-bold text-green-600">
                          {newService.points_required - calculateCommission(newService.points_required)} punti
                        </span>
                      </div>
                      {newService.original_price > 0 && newService.discount_percentage > 0 && (
                        <>
                          <div>
                            <span className="text-gray-600">Prezzo finale cliente:</span>
                            <span className="ml-2 font-bold text-blue-600">
                              €{calculateFinalPrice(newService.original_price, newService.discount_percentage).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risparmio cliente:</span>
                            <span className="ml-2 font-bold text-green-600">
                              €{(newService.original_price * newService.discount_percentage / 100).toFixed(2)}
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
                    onClick={resetForm}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={editingService ? handleSaveEdit : handleAddService}
                    disabled={!newService.name || !newService.description || newService.points_required <= 0 || isProcessing}
                    loading={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing 
                      ? (editingService ? 'Salvando...' : 'Aggiungendo...') 
                      : (editingService ? '💾 Salva Modifiche' : '➕ Aggiungi Servizio')
                    }
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