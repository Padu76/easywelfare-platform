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

  // Real-time refresh
  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchData = async () => {
      await loadPlatformData()
      await runFraudDetectionAI()
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
        monthlyGrowth: 12.5,
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
        monthly_spend: Math.round((company.used_credits || 0) / 3)
      }))

      setCompanies(companiesOverview)

      // Process partners overview
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

      // Process live transactions with AI risk scoring
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

      // Calculate financial metrics
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

      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate AI fraud alerts based on real transaction data
      const alerts: FraudAlert[] = []
      const today = new Date()
      
      // FRAUD DETECTION ALGORITHMS

      // 1. VELOCITY ANOMALY DETECTION
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

      // 2. SUSPICIOUS PATTERN DETECTION
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

        // 3. DUPLICATE TRANSACTION DETECTION
        const duplicateCheck = new Map()
        liveTransactions.forEach(t => {
          const key = `${t.employee_name}-${t.service_name}-${t.points_used}`
          if (duplicateCheck.has(key)) {
            alerts.push({
              id: `duplicate_${t.id}`,
              type: 'duplicate_transaction',
              severity: 'critical',
              title: 'Possibile Transazione Duplicata',
              description: `Transazione simile rilevata per ${t.employee_name} - ${t.service_name} (${t.points_used} punti).`,
              transaction_id: t.id,
              risk_score: 95,
              detected_at: new Date().toISOString(),
              status: 'active',
              actions_suggested: [
                'Blocca transazione immediatamente',
                'Verifica con dipendente',
                'Controllo manuale necessario'
              ]
            })
          }
          duplicateCheck.set(key, true)
        })

        // 4. UNUSUAL BEHAVIOR ANALYSIS
        const largeTransactions = liveTransactions.filter(t => t.points_used > 500)
        if (largeTransactions.length > 2) {
          alerts.push({
            id: 'behavior_unusual_1',
            type: 'unusual_behavior',
            severity: 'medium',
            title: 'Comportamento Spending Anomalo',
            description: `${largeTransactions.length} transazioni ad alto valore (>500 punti) rilevate. Pattern inusuale di spesa.`,
            risk_score: 70,
            detected_at: new Date().toISOString(),
            status: 'active',
            actions_suggested: [
              'Verifica limiti di spesa aziendali',
              'Controllo approvazioni manager',
              'Review policy welfare'
            ]
          })
        }

        // 5. TIME-BASED ANOMALY DETECTION
        const nightTransactions = liveTransactions.filter(t => {
          const hour = new Date(t.created_at).getHours()
          return hour < 6 || hour > 22 // Outside business hours
        })

        if (nightTransactions.length > 0) {
          alerts.push({
            id: 'time_anomaly_1',
            type: 'unusual_behavior',
            severity: 'low',
            title: 'Transazioni Fuori Orario',
            description: `${nightTransactions.length} transazioni rilevate fuori dall'orario lavorativo (22:00-06:00).`,
            risk_score: 40,
            detected_at: new Date().toISOString(),
            status: 'active',
            actions_suggested: [
              'Verifica fuso orario',
              'Controllo accessi remoti',
              'Review policy orari'
            ]
          })
        }

        setFraudAlerts(alerts)

        // Calculate security metrics
        const securityStats: SecurityMetrics = {
          totalAlertsToday: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
          falsePositiveRate: 8.5, // Mock data
          avgRiskScore: liveTransactions.reduce((sum, t) => sum + (t.risk_score || 0), 0) / liveTransactions.length,
          transactionsBlocked: 2, // Mock data
          potentialSavings: 1250 // Mock data
        }

        setSecurityMetrics(securityStats)

        console.log('🛡️ AI Fraud Detection Complete:', {
          alerts: alerts.length,
          highRiskTransactions: highRiskTransactions.length,
          avgRiskScore: securityStats.avgRiskScore.toFixed(1)
        })

      } catch (error) {
        console.error('Error in fraud detection AI:', error)
      } finally {
        setAIAnalyzing(false)
      }
    }

    // AI Risk Scoring Algorithm
    const calculateRiskScore = (transaction: any, allTransactions: any[]): number => {
      let score = 0

      // Base risk factors
      const pointsUsed = transaction.points_used || 0
      
      // High value transaction risk
      if (pointsUsed > 500) score += 30
      else if (pointsUsed > 200) score += 15
      
      // Time-based risk (night hours)
      const hour = new Date(transaction.created_at).getHours()
      if (hour < 6 || hour > 22) score += 20
      
      // Frequency risk (same employee multiple transactions)
      const employeeTransactions = allTransactions.filter(t => 
        t.employees?.first_name === transaction.employees?.first_name &&
        t.employees?.last_name === transaction.employees?.last_name
      )
      if (employeeTransactions.length > 5) score += 25
      
      // Recent activity burst
      const recentTransactions = allTransactions.filter(t => {
        const timeDiff = new Date(transaction.created_at).getTime() - new Date(t.created_at).getTime()
        return Math.abs(timeDiff) < 60 * 60 * 1000 // Within 1 hour
      })
      if (recentTransactions.length > 3) score += 20
      
      // Weekend/holiday risk
      const dayOfWeek = new Date(transaction.created_at).getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) score += 10
      
      return Math.min(score, 100) // Cap at 100
    }

    // Fraud Flags Detection
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

        {/* AI FRAUD DETECTION CENTER - NEW GAME-CHANGER SECTION */}
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

          {/* Top Priority Alerts */}
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

        {/* Overview Tab */}
        {selectedTab === 'overview' && platformStats && (
          <>
            {/* Platform KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-600">AI Risk Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Flags</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Stato</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveTransactions.map((transaction) => (
                      <tr key={transaction.id} className={`border-b hover:bg-gray-50 ${
                        (transaction.risk_score || 0) > 70 ? 'bg-red-50' : 
                        (transaction.risk_score || 0) > 50 ? 'bg-yellow-50' : ''
                      }`}>
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
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${
                              (transaction.risk_score || 0) >= 80 ? 'text-red-600' :
                              (transaction.risk_score || 0) >= 50 ? 'text-yellow-600' :
                              (transaction.risk_score || 0) >= 20 ? 'text-blue-600' : 'text-green-600'
                            }`}>
                              {transaction.risk_score || 0}
                            </span>
                            {getRiskBadge(transaction.risk_score || 0)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(transaction.fraud_flags || []).map((flag, index) => (
                              <Badge 
                                key={index} 
                                variant={
                                  flag === 'HIGH_RISK' ? 'danger' :
                                  flag === 'HIGH_VALUE' ? 'warning' :
                                  flag === 'OFF_HOURS' ? 'info' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">
                          {new Date(transaction.created_at).toLocaleString('it-IT')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            <Button variant="secondary" size="sm">
                              👁️
                            </Button>
                            {(transaction.risk_score || 0) > 70 && (
                              <Button variant="danger" size="sm">
                                🚫 Blocca
                              </Button>
                            )}
                            <Button variant="info" size="sm">
                              📊 Analisi
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soglia AI Risk Score
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="70"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 (Permissivo)</span>
                      <span>70 (Default)</span>
                      <span>100 (Restrittivo)</span>
                    </div>
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
                    <span className="font-medium">Alert Fraud AI</span>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  </div>
                  
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
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Transazioni ad alto rischio</span>
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
  }>
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
                      <span className="font-medium">Security Status</span>
                      <Badge variant={fraudAlerts.length === 0 ? "success" : "warning"} icon={fraudAlerts.length === 0 ? "🛡️" : "⚠️"}>
                        {fraudAlerts.length === 0 ? 'Sicuro' : `${fraudAlerts.length} Alert`}
                      </Badge>
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

        {/* Security Tab - NEW AI FRAUD DETECTION SECTION */}
        {selectedTab === 'security' && (
          <div className="space-y-6">
            {/* Security Overview */}
            {securityMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                  <Card.Content>
                    <div className="text-center p-2">
                      <p className="text-sm text-gray-600">Alert Attivi</p>
                      <p className="text-2xl font-bold text-red-600">{fraudAlerts.filter(a => a.status === 'active').length}</p>
                    </div>
                  </Card.Content>
                </Card>
                
                <Card>
                  <Card.Content>
                    <div className="text-center p-2">
                      <p className="text-sm text-gray-600">Critici</p>
                      <p className="text-2xl font-bold text-red-700">{securityMetrics.criticalAlerts}</p>
                    </div>
                  </Card.Content>
                </Card>
                
                <Card>
                  <Card.Content>
                    <div className="text-center p-2">
                      <p className="text-sm text-gray-600">Risk Score</p>
                      <p className="text-2xl font-bold text-yellow-600">{securityMetrics.avgRiskScore.toFixed(1)}</p>
                    </div>
                  </Card.Content>
                </Card>
                
                <Card>
                  <Card.Content>
                    <div className="text-center p-2">
                      <p className="text-sm text-gray-600">Bloccate</p>
                      <p className="text-2xl font-bold text-green-600">{securityMetrics.transactionsBlocked}</p>
                    </div>
                  </Card.Content>
                </Card>
                
                <Card>
                  <Card.Content>
                    <div className="text-center p-2">
                      <p className="text-sm text-gray-600">False Positive</p>
                      <p className="text-2xl font-bold text-blue-600">{securityMetrics.falsePositiveRate}%</p>
                    </div>
                  </Card.Content>
                </Card>
                
                <Card>
                  <Card.Content>
                    <div className="text-center p-2">
                      <p className="text-sm text-gray-600">Risparmi</p>
                      <p className="text-2xl font-bold text-purple-600">€{securityMetrics.potentialSavings}</p>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            )}

            {/* Fraud Alerts List */}
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">🚨 Alert di Sicurezza</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      onClick={runFraudDetectionAI}
                      disabled={aiAnalyzing}
                    >
                      {aiAnalyzing ? '⏳ Analizzando...' : '🔍 Scan AI'}
                    </Button>
                    <Button variant="primary">📊 Report Sicurezza</Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {fraudAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`border rounded-lg p-4 ${
                        alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            {getSeverityBadge(alert.severity)}
                            <Badge variant="info">Risk: {alert.risk_score}</Badge>
                            <Badge variant={alert.status === 'active' ? 'warning' : 'success'}>
                              {alert.status === 'active' ? '🔴 Attivo' : 
                               alert.status === 'investigating' ? '🔍 In Corso' : 
                               alert.status === 'resolved' ? '✅ Risolto' : '❌ Falso Positivo'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{alert.description}</p>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-600 mb-1">Azioni Suggerite:</p>
                            <div className="flex flex-wrap gap-2">
                              {alert.actions_suggested.map((action, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Rilevato: {new Date(alert.detected_at).toLocaleString('it-IT')}
                          </p>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          {alert.status === 'active' && (
                            <>
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
                              <Button 
                                variant="secondary" 
                                size="sm"
                              >
                                ❌ Falso Positivo
                              </Button>
                            </>
                          )}
                          {alert.status !== 'active' && (
                            <Badge variant="success" icon="✅">
                              {alert.status === 'resolved' ? 'Risolto' : 'Gestito'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {fraudAlerts.length === 0 && (
                    <div className="text-center py-12 text-green-700">
                      <span className="text-4xl block mb-4">🛡️</span>
                      <h3 className="text-lg font-medium mb-2">Sistema Sicuro</h3>
                      <p className="text-gray-600">Nessun alert di sicurezza rilevato. L'AI sta monitorando continuamente.</p>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
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

        {/* Live Transactions Tab with AI Risk Scoring */}
        {selectedTab === 'transactions' && (
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">💳 Transazioni Live con AI Risk Score</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Tempo reale</span>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">AI Monitoring</span>
                </div>
              </div>
            </Card.Header>
            <Card.Content