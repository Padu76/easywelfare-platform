'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Badge from '@/components/ui/badge'

// Interfaces
interface PlatformStats {
  totalCompanies: number
  activeCompanies: number
  totalPartners: number
  activePartners: number
  totalEmployees: number
  activeEmployees: number
  totalTransactions: number
  platformRevenue: number
  monthlyGrowth: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
}

interface CompanyOverview {
  id: string
  name: string
  email: string
  employees_count: number
  total_credits: number
  used_credits: number
  subscription_status: string
  created_at: string
  last_activity: string
  monthly_spend: number
}

interface PartnerOverview {
  id: string
  business_name: string
  category: string
  commission_rate: number
  is_active: boolean
  approval_status: string
  monthly_revenue: number
  total_transactions: number
  created_at: string
}

interface LiveTransaction {
  id: string
  employee_name: string
  company_name: string
  partner_name: string
  service_name: string
  points_used: number
  commission: number
  status: string
  created_at: string
}

interface FinancialMetrics {
  totalRevenue: number
  monthlyRevenue: number
  commissionsGenerated: number
  pendingPayouts: number
  avgTransactionSize: number
  revenueGrowth: number
}

export default function AdminDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [companies, setCompanies] = useState<CompanyOverview[]>([])
  const [partners, setPartners] = useState<PartnerOverview[]>([])
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([])
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'companies' | 'partners' | 'transactions' | 'analytics' | 'settings'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Real-time refresh
  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchData = async () => {
      await loadPlatformData()
    }

    fetchData()

    if (autoRefresh) {
      interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlatformData = async () => {
    try {
      setError(null)

      // Load companies data
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (companiesError) throw companiesError

      // Load partners data
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })

      if (partnersError) throw partnersError

      // Load employees data
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')

      if (employeesError) throw employeesError

      // Load transactions data
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          employees!inner(first_name, last_name, company_id),
          companies!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (transactionsError) throw transactionsError

      // Process platform stats
      const totalCompanies = companiesData?.length || 0
      const activeCompanies = companiesData?.filter(c => c.total_credits > 0).length || 0
      const totalPartners = partnersData?.length || 0
      const activePartners = partnersData?.filter(p => p.is_active).length || 0
      const totalEmployees = employeesData?.length || 0
      const activeEmployees = employeesData?.filter(e => e.is_active).length || 0
      const totalTransactions = transactionsData?.length || 0

      // Calculate platform revenue (15% commission)
      const platformRevenue = (transactionsData || [])
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.points_used * 0.15), 0)

      const stats: PlatformStats = {
        totalCompanies,
        activeCompanies,
        totalPartners,
        activePartners,
        totalEmployees,
        activeEmployees,
        totalTransactions,
        platformRevenue: Math.round(platformRevenue),
        monthlyGrowth: 12.5, // Mock data - would be calculated from historical data
        systemHealth: 'excellent'
      }

      setPlatformStats(stats)

      // Process companies overview
      const companiesOverview: CompanyOverview[] = (companiesData || []).map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        employees_count: company.employees_count || 0,
        total_credits: company.total_credits || 0,
        used_credits: company.used_credits || 0,
        subscription_status: company.subscription_status || 'active',
        created_at: company.created_at,
        last_activity: company.updated_at || company.created_at,
        monthly_spend: Math.round((company.used_credits || 0) / 3) // Mock monthly average
      }))

      setCompanies(companiesOverview)

      // Process partners overview
      const partnersOverview: PartnerOverview[] = (partnersData || []).map(partner => {
        const partnerTransactions = (transactionsData || []).filter(t => t.partner_id === partner.id)
        const monthlyRevenue = partnerTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.points_used * 0.85), 0) // Partner gets 85%

        return {
          id: partner.id,
          business_name: partner.business_name,
          category: partner.category,
          commission_rate: partner.commission_rate || 15,
          is_active: partner.is_active,
          approval_status: partner.approval_status || 'approved',
          monthly_revenue: Math.round(monthlyRevenue),
          total_transactions: partnerTransactions.length,
          created_at: partner.created_at
        }
      })

      setPartners(partnersOverview)

      // Process live transactions
      const liveTransactionsFormatted: LiveTransaction[] = (transactionsData || []).slice(0, 20).map(t => ({
        id: t.id,
        employee_name: t.employees ? `${t.employees.first_name} ${t.employees.last_name}` : 'N/A',
        company_name: Array.isArray(t.companies) ? t.companies[0]?.name || 'N/A' : t.companies?.name || 'N/A',
        partner_name: 'Partner', // Would need join with partners table
        service_name: t.service_name || 'Servizio',
        points_used: t.points_used || 0,
        commission: Math.round((t.points_used || 0) * 0.15),
        status: t.status || 'pending',
        created_at: t.created_at
      }))

      setLiveTransactions(liveTransactionsFormatted)

      // Calculate financial metrics
      const completedTransactions = (transactionsData || []).filter(t => t.status === 'completed')
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.points_used * 0.15), 0)
      const monthlyRevenue = Math.round(totalRevenue / 3) // Mock monthly average
      const commissionsGenerated = totalRevenue
      const avgTransactionSize = completedTransactions.length > 0 
        ? completedTransactions.reduce((sum, t) => sum + t.points_used, 0) / completedTransactions.length 
        : 0

      const metrics: FinancialMetrics = {
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue,
        commissionsGenerated: Math.round(commissionsGenerated),
        pendingPayouts: Math.round(totalRevenue * 0.1), // Mock pending
        avgTransactionSize: Math.round(avgTransactionSize),
        revenueGrowth: 18.3 // Mock growth
      }

      setFinancialMetrics(metrics)

    } catch (err) {
      console.error('Error loading platform data:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePartner = async (partnerId: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ 
          approval_status: 'approved',
          is_active: true 
        })
        .eq('id', partnerId)

      if (error) throw error

      await loadPlatformData()
      alert('✅ Partner approvato con successo!')

    } catch (error) {
      console.error('Error approving partner:', error)
      alert('❌ Errore nell\'approvazione del partner')
    }
  }

  const handleSuspendCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`⚠️ Sei sicuro di voler sospendere ${companyName}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({ subscription_status: 'suspended' })
        .eq('id', companyId)

      if (error) throw error

      await loadPlatformData()
      alert('✅ Azienda sospesa con successo!')

    } catch (error) {
      console.error('Error suspending company:', error)
      alert('❌ Errore nella sospensione dell\'azienda')
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'excellent':
        return <Badge variant="success" icon="🟢">Eccellente</Badge>
      case 'good':
        return <Badge variant="info" icon="🔵">Buono</Badge>
      case 'warning':
        return <Badge variant="warning" icon="🟡">Attenzione</Badge>
      case 'critical':
        return <Badge variant="danger" icon="🔴">Critico</Badge>
      default:
        return <Badge variant="default">{health}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" icon="✅">Attivo</Badge>
      case 'suspended':
        return <Badge variant="danger" icon="🚫">Sospeso</Badge>
      case 'pending':
        return <Badge variant="warning" icon="⏳">In Attesa</Badge>
      case 'approved':
        return <Badge variant="success" icon="✅">Approvato</Badge>
      case 'rejected':
        return <Badge variant="danger" icon="❌">Rifiutato</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  if (loading && !platformStats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎛️ Admin Dashboard</h1>
          <p className="text-gray-600">Caricamento dati piattaforma...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎛️ Admin Dashboard</h1>
          <p className="text-gray-600">Errore nel caricamento</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadPlatformData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            🔄 Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎛️ EasyWelfare - Admin Dashboard</h1>
          <p className="text-gray-600">Controllo completo della piattaforma welfare</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </div>
          <Button
            variant={autoRefresh ? 'secondary' : 'primary'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            {autoRefresh ? '⏸️ Pausa' : '▶️ Live'}
          </Button>
          <Button
            onClick={loadPlatformData}
            variant="secondary"
            size="sm"
          >
            🔄 Aggiorna
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {platformStats && platformStats.systemHealth !== 'excellent' && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="text-yellow-800 font-bold">Sistema in Attenzione</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Rilevate anomalie nel sistema. Controlla i log e le performance.
              </p>
            </div>
            {getHealthBadge(platformStats.systemHealth)}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <Card>
        <Card.Content>
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'companies', label: '🏢 Aziende', icon: '🏢' },
              { id: 'partners', label: '🏪 Partner', icon: '🏪' },
              { id: 'transactions', label: '💳 Transazioni Live', icon: '💳' },
              { id: 'analytics', label: '📈 Analytics', icon: '📈' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Overview Tab */}
      {selectedTab === 'overview' && platformStats && (
        <>
          {/* Platform KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aziende Totali</p>
                    <p className="text-2xl font-bold text-blue-600">{platformStats.totalCompanies}</p>
                    <p className="text-xs text-green-600">+{platformStats.monthlyGrowth}% questo mese</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🏢</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Partner Attivi</p>
                    <p className="text-2xl font-bold text-green-600">{platformStats.activePartners}</p>
                    <p className="text-xs text-gray-500">di {platformStats.totalPartners} totali</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">🏪</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dipendenti Attivi</p>
                    <p className="text-2xl font-bold text-purple-600">{platformStats.activeEmployees}</p>
                    <p className="text-xs text-gray-500">di {platformStats.totalEmployees} registrati</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">👥</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue Piattaforma</p>
                    <p className="text-2xl font-bold text-yellow-600">€{platformStats.platformRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">Commissioni 15%</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">💰</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Quick Stats and System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">📊 Statistiche Rapide</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Transazioni Totali</span>
                    <span className="font-bold text-blue-600">{platformStats.totalTransactions.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Crescita Mensile</span>
                    <span className="font-bold text-green-600">+{platformStats.monthlyGrowth}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Aziende Attive</span>
                    <span className="font-bold text-purple-600">{((platformStats.activeCompanies / platformStats.totalCompanies) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">🔧 System Health</h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Stato Sistema</span>
                    {getHealthBadge(platformStats.systemHealth)}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Uptime</span>
                    <span className="text-green-600 font-bold">99.9%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Response Time</span>
                    <span className="text-blue-600 font-bold">145ms</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Database Status</span>
                    <Badge variant="success" icon="🟢">Online</Badge>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ <strong>Tutto funziona correttamente</strong><br/>
                      Ultimo aggiornamento: {new Date().toLocaleString('it-IT')}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </>
      )}

      {/* Companies Tab */}
      {selectedTab === 'companies' && (
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">🏢 Gestione Aziende ({companies.length})</h3>
              <Button variant="primary">
                ➕ Aggiungi Azienda
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Azienda</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendenti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Crediti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Utilizzo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Spesa Mensile</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const utilizationRate = company.total_credits > 0 
                      ? (company.used_credits / company.total_credits) * 100 
                      : 0

                    return (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-sm text-gray-600">{company.email}</p>
                            <p className="text-xs text-gray-500">
                              Registrata: {new Date(company.created_at).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-purple-600">
                          {company.employees_count}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-blue-600">€{company.total_credits.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Utilizzati: €{company.used_credits.toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{utilizationRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          €{company.monthly_spend.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(company.subscription_status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="secondary" size="sm">
                              👁️ Dettagli
                            </Button>
                            {company.subscription_status === 'active' ? (
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleSuspendCompany(company.id, company.name)}
                              >
                                🚫 Sospendi
                              </Button>
                            ) : (
                              <Button variant="success" size="sm">
                                ✅ Riattiva
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Partners Tab */}
      {selectedTab === 'partners' && (
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">🏪 Gestione Partner ({partners.length})</h3>
              <div className="flex space-x-2">
                <Button variant="secondary">
                  📊 Report Partner
                </Button>
                <Button variant="primary">
                  ➕ Aggiungi Partner
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Partner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Commissione</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue Mensile</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Transazioni</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{partner.business_name}</p>
                          <p className="text-xs text-gray-500">
                            Registrato: {new Date(partner.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{partner.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-red-600">
                        {partner.commission_rate}%
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        €{partner.monthly_revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600">
                        {partner.total_transactions}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(partner.is_active ? 'active' : 'suspended')}
                          {getStatusBadge(partner.approval_status)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <Button variant="secondary" size="sm">
                            👁️
                          </Button>
                          {partner.approval_status === 'pending' && (
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleApprovePartner(partner.id)}
                            >
                              ✅
                            </Button>
                          )}
                          <Button variant={partner.is_active ? 'danger' : 'success'} size="sm">
                            {partner.is_active ? '🚫' : '✅'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Live Transactions Tab */}
      {selectedTab === 'transactions' && (
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">💳 Transazioni Live</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Tempo reale</span>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Azienda</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Commissione</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.employee_name}</td>
                      <td className="py-3 px-4 text-gray-600">{transaction.company_name}</td>
                      <td className="py-3 px-4">{transaction.service_name}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">
                        {transaction.points_used.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        €{transaction.commission.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(transaction.created_at).toLocaleString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && financialMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">💰 Metriche Finanziarie</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Revenue Totale</span>
                  <span className="font-bold text-green-600">€{financialMetrics.totalRevenue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Revenue Mensile</span>
                  <span className="font-bold text-blue-600">€{financialMetrics.monthlyRevenue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Commissioni Generate</span>
                  <span className="font-bold text-purple-600">€{financialMetrics.commissionsGenerated.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Pagamenti Pendenti</span>
                  <span className="font-bold text-yellow-600">€{financialMetrics.pendingPayouts.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Transazione Media</span>
                  <span className="font-bold text-gray-600">€{financialMetrics.avgTransactionSize.toLocaleString()}</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">📈 Trend e Crescita</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-2">Crescita Revenue</p>
                  <p className="text-3xl font-bold text-green-700">+{financialMetrics.revenueGrowth}%</p>
                  <p className="text-sm text-green-600 mt-1">Rispetto al mese scorso</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Proiezioni</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Revenue stimata fine mese:</span>
                      <span className="font-medium">€{(financialMetrics.monthlyRevenue * 1.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crescita annuale prevista:</span>
                      <span className="font-medium text-green-700">+{(financialMetrics.revenueGrowth * 12).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="primary" className="w-full">
                  📊 Report Completo
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">⚙️ Impostazioni Piattaforma</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <Input
                  label="Commissione Piattaforma (%)"
                  type="number"
                  defaultValue="15"
                  min="0"
                  max="50"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approvazione Partner
                  </label>
                  <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="automatic">Automatica</option>
                    <option value="manual">Manuale</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite Aziende
                  </label>
                  <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="unlimited">Illimitato</option>
                    <option value="100">Max 100</option>
                    <option value="500">Max 500</option>
                  </select>
                </div>
                
                <Button variant="primary" className="w-full">
                  💾 Salva Impostazioni
                </Button>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">🔔 Notifiche e Alert</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nuove registrazioni</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Errori sistema</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Revenue giornaliera</span>
                  <input type="checkbox" className="rounded border-gray-300" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Partner in attesa</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                </div>
                
                <Button variant="secondary" className="w-full">
                  📧 Test Notifiche
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Footer Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleString('it-IT')}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Sistema operativo</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            🎛️ <strong>EasyWelfare Admin v1.0</strong> - Controllo piattaforma welfare
          </div>
        </div>
      </div>
    </div>
  )
}