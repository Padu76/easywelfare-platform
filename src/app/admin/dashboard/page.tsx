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
  systemHealth: string
}

interface FraudAlert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  risk_score: number
  detected_at: string
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  actions_suggested: string[]
}

interface SecurityMetrics {
  totalAlertsToday: number
  criticalAlerts: number
  falsePositiveRate: number
  avgRiskScore: number
  transactionsBlocked: number
  potentialSavings: number
}

export default function AdminDashboard() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'companies' | 'partners' | 'transactions' | 'security' | 'analytics' | 'settings'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [aiAnalyzing, setAIAnalyzing] = useState(false)

  useEffect(() => {
    loadPlatformData()
    runFraudDetectionAI()
    
    const interval = autoRefresh ? setInterval(() => {
      loadPlatformData()
      runFraudDetectionAI()
    }, 30000) : undefined

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadPlatformData = async () => {
    try {
      setError(null)

      const [companies, partners, employees, transactions] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('transactions').select('*')
      ])

      const totalCompanies = companies.data?.length || 0
      const activeCompanies = companies.data?.filter(c => c.total_credits > 0).length || 0
      const totalPartners = partners.data?.length || 0
      const activePartners = partners.data?.filter(p => p.is_active).length || 0
      const totalEmployees = employees.data?.length || 0
      const activeEmployees = employees.data?.filter(e => e.is_active).length || 0
      const totalTransactions = transactions.data?.length || 0

      const platformRevenue = (transactions.data || [])
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
        monthlyGrowth: 12.5,
        systemHealth: 'excellent'
      })

    } catch (err) {
      console.error('Error loading platform data:', err)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const runFraudDetectionAI = async () => {
    try {
      setAIAnalyzing(true)
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000))

      const alerts: FraudAlert[] = [
        {
          id: 'alert_1',
          type: 'velocity_anomaly',
          severity: 'medium',
          title: 'Volume Transazioni Anomalo',
          description: 'Rilevate 15 transazioni nelle ultime 24h, 50% sopra la media normale.',
          risk_score: 65,
          detected_at: new Date().toISOString(),
          status: 'active',
          actions_suggested: ['Verifica pattern temporali', 'Controlla IP addresses']
        },
        {
          id: 'alert_2',
          type: 'suspicious_pattern',
          severity: 'high',
          title: 'Pattern Comportamentali Sospetti',
          description: '3 transazioni con score di rischio elevato rilevate.',
          risk_score: 85,
          detected_at: new Date().toISOString(),
          status: 'active',
          actions_suggested: ['Blocca transazioni ad alto rischio', 'Contatta dipendenti coinvolti']
        }
      ]

      setFraudAlerts(alerts)

      setSecurityMetrics({
        totalAlertsToday: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        falsePositiveRate: 8.5,
        avgRiskScore: 45.2,
        transactionsBlocked: 2,
        potentialSavings: 1250
      })

    } catch (error) {
      console.error('Error in fraud detection AI:', error)
    } finally {
      setAIAnalyzing(false)
    }
  }

  const handleResolveAlert = (alertId: string) => {
    setFraudAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ))
  }

  const handleInvestigateAlert = (alertId: string) => {
    setFraudAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'investigating' as const }
        : alert
    ))
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger">🚨 Critico</Badge>
      case 'high':
        return <Badge variant="danger">❗ Alto</Badge>
      case 'medium':
        return <Badge variant="secondary">⚠️ Medio</Badge>
      case 'low':
        return <Badge variant="secondary">ℹ️ Basso</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
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
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${aiAnalyzing ? 'bg-purple-500 animate-pulse' : 'bg-purple-300'}`}></div>
            <span className="text-sm text-gray-600">
              🛡️ {aiAnalyzing ? 'AI Analyzing' : 'AI Ready'}
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

      {/* Critical Security Alerts */}
      {fraudAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-bold">ALERT SICUREZZA CRITICO!</h3>
              <p className="text-red-700 text-sm mt-1">
                {fraudAlerts.filter(a => a.severity === 'critical').length} alert critici rilevati. Azione immediata richiesta.
              </p>
            </div>
            <Button 
              variant="danger" 
              onClick={() => setSelectedTab('security')}
            >
              🛡️ Vai a Security
            </Button>
          </div>
        </div>
      )}

      {/* AI Fraud Detection Center */}
      <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-lg p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Fraud Detection Center</h3>
              <p className="text-purple-700 text-sm">Sistema di sicurezza intelligente real-time</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {aiAnalyzing && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-purple-600 text-sm">Analisi AI in corso...</span>
              </div>
            )}
            <Button 
              variant="secondary" 
              onClick={runFraudDetectionAI}
              disabled={aiAnalyzing}
            >
              🔍 Scan Completo
            </Button>
          </div>
        </div>

        {/* Security Metrics */}
        {securityMetrics && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Alert Oggi</p>
              <p className="text-xl font-bold text-red-600">{securityMetrics.totalAlertsToday}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Critici</p>
              <p className="text-xl font-bold text-red-700">{securityMetrics.criticalAlerts}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Risk Score Avg</p>
              <p className="text-xl font-bold text-yellow-600">{securityMetrics.avgRiskScore.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Bloccate</p>
              <p className="text-xl font-bold text-green-600">{securityMetrics.transactionsBlocked}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">False Positive</p>
              <p className="text-xl font-bold text-blue-600">{securityMetrics.falsePositiveRate}%</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Risparmi</p>
              <p className="text-xl font-bold text-purple-600">€{securityMetrics.potentialSavings}</p>
            </div>
          </div>
        )}

        {/* Priority Alerts */}
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">🚨 Alert Prioritari</h4>
          <div className="space-y-2">
            {fraudAlerts.filter(a => a.status === 'active').slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900">{alert.title}</h5>
                    {getSeverityBadge(alert.severity)}
                    <span className="text-sm font-bold text-purple-600">Score: {alert.risk_score}</span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleInvestigateAlert(alert.id)}
                  >
                    🔍 Investiga
                  </Button>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    ✅ Risolvi
                  </Button>
                </div>
              </div>
            ))}
            {fraudAlerts.filter(a => a.status === 'active').length === 0 && (
              <div className="text-center py-4 text-green-700">
                <span className="text-2xl block mb-2">✅</span>
                <p className="font-medium">Nessun alert attivo - Sistema sicuro</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <Card.Content>
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'companies', label: '🏢 Aziende' },
              { id: 'partners', label: '🏪 Partner' },
              { id: 'transactions', label: '💳 Transazioni Live' },
              { id: 'security', label: '🛡️ AI Security', badge: fraudAlerts.filter(a => a.status === 'active').length },
              { id: 'analytics', label: '📈 Analytics' },
              { id: 'settings', label: '⚙️ Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors relative ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
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

          {/* Quick Stats */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">📊 Statistiche Rapide</h3>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Transazioni Totali</span>
                  <span className="font-bold text-blue-600">{platformStats.totalTransactions.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Crescita Mensile</span>
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
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">🛡️ AI Security Active</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            🎛️ <strong>EasyWelfare Admin v2.0</strong> - AI-Powered Platform Control
          </div>
        </div>
      </div>
    </div>
  )
}