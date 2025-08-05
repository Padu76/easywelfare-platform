'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import QRScanner from '@/components/dashboard/QRScanner'

interface PartnerData {
  id: string
  business_name: string
  category: string
  email: string
  phone: string
  address: string
  commission_rate: number
  is_active: boolean
  created_at: string
}

interface ServiceData {
  id: string
  name: string
  category: string
  points_required: number
  is_active: boolean
}

interface TransactionData {
  id: string
  service_name: string
  customer_name: string
  points_used: number
  commission: number
  net_amount: number
  status: string
  created_at: string
}

interface DashboardStats {
  monthlyRevenue: number
  totalTransactions: number
  activeServices: number
  pendingPayment: number
  todayTransactions: number
  weeklyTransactions: number
  conversionRate: number
}

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [services, setServices] = useState<ServiceData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topServices, setTopServices] = useState<any[]>([])
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using first partner. In real app, this comes from auth
  const currentPartnerId = 'ptr_1'

  useEffect(() => {
    fetchPartnerData()
  }, [])

  const fetchPartnerData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch partner data
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('id', currentPartnerId)
        .single()

      if (partnerError) throw partnerError
      setPartner(partnerData)

      // Fetch partner services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('partner_id', currentPartnerId)

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch recent transactions (last 5)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(first_name, last_name)
        `)
        .eq('partner_id', currentPartnerId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (transactionsError) throw transactionsError

      // Format transactions data
      const formattedTransactions = (transactionsData || []).map(t => ({
        id: t.id,
        service_name: t.service_name || 'Servizio Sconosciuto',
        customer_name: t.employees ? `${t.employees.first_name} ${t.employees.last_name}` : 'Cliente Sconosciuto',
        points_used: t.points_used || 0,
        commission: Math.round((t.points_used || 0) * 0.15), // 15% commission
        net_amount: Math.round((t.points_used || 0) * 0.85), // 85% to partner
        status: t.status || 'completed',
        created_at: t.created_at
      }))

      setRecentTransactions(formattedTransactions)

      // Calculate dashboard stats
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Get monthly transactions for stats
      const { data: monthlyTxns, error: monthlyError } = await supabase
        .from('transactions')
        .select('points_used, status, created_at')
        .eq('partner_id', currentPartnerId)
        .gte('created_at', startOfMonth.toISOString())

      if (monthlyError) throw monthlyError

      const completedMonthlyTxns = (monthlyTxns || []).filter(t => t.status === 'completed')
      const totalPoints = completedMonthlyTxns.reduce((sum, t) => sum + (t.points_used || 0), 0)
      const monthlyRevenue = Math.round(totalPoints * 0.85) // Partner gets 85%
      const pendingPayment = Math.round(totalPoints * 0.85) // Assuming all pending

      // Today's transactions
      const todayTransactions = completedMonthlyTxns.filter(t => 
        new Date(t.created_at) >= startOfDay
      ).length

      // Week's transactions
      const weeklyTransactions = completedMonthlyTxns.filter(t => 
        new Date(t.created_at) >= startOfWeek
      ).length

      const dashboardStats: DashboardStats = {
        monthlyRevenue,
        totalTransactions: completedMonthlyTxns.length,
        activeServices: servicesData?.filter(s => s.is_active).length || 0,
        pendingPayment,
        todayTransactions,
        weeklyTransactions,
        conversionRate: 85.5 // Placeholder - would be calculated from actual data
      }

      setStats(dashboardStats)

      // Calculate top services
      const serviceStats = servicesData?.map(service => {
        const serviceTxns = completedMonthlyTxns.filter(t => t.service_name === service.name)
        const revenue = serviceTxns.reduce((sum, t) => sum + Math.round((t.points_used || 0) * 0.85), 0)
        return {
          id: service.id,
          name: service.name,
          sales: serviceTxns.length,
          revenue,
          points: service.points_required,
          icon: getServiceIcon(service.category)
        }
      }).sort((a, b) => b.sales - a.sales).slice(0, 3) || []

      setTopServices(serviceStats)

    } catch (err) {
      console.error('Error fetching partner data:', err)
      setError('Errore nel caricamento dei dati. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }

  const getServiceIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'fitness': return '🏋️'
      case 'wellness': return '💆'
      case 'health': return '🏥'
      case 'nutrition': return '🥗'
      case 'education': return '📚'
      case 'lifestyle': return '🎨'
      default: return '⭐'
    }
  }

  const handleQRScanSuccess = (transaction: any) => {
    console.log('QR Scan successful:', transaction)
    // Refresh data after successful scan
    fetchPartnerData()
    setShowQRScanner(false)
  }

  const handleQRScanError = (error: string) => {
    console.error('QR Scan error:', error)
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
              <Button onClick={fetchPartnerData}>
                🔄 Riprova
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🏪</span>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner non trovato</h1>
              <p className="text-gray-600">Verifica i tuoi dati di accesso</p>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Ciao {partner.business_name}! 🏪
          </h1>
          <p className="text-gray-600">Gestisci i tuoi servizi e monitora le vendite</p>
        </div>
        <Button 
          onClick={() => setShowQRScanner(true)}
          variant="primary"
          size="lg"
        >
          📱 Scanner QR
        </Button>
      </div>

      {/* Stats Cards - REAL DATA FROM SUPABASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Ricavi Mese</p>
              <p className="text-2xl font-bold">{stats?.monthlyRevenue?.toLocaleString() || 0} punti</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Transazioni</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions || 0}</p>
                <p className="text-xs text-gray-500">+{stats?.todayTransactions || 0} oggi</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Servizi Attivi</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeServices || 0}</p>
                <p className="text-xs text-gray-500">di {services.length} totali</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Da Ricevere</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingPayment?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">prossimo pagamento</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Business Info & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Informazioni Business</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <span className="text-blue-600">🏷️</span>
                <div>
                  <p className="font-medium">Categoria</p>
                  <p className="text-sm text-gray-600">{partner.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <span className="text-green-600">💼</span>
                <div>
                  <p className="font-medium">Commissione</p>
                  <p className="text-sm text-gray-600">{partner.commission_rate}% sui servizi</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <span className="text-purple-600">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">{partner.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <span className="text-yellow-600">📍</span>
                <div>
                  <p className="font-medium">Indirizzo</p>
                  <p className="text-sm text-gray-600">{partner.address}</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Azioni Rapide</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowQRScanner(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>📱</span>
                <span>Scanner QR</span>
              </Button>
              
              <Link href="/dashboard/partner/services" className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>Gestisci Servizi</span>
              </Link>
              
              <Link href="/dashboard/partner/transactions" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <span>💰</span>
                <span>Vedi Transazioni</span>
              </Link>
              
              <Link href="/dashboard/partner/vouchers" className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
                <span>🎫</span>
                <span>Gestisci Voucher</span>
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">📊 Performance Mensile</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats?.totalTransactions || 0}</div>
                <div className="text-sm text-gray-600">Transazioni</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats?.monthlyRevenue?.toLocaleString() || 0}</div>
                <div className="text-sm text-gray-600">Punti Guadagnati</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats?.weeklyTransactions || 0}</div>
                <div className="text-sm text-gray-600">Questa Settimana</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats?.conversionRate}%</div>
                <div className="text-sm text-gray-600">Tasso Conversione</div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">🏆 Servizi Top</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {topServices.length > 0 ? topServices.map((service, index) => (
                <div key={service.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.sales} vendite questo mese</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{service.revenue} punti</p>
                    <p className="text-xs text-gray-500">{service.points} punti/servizio</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">📈</span>
                  <p className="text-gray-600">Nessuna vendita questo mese</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Transactions - REAL DATA FROM SUPABASE */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Transazioni Recenti</h3>
            <Link href="/dashboard/partner/transactions" className="text-blue-600 hover:text-blue-800 text-sm">
              Vedi tutte →
            </Link>
          </div>
        </Card.Header>
        <Card.Content>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Commissione</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Netto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.customer_name}</td>
                      <td className="py-3 px-4">{transaction.service_name}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{transaction.points_used}</td>
                      <td className="py-3 px-4 font-semibold text-red-600">-{transaction.commission}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{transaction.net_amount}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">💳</span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nessuna transazione ancora</h4>
              <p className="text-gray-600 mb-4">Le transazioni dei clienti appariranno qui</p>
              <Button onClick={() => setShowQRScanner(true)}>
                Inizia con Scanner QR
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Tips & Help */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">💡 Suggerimenti per Aumentare le Vendite</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-lg">✅</span>
                <div>
                  <p className="font-medium">Aggiorna regolarmente i servizi</p>
                  <p className="text-sm text-gray-600">Mantieni l'offerta fresca e interessante</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-lg">💎</span>
                <div>
                  <p className="font-medium">Ottimizza i punti richiesti</p>
                  <p className="text-sm text-gray-600">Bilancia valore percepito e accessibilità</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">⚡</span>
                <div>
                  <p className="font-medium">Rispondi velocemente</p>
                  <p className="text-sm text-gray-600">Scanner QR rapido = clienti soddisfatti</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-lg">📊</span>
                <div>
                  <p className="font-medium">Monitora le performance</p>
                  <p className="text-sm text-gray-600">Usa i dati per migliorare l'offerta</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">🆘 Supporto & Risorse</h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full">
                💬 Contatta il Supporto
              </Button>
              
              <Button variant="secondary" className="w-full">
                📖 Guide per Partner
              </Button>
              
              <Button variant="secondary" className="w-full">
                📊 Centro Analytics
              </Button>
              
              <Button variant="secondary" className="w-full">
                💰 Gestione Pagamenti
              </Button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-blue-800 text-sm">
                  📞 <strong>Supporto Urgente:</strong> 800-123-456<br/>
                  🕒 Disponibile 24/7 per emergenze
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Scanner QR Cliente</h2>
                <Button
                  variant="secondary"
                  onClick={() => setShowQRScanner(false)}
                >
                  ❌ Chiudi
                </Button>
              </div>
              
              <QRScanner
                partnerId={currentPartnerId}
                onScanSuccess={handleQRScanSuccess}
                onScanError={handleQRScanError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}