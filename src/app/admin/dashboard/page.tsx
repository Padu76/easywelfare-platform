'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

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
}

interface Company {
  id: string
  name: string
  email: string
  total_credits: number
  used_credits: number
  subscription_status: string
  created_at: string
}

interface Partner {
  id: string
  business_name: string
  category: string
  is_active: boolean
  approval_status: string
  created_at: string
}

interface Transaction {
  id: string
  service_name: string
  points_used: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'companies' | 'partners' | 'transactions'>('overview')

  useEffect(() => {
    loadPlatformData()
  }, [])

  const loadPlatformData = async () => {
    try {
      setError(null)
      setLoading(true)

      const [companiesRes, partnersRes, employeesRes, transactionsRes] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('transactions').select('*').limit(50)
      ])

      const companiesData = companiesRes.data || []
      const partnersData = partnersRes.data || []
      const employeesData = employeesRes.data || []
      const transactionsData = transactionsRes.data || []

      // Calculate platform stats
      const totalCompanies = companiesData.length
      const activeCompanies = companiesData.filter(c => c.total_credits > 0).length
      const totalPartners = partnersData.length
      const activePartners = partnersData.filter(p => p.is_active).length
      const totalEmployees = employeesData.length
      const activeEmployees = employeesData.filter(e => e.is_active).length
      const totalTransactions = transactionsData.length

      const platformRevenue = transactionsData
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.points_used * 0.15), 0)

      setPlatformStats({
        totalCompanies,
        activeCompanies,
        totalPartners,
        activePartners,
        totalEmployees,
        activeEmployees,
        totalTransactions,
        platformRevenue: Math.round(platformRevenue),
        monthlyGrowth: 12.5
      })

      setCompanies(companiesData)
      setPartners(partnersData)
      setTransactions(transactionsData)

    } catch (err) {
      console.error('Error loading platform data:', err)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Attivo</Badge>
      case 'suspended':
        return <Badge variant="danger">Sospeso</Badge>
      case 'pending':
        return <Badge variant="warning">In Attesa</Badge>
      case 'approved':
        return <Badge variant="success">Approvato</Badge>
      case 'completed':
        return <Badge variant="success">Completato</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  if (loading) {
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
          <p className="text-gray-600">Controllo piattaforma welfare</p>
        </div>
        <Button onClick={loadPlatformData} variant="secondary" size="sm">
          🔄 Aggiorna
        </Button>
      </div>

      {/* Tab Navigation */}
      <Card>
        <Card.Content>
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'companies', label: '🏢 Aziende' },
              { id: 'partners', label: '🏪 Partner' },
              { id: 'transactions', label: '💳 Transazioni' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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
                    <p className="text-sm font-medium text-gray-600">Aziende</p>
                    <p className="text-2xl font-bold text-blue-600">{platformStats.totalCompanies}</p>
                    <p className="text-xs text-green-600">+{platformStats.monthlyGrowth}% mese</p>
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
                    <p className="text-sm font-medium text-gray-600">Partner</p>
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
                    <p className="text-sm font-medium text-gray-600">Dipendenti</p>
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
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
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

          {/* Quick Stats */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">📊 Statistiche</h3>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Transazioni</span>
                  <span className="font-bold text-blue-600">{platformStats.totalTransactions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Crescita</span>
                  <span className="font-bold text-green-600">+{platformStats.monthlyGrowth}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Sistema</span>
                  <Badge variant="success">🟢 Operativo</Badge>
                </div>
              </div>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Companies Tab */}
      {selectedTab === 'companies' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">🏢 Aziende ({companies.length})</h3>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Crediti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{company.name}</td>
                      <td className="py-3 px-4 text-gray-600">{company.email}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">€{company.total_credits.toLocaleString()}</span>
                        <br />
                        <span className="text-xs text-gray-500">Usati: €{company.used_credits.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(company.subscription_status)}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(company.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
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
            <h3 className="text-lg font-semibold text-gray-900">🏪 Partner ({partners.length})</h3>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Approvazione</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{partner.business_name}</td>
                      <td className="py-3 px-4">{partner.category}</td>
                      <td className="py-3 px-4">{getStatusBadge(partner.is_active ? 'active' : 'suspended')}</td>
                      <td className="py-3 px-4">{getStatusBadge(partner.approval_status)}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Transactions Tab */}
      {selectedTab === 'transactions' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">💳 Transazioni ({transactions.length})</h3>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Commissione</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{transaction.service_name}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{transaction.points_used}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        €{Math.round(transaction.points_used * 0.15)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleString('it-IT')}
          </span>
          <div className="text-sm text-gray-600">
            🎛️ <strong>EasyWelfare Admin</strong> - Platform Control
          </div>
        </div>
      </div>
    </div>
  )
}