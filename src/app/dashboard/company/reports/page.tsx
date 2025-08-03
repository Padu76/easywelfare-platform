'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'

export default function CompanyReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
  const [reportType, setReportType] = useState('overview')

  const periodOptions = [
    { value: 'last_7_days', label: 'Ultimi 7 giorni' },
    { value: 'last_30_days', label: 'Ultimi 30 giorni' },
    { value: 'last_3_months', label: 'Ultimi 3 mesi' },
    { value: 'last_year', label: 'Ultimo anno' },
    { value: 'custom', label: 'Periodo personalizzato' }
  ]

  const reportTypeOptions = [
    { value: 'overview', label: 'Panoramica Generale', icon: '📊' },
    { value: 'usage', label: 'Utilizzo Punti', icon: '💎' },
    { value: 'employees', label: 'Report Dipendenti', icon: '👥' },
    { value: 'services', label: 'Servizi Più Utilizzati', icon: '⭐' },
    { value: 'fiscal', label: 'Report Fiscale', icon: '📋' }
  ]

  const overviewStats = {
    totalSpent: 8750,
    totalTransactions: 127,
    activeEmployees: 42,
    avgSpentPerEmployee: 208,
    topCategory: 'Fitness',
    savingsGenerated: 2100
  }

  const topServices = [
    { name: 'Personal Training', usage: 45, points: 9000, trend: '+12%' },
    { name: 'Massaggio Rilassante', usage: 38, points: 5700, trend: '+8%' },
    { name: 'Consulenza Nutrizionale', usage: 25, points: 2500, trend: '+15%' },
    { name: 'Corso Yoga', usage: 22, points: 1760, trend: '+5%' },
    { name: 'Check-up Medico', usage: 18, points: 5400, trend: '+20%' }
  ]

  const employeeUsageData = [
    { name: 'Mario Rossi', totalPoints: 1000, usedPoints: 750, percentage: 75, lastActivity: '2 giorni fa' },
    { name: 'Giulia Bianchi', totalPoints: 1000, usedPoints: 650, percentage: 65, lastActivity: '1 giorno fa' },
    { name: 'Luca Verdi', totalPoints: 500, usedPoints: 350, percentage: 70, lastActivity: '3 giorni fa' },
    { name: 'Anna Neri', totalPoints: 1000, usedPoints: 200, percentage: 20, lastActivity: '1 settimana fa' },
    { name: 'Francesco Blu', totalPoints: 800, usedPoints: 600, percentage: 75, lastActivity: '1 giorno fa' }
  ]

  const monthlyTrend = [
    { month: 'Gen', spent: 5200, transactions: 78 },
    { month: 'Feb', spent: 6800, transactions: 95 },
    { month: 'Mar', spent: 8750, transactions: 127 },
  ]

  const fiscalData = {
    yearToDateSpent: 20750,
    maxAllowedPerYear: 35000,
    remainingBudget: 14250,
    taxSavings: 4560,
    projectedYearEndSpent: 28000
  }

  const downloadReport = (format: 'pdf' | 'excel') => {
    console.log(`Downloading ${reportType} report in ${format} format for ${selectedPeriod}`)
    // Here would be actual download logic
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-green-600'
    return 'text-gray-600'
  }

  const getUsageBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: 'danger' as const, label: 'Alto' }
    if (percentage >= 60) return { variant: 'warning' as const, label: 'Medio' }
    if (percentage >= 40) return { variant: 'success' as const, label: 'Buono' }
    return { variant: 'default' as const, label: 'Basso' }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report e Analytics</h1>
        <p className="text-gray-600">Analizza l&apos;utilizzo del welfare aziendale e genera report dettagliati</p>
      </div>

      {/* Filters and Controls */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Report</label>
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
            
            <div className="flex items-end space-x-2">
              <Button onClick={() => downloadReport('pdf')} variant="secondary">
                📄 PDF
              </Button>
              <Button onClick={() => downloadReport('excel')} variant="secondary">
                📊 Excel
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Spesa Totale</p>
                    <p className="text-2xl font-bold text-gray-900">€{overviewStats.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+15% vs periodo precedente</p>
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
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.totalTransactions}</p>
                    <p className="text-sm text-green-600">+22% vs periodo precedente</p>
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
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.activeEmployees}</p>
                    <p className="text-sm text-yellow-600">93% dei dipendenti totali</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">👥</span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Monthly Trend Chart Placeholder */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Trend Mensile</h3>
            </Card.Header>
            <Card.Content>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">📈</span>
                  <p className="text-gray-600">Grafico trend spesa mensile</p>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    {monthlyTrend.map((data, index) => (
                      <div key={index} className="bg-white p-3 rounded">
                        <p className="font-medium">{data.month}</p>
                        <p className="text-blue-600">€{data.spent.toLocaleString()}</p>
                        <p className="text-gray-500">{data.transactions} transazioni</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Services Report */}
      {reportType === 'services' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Servizi Più Utilizzati</h3>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Servizio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Utilizzi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Totali</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topServices.map((service, index) => (
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
                      <td className="py-3 px-4 font-semibold text-blue-600">{service.usage}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{service.points.toLocaleString()}</td>
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

      {/* Employee Usage Report */}
      {reportType === 'employees' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Utilizzo per Dipendente</h3>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dipendente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Totali</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Punti Utilizzati</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Utilizzo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ultima Attività</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeUsageData.map((employee, index) => {
                    const usageBadge = getUsageBadge(employee.percentage)
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{employee.name}</td>
                        <td className="py-3 px-4 text-gray-600">{employee.totalPoints.toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-blue-600">{employee.usedPoints.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${employee.percentage}%` }}
                              ></div>
                            </div>
                            <Badge variant={usageBadge.variant}>
                              {employee.percentage}%
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{employee.lastActivity}</td>
                      </tr>
                    )
                  })}
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
              <h3 className="text-lg font-semibold text-gray-900">Situazione Fiscale Anno Corrente</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Speso Anno Corrente</span>
                  <span className="font-bold text-blue-600">€{fiscalData.yearToDateSpent.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Limite Annuale</span>
                  <span className="font-bold text-green-600">€{fiscalData.maxAllowedPerYear.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Budget Rimanente</span>
                  <span className="font-bold text-yellow-600">€{fiscalData.remainingBudget.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                    style={{ width: `${(fiscalData.yearToDateSpent / fiscalData.maxAllowedPerYear) * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600 text-center">
                  Utilizzo: {((fiscalData.yearToDateSpent / fiscalData.maxAllowedPerYear) * 100).toFixed(1)}% del limite annuale
                </p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Vantaggi Fiscali</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-2">Risparmi Fiscali Totali</p>
                  <p className="text-3xl font-bold text-green-700">€{fiscalData.taxSavings.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">22% sui benefit erogati</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Raccomandazioni</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Puoi spendere ancora €{fiscalData.remainingBudget.toLocaleString()} senza tasse</li>
                    <li>• Proiezione fine anno: €{fiscalData.projectedYearEndSpent.toLocaleString()}</li>
                    <li>• Risparmio fiscale stimato: €{Math.round(fiscalData.projectedYearEndSpent * 0.22).toLocaleString()}</li>
                  </ul>
                </div>
                
                <Button variant="secondary" className="w-full">
                  📋 Scarica Certificazione Fiscale
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  )
}