'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ROIResults {
  employees: number
  annualFiscalLimit: number
  monthlyRecommended: number
  annualTaxSavings: number
  employerTaxSavings: number
  totalSavings: number
  platformCostEstimate: number
  netROI: number
  roiPercentage: number
  recommendation: {
    level: 'excellent' | 'good' | 'viable' | 'consider'
    message: string
    icon: string
  }
}

export default function ROICalculatorPage() {
  const [employeeCount, setEmployeeCount] = useState<number>(5)
  const [averageSalary, setAverageSalary] = useState<number>(35000)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1)
  const [results, setResults] = useState<ROIResults | null>(null)

  const calculateROI = (employees: number, avgSalary: number, month: number): ROIResults => {
    // Fiscal calculations
    const monthsRemaining = 13 - month // From current month to end of year
    const annualFiscalLimit = employees * 258.23
    const proportionalLimit = (annualFiscalLimit * monthsRemaining) / 12
    const monthlyRecommended = Math.round(proportionalLimit / monthsRemaining)

    // Tax savings calculations
    const employeeTaxRate = 0.22 // IRPEF 22%
    const employerTaxRate = 0.10 // INPS savings estimate
    
    const annualTaxSavings = annualFiscalLimit * employeeTaxRate
    const employerTaxSavings = annualFiscalLimit * employerTaxRate
    const totalSavings = annualTaxSavings + employerTaxSavings

    // Platform cost estimate (conservative 8% commission)
    const platformCostEstimate = annualFiscalLimit * 0.08

    // ROI calculation
    const netROI = totalSavings - platformCostEstimate
    const roiPercentage = (netROI / platformCostEstimate) * 100

    // Recommendation logic
    let recommendation: ROIResults['recommendation']
    
    if (employees >= 10 && roiPercentage > 200) {
      recommendation = {
        level: 'excellent',
        message: 'Perfetto! Il welfare conviene enormemente alla tua azienda. ROI eccellente e massimi vantaggi fiscali.',
        icon: '🚀'
      }
    } else if (employees >= 5 && roiPercentage > 150) {
      recommendation = {
        level: 'good', 
        message: 'Ottima scelta! Il welfare ti farà risparmiare significativamente su tasse e contributi.',
        icon: '✅'
      }
    } else if (employees >= 3 && roiPercentage > 100) {
      recommendation = {
        level: 'viable',
        message: 'Buona opportunità! Il welfare può portare vantaggi fiscali interessanti alla tua azienda.',
        icon: '💡'
      }
    } else {
      recommendation = {
        level: 'consider',
        message: 'Da valutare. Con pochi dipendenti i vantaggi sono limitati, ma comunque presenti.',
        icon: '🤔'
      }
    }

    return {
      employees,
      annualFiscalLimit: Math.round(annualFiscalLimit * 100) / 100,
      monthlyRecommended,
      annualTaxSavings: Math.round(annualTaxSavings * 100) / 100,
      employerTaxSavings: Math.round(employerTaxSavings * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      platformCostEstimate: Math.round(platformCostEstimate * 100) / 100,
      netROI: Math.round(netROI * 100) / 100,
      roiPercentage: Math.round(roiPercentage),
      recommendation
    }
  }

  useEffect(() => {
    const newResults = calculateROI(employeeCount, averageSalary, currentMonth)
    setResults(newResults)
  }, [employeeCount, averageSalary, currentMonth])

  const getRecommendationStyle = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'good':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'viable':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const companyExamples = [
    { employees: 3, name: "Startup Tech", savings: "€619" },
    { employees: 8, name: "Agenzia Marketing", savings: "€1.656" },
    { employees: 15, name: "Studio Professionale", savings: "€3.105" },
    { employees: 25, name: "PMI Manifatturiera", savings: "€5.175" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              EasyWelfare
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/aziende" className="text-gray-600 hover:text-blue-600">
                Per Aziende
              </Link>
              <Link href="/prezzi" className="text-gray-600 hover:text-blue-600">
                Prezzi
              </Link>
              <Link href="/demo" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Prova Demo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Calcolatore ROI Welfare
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scopri quanto può risparmiare la tua azienda con il welfare aziendale. 
            Calcolo personalizzato basato sul numero di dipendenti e normativa italiana 2024.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator Input */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🏢 Dati della tua Azienda
            </h2>
            
            <div className="space-y-6">
              {/* Employee Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👥 Numero Dipendenti
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {employeeCount} dipendenti
                  </span>
                </div>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">🎯 Esempi Rapidi:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[3, 5, 10, 20].map(count => (
                    <button
                      key={count}
                      onClick={() => setEmployeeCount(count)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        employeeCount === count 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {count} dip.
                    </button>
                  ))}
                </div>
              </div>

              {/* Average Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Stipendio Medio Annuale
                </label>
                <select
                  value={averageSalary}
                  onChange={(e) => setAverageSalary(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25000}>€25.000 - Junior</option>
                  <option value={35000}>€35.000 - Standard</option>
                  <option value={45000}>€45.000 - Senior</option>
                  <option value={60000}>€60.000 - Executive</option>
                </select>
              </div>

              {/* Current Month for proportional calculation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Mese di Inizio (per calcolo proporzionale)
                </label>
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2024, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📈 I tuoi Risultati
            </h2>

            {results && (
              <div className="space-y-6">
                {/* Main ROI Result */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl text-white">
                  <div className="text-3xl font-bold mb-2">
                    ROI: {results.roiPercentage > 0 ? '+' : ''}{results.roiPercentage}%
                  </div>
                  <div className="text-blue-100">
                    Risparmio netto annuale: €{results.netROI.toLocaleString()}
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-lg border-2 ${getRecommendationStyle(results.recommendation.level)}`}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{results.recommendation.icon}</span>
                    <h3 className="font-bold text-lg">Raccomandazione</h3>
                  </div>
                  <p className="text-sm">{results.recommendation.message}</p>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 text-sm font-medium">Limite Fiscale</div>
                    <div className="text-2xl font-bold text-green-700">
                      €{results.annualFiscalLimit.toLocaleString()}
                    </div>
                    <div className="text-green-600 text-xs">
                      €{(results.annualFiscalLimit / results.employees).toFixed(2)} per dipendente
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium">Risparmio Fiscale</div>
                    <div className="text-2xl font-bold text-blue-700">
                      €{results.totalSavings.toLocaleString()}
                    </div>
                    <div className="text-blue-600 text-xs">
                      IRPEF + INPS risparmiati
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-purple-600 text-sm font-medium">Costo Piattaforma</div>
                    <div className="text-2xl font-bold text-purple-700">
                      €{results.platformCostEstimate.toLocaleString()}
                    </div>
                    <div className="text-purple-600 text-xs">
                      Commissioni stimate (8%)
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-yellow-600 text-sm font-medium">Budget Mensile</div>
                    <div className="text-2xl font-bold text-yellow-700">
                      €{results.monthlyRecommended.toLocaleString()}
                    </div>
                    <div className="text-yellow-600 text-xs">
                      Consigliato per quest&apos;anno
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/demo"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
                  >
                    🚀 Prova la Demo Gratuita
                  </Link>
                  <Link
                    href="/aziende"
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block"
                  >
                    📋 Scopri di Più
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            💼 Esempi di Aziende come la Tua
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyExamples.map((example, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setEmployeeCount(example.employees)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏢</div>
                  <h3 className="font-bold text-gray-900">{example.name}</h3>
                  <p className="text-gray-600 text-sm">{example.employees} dipendenti</p>
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <div className="text-green-600 text-sm">Risparmio annuale</div>
                    <div className="text-green-700 font-bold">{example.savings}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">📋 Note Legali</h3>
          <p className="text-gray-600 text-sm">
            I calcoli sono basati sulla normativa italiana 2024 (Art. 51 TUIR) con limite di €258.23 per dipendente.
            Le stime sono indicative e possono variare in base alla situazione specifica dell&apos;azienda.
            Per consulenza fiscale dettagliata, consulta il tuo commercialista.
          </p>
        </div>
      </div>
    </div>
  )
}