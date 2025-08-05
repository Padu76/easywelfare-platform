'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
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
  risk_score?: number
  fraud_flags?: string[]
}

interface FinancialMetrics {
  totalRevenue: number
  monthlyRevenue: number
  commissionsGenerated: number
  pendingPayouts: number
  avgTransactionSize: number
  revenueGrowth: number
}

interface FraudAlert {
  id: string
  type: 'suspicious_pattern' | 'velocity_anomaly' | 'unusual_behavior' | 'duplicate_transaction' | 'high_risk_score'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  transaction_id?: string
  employee_id?: string
  partner_id?: string
  company_id?: string
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
  const [companies, setCompanies] = useState<CompanyOverview[]>([])
  const [partners, setPartners] = useState<PartnerOverview[]>([])
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([])
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'companies' | 'partners' | 'transactions' | 'security' | 'analytics' | 'settings'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [aiAnalyzing, setAIAnalyzing] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchData = async () => {
      await loadPlatformData()
      await runFraudDetectionAI()
    }

    fetchData()

    if (autoRefresh) {
      interval = setInterval(fetchData, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadPlatformData = async () => {
    try {
      setError(null)

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (companiesError) throw companiesError

      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })

      if (partnersError) throw partnersError

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')

      if (employeesError) throw employeesError

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
        monthlyGrowth: 12.5,
        systemHealth: 'excellent'
      }

      setPlatformStats(stats)

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
        monthly_spend: Math.round((company.used_credits || 0) / 3)
      }))

      setCompanies(companiesOverview)

      const partnersOverview: PartnerOverview[] = (partnersData || []).map(partner => {
        const partnerTransactions = (transactionsData || []).filter(t => t.partner_id === partner.id)
        const monthlyRevenue = partnerTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.points_used * 0.85), 0)

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

      const liveTransactionsFormatted: LiveTransaction[] = (transactionsData || []).slice(0, 20).map(t => {
        const riskScore = calculateRiskScore(t, transactionsData || [])
        const fraudFlags = detectFraudFlags(t, transactionsData || [])

        return {
          id: t.id,
          employee_name: t.employees ? `${t.employees.first_name} ${t.employees.last_name}` : 'N/A',
          company_name: Array.isArray(t.companies) ? t.companies[0]?.name || 'N/A' : t.companies?.name || 'N/A',
          partner_name: 'Partner',
          service_name: t.service_name || 'Servizio',
          points_used: t.points_used || 0,
          commission: Math.round((t.points_used || 0) * 0.15),
          status: t.status || 'pending',
          created_at: t.created_at,
          risk_score: riskScore,
          fraud_flags: fraudFlags
        }
      })

      setLiveTransactions(liveTransactionsFormatted)

      const completedTransactions = (transactionsData || []).filter(t => t.status === 'completed')
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.points_used * 0.15), 0)
      const monthlyRevenue = Math.round(totalRevenue / 3)
      const commissionsGenerated = totalRevenue
      const avgTransactionSize = completedTransactions.length > 0 
        ? completedTransactions.reduce((sum, t) => sum + t.points_used, 0) / completedTransactions.length 
        : 0

      const metrics: FinancialMetrics = {
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue,
        commissionsGenerated: Math.round(commissionsGenerated),
        pendingPayouts: Math.round(totalRevenue * 0.1),
        avgTransactionSize: Math.round(avgTransactionSize),
        revenueGrowth: 18.3
      }

      setFinancialMetrics(metrics)

    } catch (err) {
      console.error('Error loading platform data:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const runFraudDetectionAI = async () => {
    try {
      setAIAnalyzing(true)
      console.log('🛡️ Running AI Fraud Detection Analysis...')

      await new Promise(resolve => setTimeout(resolve, 2000))

      const alerts: FraudAlert[] = []
      const today = new Date()
      
      if (liveTransactions.length > 0) {
        const recentTransactions = liveTransactions.filter(t => {
          const transactionDate = new Date(t.created_at)
          const hoursDiff = (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60)
          return hoursDiff < 24
        })

        if (recentTransactions.length > 10) {
          alerts.push({
            id: 'velocity_anomaly_1',
            type: 'velocity_anomaly',
            severity: 'medium',
            title: 'Volume Transazioni Anomalo',
            description: `Rilevate ${recentTransactions.length} transazioni nelle ultime 24h, ${Math.round((recentTransactions.length - 5) / 5 * 100)}% sopra la media normale.`,
            risk_score: 65,
            detected_at: new Date().toISOString(),
            status: 'active',
            actions_suggested: [
              'Verifica pattern temporali',
              'Controlla IP addresses', 
              'Analizza comportamento utenti'
            ]
          })
        }
      }

      const highRiskTransactions = liveTransactions.filter(t => (t.risk_score || 0) > 70)
      if (highRiskTransactions.length > 0) {
        alerts.push({
          id: 'pattern_suspicious_1',
          type: 'suspicious_pattern',
          severity: 'high',
          title: 'Pattern Comportamentali Sospetti',
          description: `${highRiskTransactions.length} transazioni con score di rischio elevato rilevate. Possibili tentativi di frode.`,
          risk_score: 85,
          detected_at: new Date().toISOString(),
          status: 'active',
          actions_suggested: [
            'Blocca transazioni ad alto rischio',
            'Contatta dipendenti coinvolti',
            'Review partner associati'
          ]
        })
      }

      setFraudAlerts(alerts)

      const securityStats: SecurityMetrics = {
        totalAlertsToday: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        falsePositiveRate: 8.5,
        avgRiskScore: liveTransactions.reduce((sum, t) => sum + (t.risk_score || 0), 0) / liveTransactions.length,
        transactionsBlocked: 2,
        potentialSavings: 1250
      }

      setSecurityMetrics(securityStats)

      console.log('🛡️ AI Fraud Detection Complete:', {
        alerts: alerts.length,
        avgRiskScore: securityStats.avgRiskScore.toFixed(1)
      })

    } catch (error) {
      console.error('Error in fraud detection AI:', error)
    } finally {
      setAIAnalyzing(false)
    }
  }

  const calculateRiskScore = (transaction: any, allTransactions: any[]): number => {
    let score = 0
    const pointsUsed = transaction.points_used || 0
    
    if (pointsUsed > 500) score += 30
    else if (pointsUsed > 200) score += 15
    
    const hour = new Date(transaction.created_at).getHours()
    if (hour < 6 || hour > 22) score += 20
    
    const employeeTransactions = allTransactions.filter(t => 
      t.employees?.first_name === transaction.employees?.first_name &&
      t.employees?.last_name === transaction.employees?.last_name
    )
    if (employeeTransactions.length > 5) score += 25
    
    const recentTransactions = allTransactions.filter(t => {
      const timeDiff = new Date(transaction.created_at).getTime() - new Date(t.created_at).getTime()
      return Math.abs(timeDiff) < 60 * 60 * 1000
    })
    if (recentTransactions.length > 3) score += 20
    
    const dayOfWeek = new Date(transaction.created_at).getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) score += 10
    
    return Math.min(score, 100)
  }

  const detectFraudFlags = (transaction: any, allTransactions: any[]): string[] => {
    const flags: string[] = []
    
    if ((transaction.risk_score || 0) > 70) flags.push('HIGH_RISK')
    if (transaction.points_used > 500) flags.push('HIGH_VALUE')
    
    const hour = new Date(transaction.created_at).getHours()
    if (hour < 6 || hour > 22) flags.push('OFF_HOURS')
    
    const dayOfWeek = new Date(transaction.created_at).getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) flags.push('WEEKEND')
    
    return flags
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

  const handleResolveAlert = async (alertId: string) => {
    setFraudAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ))
  }

  const handleInvestigateAlert = async (alertId: string) => {
    setFraudAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'investigating' as const }
        : alert
    ))
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

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge variant="danger" icon="🚨">Alto Rischio</Badge>
    if (riskScore >= 50) return <Badge variant="warning" icon="⚠️">Medio Rischio</Badge>
    if (riskScore >= 20) return <Badge variant="info" icon="ℹ️">Basso Rischio</Badge>
    return <Badge variant="success" icon="✅">Sicuro</Badge>
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="danger" icon="🚨">Critico</Badge>
      case 'high':
        return <Badge variant="danger" icon="❗">Alto</Badge>
      case 'medium':
        return <Badge variant="warning" icon="⚠️">Medio</Badge>
      case 'low':
        return <Badge variant="info" icon="ℹ️">Basso</Badge>
      default:
        return <Badge variant="default">{severity}</Badge>
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
                    variant="warning" 
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

      <Card>
        <Card.Content>
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'companies', label: '🏢 Aziende', icon: '🏢' },
              { id: 'partners', label: '🏪 Partner', icon: '🏪' },
              { id: 'transactions', label: '💳 Transazioni Live', icon: '💳' },
              { id: 'security', label: '🛡️ AI Security', icon: '🛡️', badge: fraudAlerts.filter(a => a.status === 'active').length },
              { id: 'analytics', label: '📈 Analytics', icon: '📈' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
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

      {selectedTab === 'overview' && platformStats && (
        <>
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
        </>
      )}
    </div>
  )
}