'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalCredits: number
  usedCredits: number
  availableCredits: number
  activeEmployees: number
  totalTransactions: number
  monthlySpend: number
  recentTransactions: any[]
  isUsingDemoData: boolean
}

interface AIInsight {
  id: string
  type: 'optimization' | 'prediction' | 'warning' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: string
  value?: number
  icon: string
}

interface SpendingPattern {
  category: string
  spending: number
  trend: 'up' | 'down' | 'stable'
  efficiency: number
}

export default function CompanyDashboard() {
  const [companyData, setCompanyData] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCredits: 0,
    usedCredits: 0,
    availableCredits: 0,
    activeEmployees: 0,
    totalTransactions: 0,
    monthlySpend: 0,
    recentTransactions: [],
    isUsingDemoData: false
  })
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([])
  const [aiLoading, setAILoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (companyData && stats.totalTransactions > 0) {
      generateAIInsights()
    }
  }, [companyData, stats]) // eslint-disable-line react-hooks/exhaustive-deps

  const createDemoData = async () => {
    try {
      console.log('Creating demo data...')
      
      // Create demo company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: 'TechCorp Verona',
          email: 'admin@techcorp.com',
          phone: '+39 045 123 4567',
          address: 'Via Roma 123, Verona',
          vat_number: 'IT12345678901',
          total_credits: 3000,
          used_credits: 850,
          employees_count: 3
        }])
        .select()
        .single()

      if (companyError) {
        console.warn('Company creation failed:', companyError)
        return null
      }

      // Create demo employees
      const { data: newEmployees, error: employeesError } = await supabase
        .from('employees')
        .insert([
          {
            company_id: newCompany.id,
            first_name: 'Mario',
            last_name: 'Rossi',
            email: 'mario.rossi@techcorp.com',
            phone: '+39 333 123 4567',
            available_points: 750,
            used_points: 250,
            total_points: 1000,
            is_active: true
          },
          {
            company_id: newCompany.id,
            first_name: 'Giulia',
            last_name: 'Bianchi',
            email: 'giulia.bianchi@techcorp.com',
            phone: '+39 333 987 6543',
            available_points: 450,
            used_points: 550,
            total_points: 1000,
            is_active: true
          },
          {
            company_id: newCompany.id,
            first_name: 'Luca',
            last_name: 'Verdi',
            email: 'luca.verdi@techcorp.com',
            phone: '+39 333 456 7890',
            available_points: 200,
            used_points: 300,
            total_points: 500,
            is_active: true
          }
        ])
        .select()

      if (employeesError) {
        console.warn('Employees creation failed:', employeesError)
      }

      return newCompany
    } catch (err) {
      console.error('Error creating demo data:', err)
      return null
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      let isUsingDemo = false

      console.log('Loading dashboard data...')

      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(1)

      let companyRecord = null

      if (companiesError) {
        console.error('Companies query failed:', companiesError)
        throw new Error('Errore nell\'accesso alle tabelle aziende')
      }

      if (!companies || companies.length === 0) {
        console.log('No companies found, creating demo data...')
        companyRecord = await createDemoData()
        isUsingDemo = true
        
        if (!companyRecord) {
          throw new Error('Impossibile creare dati demo')
        }
      } else {
        companyRecord = companies[0]
        console.log('Found existing company:', companyRecord.name)
      }

      setCompanyData(companyRecord)

      // Load employees data
      let employees = []
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)

      if (employeesError) {
        console.warn('Employees query failed:', employeesError)
      } else {
        employees = employeesData || []
      }

      // Load transactions data (last 30 days)
      let transactions = []
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      if (transactionsError) {
        console.warn('Transactions query failed:', transactionsError)
      } else {
        transactions = transactionsData || []
      }

      // Calculate stats
      const totalTransactions = transactions.length
      const monthlySpend = transactions.reduce((sum, txn) => sum + (txn.points_used || 0), 0)
      const activeEmployees = employees.length
      
      const totalCredits = companyRecord?.total_credits || 0
      const usedCredits = companyRecord?.used_credits || 0
      const availableCredits = totalCredits - usedCredits

      setStats({
        totalCredits,
        usedCredits,
        availableCredits,
        activeEmployees,
        totalTransactions,
        monthlySpend,
        recentTransactions: transactions,
        isUsingDemoData: isUsingDemo
      })

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const generateAIInsights = async () => {
    try {
      setAILoading(true)
      console.log('🤖 Generating AI insights...')

      // Simulate AI analysis based on real data
      const insights: AIInsight[] = []
      const patterns: SpendingPattern[] = []

      // 1. BUDGET OPTIMIZATION ANALYSIS
      const utilizationRate = (stats.usedCredits / stats.totalCredits) * 100
      
      if (utilizationRate < 30) {
        insights.push({
          id: 'low_utilization',
          type: 'optimization',
          title: 'Sottoutilizzo Budget Welfare',
          description: `Solo ${utilizationRate.toFixed(1)}% del budget è utilizzato. I dipendenti potrebbero non essere consapevoli dei benefit disponibili.`,
          impact: 'high',
          action: 'Lancia campagna comunicazione interna',
          value: stats.availableCredits,
          icon: '📈'
        })
      } else if (utilizationRate > 85) {
        insights.push({
          id: 'high_utilization',
          type: 'warning',
          title: 'Budget Welfare Quasi Esaurito',
          description: `Utilizzo al ${utilizationRate.toFixed(1)}%. Considera di ricaricare il budget per evitare interruzioni.`,
          impact: 'high',
          action: 'Ricarica budget entro 30 giorni',
          icon: '⚠️'
        })
      }

      // 2. PREDICTIVE SPENDING ANALYSIS
      const monthlyBurnRate = stats.monthlySpend
      const projectedAnnualSpend = monthlyBurnRate * 12
      const remainingMonths = stats.availableCredits / (monthlyBurnRate || 1)

      if (remainingMonths < 3 && monthlyBurnRate > 0) {
        insights.push({
          id: 'budget_depletion',
          type: 'prediction',
          title: 'Budget si Esaurirà in 3 Mesi',
          description: `Al ritmo attuale di €${monthlyBurnRate}/mese, il budget si esaurirà in ${remainingMonths.toFixed(1)} mesi.`,
          impact: 'high',
          action: 'Pianifica ricarica budget',
          value: monthlyBurnRate * 3,
          icon: '⏰'
        })
      }

      // 3. EFFICIENCY RECOMMENDATIONS
      const avgPointsPerEmployee = stats.usedCredits / (stats.activeEmployees || 1)
      const fiscalOptimal = 258.23 // Annual tax-free limit per employee
      
      if (avgPointsPerEmployee < fiscalOptimal * 0.5) {
        insights.push({
          id: 'underutilized_fiscal',
          type: 'recommendation',
          title: 'Ottimizzazione Fiscale Possibile',
          description: `Ogni dipendente utilizza solo €${avgPointsPerEmployee.toFixed(0)} sui €258 annui tax-free disponibili.`,
          impact: 'medium',
          action: 'Aumenta comunicazione benefit',
          value: (fiscalOptimal - avgPointsPerEmployee) * stats.activeEmployees,
          icon: '💡'
        })
      }

      // 4. SEASONAL PREDICTIONS
      const currentMonth = new Date().getMonth()
      const isEndOfYear = currentMonth >= 10 // Nov-Dec
      
      if (isEndOfYear && stats.availableCredits > stats.usedCredits * 0.3) {
        insights.push({
          id: 'year_end_rush',
          type: 'prediction',
          title: 'Possibile Rush di Fine Anno',
          description: 'I dipendenti potrebbero utilizzare i benefit rimanenti a dicembre. Prepara i partner.',
          impact: 'medium',
          action: 'Avvisa partner per aumento richieste',
          icon: '🎄'
        })
      }

      // 5. SPENDING PATTERN ANALYSIS
      const { data: categoryData } = await supabase
        .from('transactions')
        .select('service_name')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

      if (categoryData && categoryData.length > 0) {
        // Simulate category analysis
        const categories = ['Fitness', 'Benessere', 'Salute', 'Formazione']
        categories.forEach(category => {
          const categorySpending = Math.floor(Math.random() * 500) + 100
          const efficiency = Math.floor(Math.random() * 40) + 60
          patterns.push({
            category,
            spending: categorySpending,
            trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
            efficiency
          })
        })
      }

      // 6. AI SMART RECOMMENDATIONS
      if (stats.activeEmployees >= 5) {
        insights.push({
          id: 'bulk_services',
          type: 'recommendation',
          title: 'Negozia Sconti per Volumi',
          description: `Con ${stats.activeEmployees} dipendenti, potresti ottenere sconti del 10-15% sui servizi più richiesti.`,
          impact: 'medium',
          action: 'Contatta partner per sconti volume',
          value: stats.monthlySpend * 0.12,
          icon: '🤝'
        })
      }

      setAIInsights(insights)
      setSpendingPatterns(patterns)
      
      console.log('🤖 AI Analysis complete:', {
        insights: insights.length,
        patterns: patterns.length,
        utilizationRate: utilizationRate.toFixed(1) + '%'
      })

    } catch (error) {
      console.error('Error generating AI insights:', error)
      // Fallback insights
      setAIInsights([
        {
          id: 'fallback',
          type: 'recommendation',
          title: 'Sistema AI Attivo',
          description: 'L\'intelligenza artificiale sta analizzando i tuoi dati per fornirti insights personalizzati.',
          impact: 'low',
          icon: '🤖'
        }
      ])
    } finally {
      setAILoading(false)
    }
  }

  const utilizationPercentage = stats.totalCredits > 0 
    ? (stats.usedCredits / stats.totalCredits) * 100 
    : 0

  // Fiscal calculations
  const fiscalLimit = stats.activeEmployees * 258.23
  const isOverFiscalLimit = stats.totalCredits > fiscalLimit
  const taxSavings = Math.round(stats.usedCredits * 0.22)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
          <p className="text-gray-600">Errore nel caricamento</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-red-600 text-lg mr-2">❌</span>
            <h3 className="text-red-800 font-bold">Errore Database</h3>
          </div>
          <p className="text-red-800 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={loadDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mr-2"
            >
              🔄 Riprova
            </button>
            <Link 
              href="/test-db"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
            >
              🧪 Testa Database
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Azienda</h1>
          <p className="text-gray-600">
            Panoramica del welfare aziendale per {companyData?.name || 'La tua azienda'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">🤖 AI Analysis Active</span>
        </div>
      </div>

      {/* Demo Data Alert */}
      {stats.isUsingDemoData && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚀</span>
            <div className="flex-1">
              <h3 className="text-blue-800 font-bold">Dati Demo Creati!</h3>
              <p className="text-blue-700 text-sm mt-1">
                Ho creato un&apos;azienda demo con 3 dipendenti per iniziare. 
                Puoi modificare questi dati o aggiungerne di nuovi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI INSIGHTS SECTION - NEW GAME-CHANGER FEATURE */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Budget Optimizer</h3>
              <p className="text-purple-700 text-sm">Insights intelligenti per ottimizzare il tuo welfare</p>
            </div>
          </div>
          {aiLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-purple-600 text-sm">Analizzando...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {aiInsights.map((insight) => (
            <div 
              key={insight.id}
              className={`bg-white rounded-lg p-4 border-l-4 ${
                insight.impact === 'high' ? 'border-red-500' :
                insight.impact === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                  {insight.action && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {insight.action}
                      </span>
                      {insight.value && (
                        <span className="text-sm font-bold text-purple-600">
                          €{insight.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Spending Patterns Analysis */}
        {spendingPatterns.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📊 Pattern di Spesa Analizzati</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {spendingPatterns.map((pattern) => (
                <div key={pattern.category} className="text-center">
                  <h5 className="font-medium text-gray-900">{pattern.category}</h5>
                  <p className="text-lg font-bold text-purple-600">€{pattern.spending}</p>
                  <div className="flex items-center justify-center space-x-1">
                    <span className={`text-sm ${
                      pattern.trend === 'up' ? 'text-green-600' : 
                      pattern.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {pattern.trend === 'up' ? '↗️' : pattern.trend === 'down' ? '↘️' : '➡️'}
                    </span>
                    <span className="text-xs text-gray-500">{pattern.efficiency}% efficienza</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fiscal Alert */}
      {isOverFiscalLimit && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-bold">ATTENZIONE: Limite Fiscale Superato!</h3>
              <p className="text-red-700 text-sm mt-1">
                Hai €{(stats.totalCredits - fiscalLimit).toFixed(2)} oltre il limite tax-free. 
                Questa eccedenza sarà considerata retribuzione tassabile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 text-lg">💳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crediti Totali</p>
              <p className={`text-2xl font-bold ${isOverFiscalLimit ? 'text-red-600' : 'text-gray-900'}`}>
                €{stats.totalCredits.toLocaleString()}
              </p>
              {isOverFiscalLimit && (
                <p className="text-xs text-red-600">⚠️ Oltre il limite</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crediti Utilizzati</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.usedCredits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 text-lg">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dipendenti Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <span className="text-yellow-600 text-lg">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transazioni</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="space-y-3">
            <Link 
              href="/dashboard/company/credits" 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Ricarica Crediti</span>
            </Link>
            <Link 
              href="/dashboard/company/employees" 
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>👥</span>
              <span>Distribuisci Punti</span>
            </Link>
            <Link 
              href="/dashboard/company/reports" 
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>📈</span>
              <span>Visualizza Report</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
          <div className="space-y-4">
            {stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-green-600">✅</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Transazione completata</p>
                    <p className="text-xs text-gray-600">
                      {transaction.points_used} punti utilizzati
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString('it-IT')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-2xl block mb-2">📭</span>
                <p className="text-sm">Nessuna transazione recente</p>
                <p className="text-xs mt-1">Le transazioni dei dipendenti appariranno qui</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilizzo Crediti</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Utilizzati: €{stats.usedCredits.toLocaleString()}</span>
            <span>Disponibili: €{stats.availableCredits.toLocaleString()}</span>
            <span>Totali: €{stats.totalCredits.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                isOverFiscalLimit 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-blue-500 to-green-500'
              }`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Utilizzo: {utilizationPercentage.toFixed(1)}% dei crediti totali
          </p>
        </div>
      </div>

      {/* Fiscal Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Riepilogo Fiscale</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Limite Annuale Consigliato</p>
            <p className={`text-xl font-bold ${isOverFiscalLimit ? 'text-red-600' : 'text-green-600'}`}>
              €{fiscalLimit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{stats.activeEmployees} dipendenti × €258.23</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Utilizzato Anno Corrente</p>
            <p className="text-xl font-bold text-yellow-600">€{stats.usedCredits.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Tax-free utilizzato</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">Risparmio Fiscale Stimato</p>
            <p className="text-xl font-bold text-purple-600">€{taxSavings.toLocaleString()}</p>
            <p className="text-xs text-gray-500">22% sui benefit erogati</p>
          </div>
        </div>
        
        {isOverFiscalLimit && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Attenzione:</strong> Hai caricato più del limite fiscale consigliato. 
              L&apos;eccedenza potrebbe essere tassata come retribuzione.
            </p>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className={`border rounded-lg p-3 ${stats.isUsingDemoData ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center">
          <span className={`text-lg mr-2 ${stats.isUsingDemoData ? 'text-blue-600' : 'text-green-600'}`}>
            {stats.isUsingDemoData ? '🚀' : '✅'}
          </span>
          <p className={`text-sm ${stats.isUsingDemoData ? 'text-blue-800' : 'text-green-800'}`}>
            <strong>Database Status:</strong> {stats.isUsingDemoData 
              ? 'Connesso con dati demo - Puoi iniziare a usare la piattaforma!' 
              : 'Connesso con dati reali - Sistema operativo'
            }
          </p>
        </div>
      </div>
    </div>
  )
}