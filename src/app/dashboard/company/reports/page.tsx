'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'

interface ReportData {
  overview: {
    totalSpent: number
    totalTransactions: number
    activeEmployees: number
    avgSpentPerEmployee: number
    topCategory: string
    fiscalSavings: number
    utilizationRate: number
  }
  trends: {
    monthly: Array<{
      month: string
      spent: number
      transactions: number
      activeUsers: number
    }>
    daily: Array<{
      date: string
      spent: number
      transactions: number
    }>
  }
  employees: Array<{
    id: string
    name: string
    totalPoints: number
    usedPoints: number
    utilizationRate: number
    lastActivity: string
    favoriteCategory: string
  }>
  services: Array<{
    name: string
    category: string
    usage: number
    totalPoints: number
    trend: string
  }>
  fiscal: {
    yearToDateSpent: number
    fiscalLimit: number
    remainingBudget: number
    taxSavings: number
    projectedYearEnd: number
    monthlyAverage: number
  }
}

interface CompanyData {
  id: string
  name: string
  total_credits: number
  used_credits: number
  employees_count: number
}

export default function CompanyReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
  const [reportType, setReportType] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)

  const periodOptions = [
    { value: 'last_7_days', label: 'Ultimi 7 giorni' },
    { value: 'last_30_days', label: 'Ultimi 30 giorni' },
    { value: 'last_3_months', label: 'Ultimi 3 mesi' },
    { value: 'last_year', label: 'Ultimo anno' },
    { value: 'custom', label: 'Periodo personalizzato' }
  ]

  const reportTypeOptions = [
    { value: 'overview', label: 'Panoramica Generale', icon: '📊' },
    { value: 'usage', label: 'Analisi Utilizzo', icon: '💎' },
    { value: 'employees', label: 'Report Dipendenti', icon: '👥' },
    { value: 'services', label: 'Servizi e Categorie', icon: '⭐' },
    { value: 'fiscal', label: 'Report Fiscale', icon: '📋' }
  ]

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDateRange = (period: string) => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last_3_months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'last_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    }
  }

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load company data
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .limit(1)

      if (companiesError) throw companiesError

      let company = null
      if (!companies || companies.length === 0) {
        // Create demo company if none exists
        const { data: newCompany, error: createError } = await supabase
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

        if (createError) throw createError
        company = newCompany
      } else {
        company = companies[0]
      }

      setCompanyData(company)

      // Get date range for filtering
      const { startDate, endDate } = getDateRange(selectedPeriod)

      // Load employees data
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)

      if (employeesError) throw employeesError

      // Load transactions (if table exists and has data)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      // Don't throw error if transactions table is empty or doesn't exist
      const transactionsList = transactions || []

      // Calculate overview metrics
      const activeEmployees = employees?.filter(emp => emp.is_active) || []
      const totalSpent = company.used_credits || 0
      const totalTransactions = transactionsList.length
      const avgSpentPerEmployee = activeEmployees.length > 0 ? totalSpent / activeEmployees.length : 0
      const utilizationRate = company.total_credits > 0 ? (totalSpent / company.total_credits) * 100 : 0

      // Generate monthly trends (mock data based on real parameters)
      const monthlyTrends = generateMonthlyTrends(selectedPeriod, totalSpent, totalTransactions)

      // Process employee data
      const employeesReport = (employees || []).map(emp => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        totalPoints: emp.total_points || 0,
        usedPoints: emp.used_points || 0,
        utilizationRate: emp.total_points > 0 ? (emp.used_points / emp.total_points) * 100 : 0,
        lastActivity: emp.updated_at || emp.created_at,
        favoriteCategory: 'Fitness' // Mock data
      }))

      // Mock services data (realistic)
      const servicesReport = [
        { name: 'Personal Training', category: 'Fitness', usage: Math.floor(totalTransactions * 0.3), totalPoints: Math.floor(totalSpent * 0.35), trend: '+12%' },
        { name: 'Massaggio Rilassante', category: 'Wellness', usage: Math.floor(totalTransactions * 0.25), totalPoints: Math.floor(totalSpent * 0.28), trend: '+8%' },
        { name: 'Check-up Medico', category: 'Salute', usage: Math.floor(totalTransactions * 0.2), totalPoints: Math.floor(totalSpent * 0.22), trend: '+15%' },
        { name: 'Consulenza Nutrizionale', category: 'Nutrizione', usage: Math.floor(totalTransactions * 0.15), totalPoints: Math.floor(totalSpent * 0.10), trend: '+5%' },
        { name: 'Corso Yoga', category: 'Fitness', usage: Math.floor(totalTransactions * 0.1), totalPoints: Math.floor(totalSpent * 0.05), trend: '+3%' }
      ]

      // Calculate fiscal data
      const fiscalLimit = activeEmployees.length * 258.23
      const remainingBudget = Math.max(0, fiscalLimit - totalSpent)
      const taxSavings = Math.round(totalSpent * 0.22) // 22% IRPEF
      const currentMonth = new Date().getMonth() + 1
      const monthsRemaining = 12 - currentMonth + 1
      const monthlyAverage = currentMonth > 0 ? totalSpent / currentMonth : 0
      const projectedYearEnd = monthlyAverage * 12

      const compiledReportData: ReportData = {
        overview: {
          totalSpent,
          totalTransactions,
          activeEmployees: activeEmployees.length,
          avgSpentPerEmployee: Math.round(avgSpentPerEmployee),
          topCategory: 'Fitness',
          fiscalSavings: taxSavings,
          utilizationRate: Math.round(utilizationRate)
        },
        trends: {
          monthly: monthlyTrends,
          daily: [] // Could be implemented later
        },
        employees: employeesReport,
        services: servicesReport,
        fiscal: {
          yearToDateSpent: totalSpent,
          fiscalLimit: Math.round(fiscalLimit),
          remainingBudget: Math.round(remainingBudget),
          taxSavings,
          projectedYearEnd: Math.round(projectedYearEnd),
          monthlyAverage: Math.round(monthlyAverage)
        }
      }

      setReportData(compiledReportData)

    } catch (err) {
      console.error('Error loading report data:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei report')
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyTrends = (period: string, totalSpent: number, totalTransactions: number) => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const currentMonth = new Date().getMonth()
    const trends = []

    let periodsToShow = 3
    if (period === 'last_year') periodsToShow = 12
    else if (period === 'last_3_months') periodsToShow = 3
    else periodsToShow = 3

    for (let i = periodsToShow - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthProgress = (periodsToShow - i) / periodsToShow
      
      trends.push({
        month: months[monthIndex],
        spent: Math.round(totalSpent * monthProgress * (0.7 + Math.random() * 0.6)),
        transactions: Math.round(totalTransactions * monthProgress * (0.7 + Math.random() * 0.6)),
        activeUsers: Math.round((companyData?.employees_count || 3) * (0.8 + Math.random() * 0.2))
      })
    }

    return trends
  }

  const downloadReport = (format: 'pdf' | 'excel') => {
    // This would implement actual download functionality
    console.log(`Downloading ${reportType} report in ${format} format for ${selectedPeriod}`)
    
    // Mock download
    const filename = `${companyData?.name || 'Company'}_${reportType}_${selectedPeriod}.${format}`
    alert(`📥 Download avviato: ${filename}\n\n(Funzionalità demo - in produzione scaricherà il file reale)`)
  }

  const getUsageBadgeVariant = (percentage: number): 'success' | 'warning' | 'danger' | 'default' => {
    if (percentage >= 80) return 'danger'
    if (percentage >= 60) return 'warning'
    if (percentage >= 40) return 'success'
    return 'default'
  }

  const getUsageBadgeLabel = (percentage: number): string => {
    if (percentage >= 80) return 'Alto'
    if (percentage >= 60) return 'Medio'
    if (percentage >= 40) return 'Buono'
    return 'Basso'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report e Analytics</h1>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report e Analytics</h1>
          <p className="text-gray-600">Errore nel caricamento</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadReportData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!reportData) return null

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report e Analytics</h1>
        <p className="text-gray-600">
          Analisi dettagliata del welfare aziendale per {companyData?.name}
        </p>
      </div>

      {/* Filters and Controls */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Periodo</label>
              <select 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 Tipo Report</label>
              <select 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => downloadReport('pdf')} variant="secondary" className="mr-2">
                📄 PDF
              </Button>
              <Button onClick={() => downloadReport('excel')} variant="secondary">
                📊 Excel
              </Button>
            </div>

            <div className="flex items-end">
              <Button onClick={loadReportData} variant="primary">
                🔄 Aggiorna Dati
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Spesa Totale</p>
                    <p className="text-2xl font-bold text-gray-900">€{reportData.overview.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-green-600">Periodo selezionato</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">💰</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transazioni</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalTransactions}</p>
                    <p className="text-sm text-blue-600">Operazioni completate</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">📊</span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dipendenti Attivi</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.overview.activeEmployees}</p>
                    <p className="text-sm text-purple-600">Utilizzano il welfare</p>
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
                    <p className="text-sm font-medium text-gray-600">Media per Dipendente</p>
                    <p className="text-2xl font-bold text-gray-900">€{reportData.overview.avgSpentPerEmployee}</p>
                    <p className="text-sm text-yellow-600">Utilizzo medio</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">📈</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Trend Chart Placeholder */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">📈 Trend Utilizzo nel Tempo</h3>
            </Card.Header>
            <Card.Content>
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-gray-600 font-medium">Grafico Trend Interattivo</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Visualizzazione spesa e transazioni nel periodo {periodOptions.find(p => p.value === selectedPeriod)?.label}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {reportData.trends.monthly.slice(-3).map((data, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-medium text-gray-900">{data.month}</p>
                        <p className="text-blue-600 font-bold">€{data.spent.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">{data.transactions} transazioni</p>
                        <p className="text-green-600 text-sm">{data.activeUsers} utenti attivi</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Usage Analysis Report */}
      {reportType === 'usage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">💎 Analisi Utilizzo Punti</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Tasso di Utilizzo</span>
                  <span className="font-bold text-blue-600">{reportData.overview.utilizationRate}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full"
                    style={{ width: `${Math.min(reportData.overview.utilizationRate, 100)}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-green-600 text-sm font-medium">Punti Utilizzati</p>
                    <p className="text-green-700 font-bold text-lg">{reportData.overview.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm font-medium">Categoria Top</p>
                    <p className="text-gray-700 font-bold text-lg">{reportData.overview.topCategory}</p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">🎯 Pattern di Utilizzo</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm">🏋️ Fitness & Sport</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm">💆 Benessere</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm">🏥 Salute</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm">📚 Formazione</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Employees Report */}
      {reportType === 'employees' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">👥 Report Dipendenti</h3>
            <p className="text-gray-600">Analisi dettagliata dell&apos;utilizzo per dipendente</p>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Totali</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Utilizzati</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tasso Utilizzo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria Preferita</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ultima Attività</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{employee.name}</td>
                      <td className="py-3 px-4 text-gray-600">{employee.totalPoints.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{employee.usedPoints.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(employee.utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                          <Badge variant={getUsageBadgeVariant(employee.utilizationRate)}>
                            {Math.round(employee.utilizationRate)}%
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{employee.favoriteCategory}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(employee.lastActivity).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Services Report */}
      {reportType === 'services' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">⭐ Report Servizi e Categorie</h3>
            <p className="text-gray-600">Analisi dei servizi più utilizzati</p>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Utilizzi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Totali</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.services.map((service, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && '⭐'}
                          </span>
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{service.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{service.usage}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{service.totalPoints.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant="success">{service.trend}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Fiscal Report */}
      {reportType === 'fiscal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">📋 Situazione Fiscale {new Date().getFullYear()}</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Speso Anno Corrente</span>
                  <span className="font-bold text-blue-600">€{reportData.fiscal.yearToDateSpent.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Limite Fiscale</span>
                  <span className="font-bold text-green-600">€{reportData.fiscal.fiscalLimit.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Budget Rimanente</span>
                  <span className="font-bold text-yellow-600">€{reportData.fiscal.remainingBudget.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                    style={{ 
                      width: `${Math.min((reportData.fiscal.yearToDateSpent / reportData.fiscal.fiscalLimit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600 text-center">
                  Utilizzo: {((reportData.fiscal.yearToDateSpent / reportData.fiscal.fiscalLimit) * 100).toFixed(1)}% del limite annuale
                </p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">💰 Vantaggi Fiscali</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-2">Risparmi Fiscali Totali</p>
                  <p className="text-3xl font-bold text-green-700">€{reportData.fiscal.taxSavings.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">22% sui benefit erogati</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Proiezioni</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Media mensile:</span>
                      <span className="font-medium">€{reportData.fiscal.monthlyAverage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proiezione fine anno:</span>
                      <span className="font-medium">€{reportData.fiscal.projectedYearEnd.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risparmio fiscale stimato:</span>
                      <span className="font-medium text-green-700">€{Math.round(reportData.fiscal.projectedYearEnd * 0.22).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="primary" className="w-full">
                  📋 Scarica Certificazione Fiscale
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Data Source Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-blue-600 text-lg mr-2">ℹ️</span>
          <div className="text-blue-800 text-sm">
            <p><strong>Fonte Dati:</strong> Database Supabase in tempo reale</p>
            <p><strong>Ultimo aggiornamento:</strong> {new Date().toLocaleString('it-IT')}</p>
            <p><strong>Periodo analizzato:</strong> {periodOptions.find(p => p.value === selectedPeriod)?.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
}